import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";


function ProtectedRoute({children}){
    const {usuario} = useAuth()
    const navigate = useNavigate()

    useEffect(() =>{
        if(!usuario){
            navigate("/login")
        }else if (usuario.isVerified === false){
            navigate("/verificar-correo-pendiente")
        }
    },[usuario, navigate])


    if(!usuario || usuario.isVerified === false){
        return null
    }

    return children
}

export default ProtectedRoute;