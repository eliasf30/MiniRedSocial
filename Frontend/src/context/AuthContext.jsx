import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState, useEffect } from "react";
import formatearNombre from "../utils/formatearNombre";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  })

  const [colorTema, setColorTema] = useState("default");


 const coloresNavbar = {
  claro: {
    default: "#f8f9fa",   
    neon: "#39ff14",
    morado: "#9b59b6",
    celeste: "#1abc9c",
    verde: "#2ecc71",
    rosa: "#ff69b4",
    amarillo: "#f1c40f",
    azul: "#3498db",       
    rojo: "#ff073a",       
    naranja: "#e67e22"     
  },
  oscuro: {
    default: "#1c1c1c",
    neon: "#36e218",
    morado: "#8e44ad",
    celeste: "#16a085",
    verde: "#27ae60",
    rosa: "#e91e63",
    amarillo: "#f39c12",
    azul: "#2980b9",        
    rojo: "#ff073a",        
    naranja: "#d35400"      
  }
};

const cambiarColorTema = (nuevoColor) => {
  setColorTema(nuevoColor);
};



  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
  },[darkMode])


  useEffect(() => {
    if(darkMode){
      document.body.classList.add("dark")
      
    }else {
      document.body.classList.remove("dark");
    }
  },[darkMode])

  useEffect(() => {
  localStorage.setItem("colorTema", colorTema);
}, [colorTema]);

useEffect(() => {
  const temaGuardado = localStorage.getItem("colorTema");
  if (temaGuardado) setColorTema(temaGuardado);
}, []);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const usuarioFormateado = {
          ...decoded,
          nombre: formatearNombre(decoded.nombre),
          apellido: formatearNombre(decoded.apellido),
        };

        setUsuario(usuarioFormateado);
      } catch (error) {
        console.error("token invalido");
        setUsuario(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);

    const usuarioFormateado = {
    ...decoded,
    nombre: formatearNombre(decoded.nombre),
    apellido: formatearNombre(decoded.apellido),
  };


    setUsuario(usuarioFormateado);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };



  return (
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout, darkMode, setDarkMode, coloresNavbar,cambiarColorTema,colorTema }}>
      {children}
    </AuthContext.Provider>
  );
}
