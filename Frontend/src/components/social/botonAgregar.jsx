import { useEffect, useState } from "react";
import { enviarSolicitud, obtenerEstadoAmistad } from "../../services/amistadServices";


function BotonAgregar({amigoId, onAdded}){
    const [loading, setLoading] = useState(false)
    const [estado, setEstado] = useState("CARGANDO")

    useEffect(() =>{
        if (!amigoId) return;
        const obtenerEstado = async() =>{
            try {
                const estadoActual = await obtenerEstadoAmistad(amigoId);
                setEstado(estadoActual || "NINGUNO");
            } catch (error) {
                console.error("Error obteniendo estado de amistad:", error);
                setEstado("NINGUNO");
            }
        };
        obtenerEstado()
    },[amigoId])

    const handleAdd = async() =>{
        setLoading(true)
        try {
            await enviarSolicitud(amigoId);
            setEstado("PENDIENTE");
            if(onAdded) onAdded()
        } catch (error) {
           const mensaje = error.response?.data?.message || "No se pudo agregar amigo"   
           alert(mensaje);
           
        } finally{
            setLoading(false);
        }
    }

    const contenido = () =>{
        if (estado === "CARGANDO") return "⏳ Cargando...";
        if (estado === "PENDIENTE") return "⏳ Pendiente";
        if (estado === "ACEPTADA") return "✅ Ya son amigos";
        return loading ? "⏳ Agregando..." : "➕ Agregar amigo";
    }

    return(
        <>
        <button onClick={handleAdd} disabled={loading || estado === "PENDIENTE" || estado === "ACEPTADA"} className="btn btn-sm btn-outline-secondary">
            {contenido()}
        </button>
        </>
    )
}

export default BotonAgregar