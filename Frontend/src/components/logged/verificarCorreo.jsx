import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { verificarEmail } from "../../services/userServices";
import { useAuth } from "../../context/useAuth";

function VerificarCorreo() {
  const { token } = useParams();
  const [mensaje, setMensaje] = useState("verificando...");
  const [estado, setEstado] = useState("verificando");
  const { setUsuario } = useAuth();

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await verificarEmail(token);
        setMensaje(res.message || "Correo verificado con éxito.");
        setEstado("exito");
        setUsuario((prev) => {
          const nuevo = { ...prev, isVerified: true };
          
          localStorage.setItem("usuarioVerificado", "true");
          return nuevo;
        });
      } catch (error) {
        console.error(error);
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al verificar el correo.";
        setMensaje(msg);
        setEstado("error");
      }
    };
    verificar();
  }, [token]);

  return (
    <>
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        {estado === "verificando" && (
          <p className="alert alert-info" role="alert">
            {mensaje}
          </p>
        )}
        {estado === "exito" && (
          <h2 className="alert alert-success" role="alert">
            {mensaje}
          </h2>
        )}
        {estado === "error" && (
          <h2 className="alert alert-danger" role="alert">
            {mensaje}
          </h2>
        )}
      </div>
    </>
  );
}

export default VerificarCorreo;
