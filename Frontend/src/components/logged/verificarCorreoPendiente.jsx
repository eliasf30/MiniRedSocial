import { useAuth } from "../../context/useAuth";
import { reenviarEmail } from "../../services/userServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";


function VerificarCorreoPendiente() {

    const {usuario, setUsuario} = useAuth()
    const navigate = useNavigate()
     const [enviando, setEnviando] = useState(false);
     const [enviado, setEnviado] = useState(false);

useEffect(() => {
  if (!usuario) {
    navigate("/");
  } else {
    const verificado = localStorage.getItem("usuarioVerificado");
    if (verificado === "true") {
      setUsuario(prev => ({ ...prev, isVerified: true }));
      localStorage.removeItem("usuarioVerificado");
      navigate("/home");
    } else if (usuario.isVerified === true) {
      navigate("/home");
    }
  }
}, [usuario, navigate, setUsuario]);


    const handleReenviar = async() =>{
        if (enviando) return; 
        setEnviando(true);
        try {
            await reenviarEmail(usuario.email)
            
            setEnviado(true)
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || error?.response?.data?.error || "No se pudo reenviar el correo");
        }finally{
            setEnviando(false)
            
        }
    }

  return (
    <div className="container mt-5 p-4 bg-white rounded shadow text-center " style={{ padding: 20 }}>
      <h2 className="mb-3 text-secondary"> Tu cuenta no está verificada</h2>
      <p>Por favor revisa tu correo y haz click en el enlace para verificar tu cuenta.</p>
      <p className="text-muted mb-4">Si no recibiste el correo, revisa la carpeta de spam o solicita uno nuevo.</p>
      {enviado && <div className="alert alert-info mt-3 text-sm">Correo reenviado. revisa tu bandeja de entrada</div>}
      <button className="btn btn-primary" onClick={handleReenviar} disabled={enviando}>{enviando ? "Enviando..." : "Reenviar correo de verificación"}</button>
      
      
    </div>
  );
}

export default VerificarCorreoPendiente