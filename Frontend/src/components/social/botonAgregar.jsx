import { useState } from "react";
import { agregarAmigo } from "../../services/userServices";


function BotonAgregar(amigoId, onAdded){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleAdd = async() =>{
        setLoading(true)
        setError(null)
        try {
            await agregarAmigo(amigoId);
            if(onAdded) onAdded()
        } catch (error) {
            setError("No se pudo agregar amigo");
            alert("No se pudo agregar amigo");       
        } finally{
            setLoading(false);
        }
    }

    return(
        <>
        <button onClick={handleAdd} disabled={loading} className="btn btn-sm btn-outline-secondary">
            {loading ? "⏳ Agregando..." : "➕ Agregar amigo"}
        </button>
        </>
    )
}

export default BotonAgregar