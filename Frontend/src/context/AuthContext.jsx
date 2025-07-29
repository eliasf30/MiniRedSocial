import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState, useEffect } from "react";
import formatearNombre from "../utils/formatearNombre";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

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
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
