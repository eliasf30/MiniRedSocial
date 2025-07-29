import { useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import { useEffect } from "react";

function Home() {
  const { usuario } = useAuth();
   


  
  return (
    <>
    <div className="contenedor-principal">
      <h3 className="text-muted mt-4">Hola {usuario ? usuario.nombre : "invitado"}, estás logueado</h3>
      </div>
    </>
  );
}

export default Home;