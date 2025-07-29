import { useEffect, useState } from "react";
import { set } from "react-hook-form";


function SolicitudesPendientes(){
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    

    if(loading) return <div className="contenedor-principal d-flex justify-content-center align-items-center "><p className="margin-auto">Cargando solicitudes...</p></div>
    if (error) return <p>{error}</p>;
    if(solicitudes.length === 0) return <div className="contenedor-principal"><p className="text-muted mt-5">no hay solicitudes pendientes</p></div>

    return(
        <>
            <div className="contenedor-principal">
                <p> aca van las solicitudes</p>
            </div>
        </>
    )
}

export default SolicitudesPendientes