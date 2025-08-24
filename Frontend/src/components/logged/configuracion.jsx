import { useState,useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { cambiarPrivacidadPerfil, cambiarVisibilidadEmail } from "../../services/userServices";

function Configuracion() {
  const {darkMode, setDarkMode, usuario, setUsuario,colorTema, cambiarColorTema,coloresNavbar } = useAuth()
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [perfilPrivado, setPerfilPrivado] = useState(false);

 useEffect(() => {
  if (usuario) {
    
    setMostrarEmail(Boolean(usuario.EmailVisible));
    setPerfilPrivado(Boolean(usuario.PerfilPrivado));
  }
}, [usuario]);

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMostrarEmail = async (e) => {
    const nuevoValor = e.target.checked;
    try {
        
        setMostrarEmail(nuevoValor)
        const res = await cambiarVisibilidadEmail(nuevoValor)

       setUsuario(prev => ({
      ...prev,
      EmailVisible: res.data.EmailVisible
    }));

     
    } catch (error) {
        console.error("Error al cambiar visibilidad:", error);
        setMostrarEmail(prev => !prev);
    }
    
    
  };

  const handlePerfilPrivado = async (e) =>{
    const nuevoValor = e.target.checked;
    try {
        setPerfilPrivado(nuevoValor)
        const res = await cambiarPrivacidadPerfil(nuevoValor)
          setUsuario(prev => ({
      ...prev,
      PerfilPrivado: res.data.PerfilPrivado
    }));
    } catch (error) {
         console.error("Error al cambiar privacidad:", error);
        setPerfilPrivado(prev => !prev);
    }
  }

const disabled = !usuario;

  return (
    <>
      <div
        className="contenedor-principal configuracion"
        style={{ position: "relative" }}
      >
        <h4 className="mb-5 mt-2 ">Configuracion:</h4>

        <div className="opcion-config mb-4 w-75 ">
          <label className="flex justify-content-start gap-2 cursor-pointer ">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkMode}
              disabled={disabled}
            />
            <span className="ms-1">Modo oscuro</span>
          </label>
        </div>
         <div className="opcion-config w-75 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={mostrarEmail}
            onChange={handleMostrarEmail}
            disabled={disabled}
          />
          <span className="ms-1">Mostrar mi email en mi perfil</span>
        </label>
      </div>
      <div className="opcion-config w-75 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={perfilPrivado}
            onChange={handlePerfilPrivado}
            disabled={disabled}
          />
          <span className="ms-1">Publicaciones privadas (solo amigos)</span>
        </label>
      </div>
      <div className="opcion-config w-75 mb-4">
  <label className="mb-2">esquema de colores: </label>
  <div className="d-flex gap-2 flex-wrap">
    {["default","neon","morado","celeste","verde","rosa","amarillo","azul","rojo","naranja"].map((color) => (
  <button
    key={color}
    onClick={() => cambiarColorTema(color)}
    style={{
      backgroundColor: darkMode ? coloresNavbar.oscuro[color] : coloresNavbar.claro[color],
      border: colorTema === color ? "2px solid #000" : "1px solid #ccc",
      width: "50px",
      height: "50px",
      borderRadius: "20%",
      cursor: "pointer"
    }}
  />
))}
  </div>
</div>
      </div>
    </>
  );
}

export default Configuracion;
