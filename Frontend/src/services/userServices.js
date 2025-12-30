import axios from "axios";




const API_URL = import.meta.env.VITE_API_URL
const URL = `${API_URL}/api/usuarios`; 



const registrarUsuario = async(userData) =>{
    try{ 
        const response = await axios.post(`${URL}/register`, userData);
        return response.data

    }catch(error){
        console.log(error)
          throw error.response?.data || new Error("Error en el registro");
    }
}

const verificarEmail = async(token) =>{
    try {
        const response = await axios.get(`${URL}/verificar-correo/${token}`);
        return response.data;
    } catch (error) {
        console.error("Error al verificar correo:", error);
        throw error;
    }
}

const reenviarEmail = async(email) =>{
    const response = await axios.post(`${URL}/reenviar-verificacion`, { email: email });
    return response.data
}

const loginUsuario = async(data) =>{
    try {
        const response = await axios.post(`${URL}/login`, data)
         
        return response.data;
    } catch (error) {
        console.error("Error en loginUsuario:", error);
        throw error;
    }
}

const modificarPerfil = async(formData) => {
    try {
         const token = localStorage.getItem("token");
        const response = await axios.post(`${URL}/perfil/editar`, formData,{
            headers:{"Content-Type":"multipart/form-data",
            Authorization: `Bearer ${token}`,
            },
        })

        return response.data

    } catch (error) {
        alert("error al conectar con el servidor: " +  (error?.response?.data?.error || error.message))
        throw error
    }
}

const buscarUsuarios = async(query) =>{
    try {
        const response = await axios.get(`${URL}/buscar?query=${encodeURIComponent(query)}`)
        return response
    } catch (error) {
        console.error("error al buscar el usuario", error)
        throw error
    }
}

const obtenerUsuario = async(id) =>{
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${URL}/${id}`,{
             headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        return response.data;
    } catch (error) {
         console.error("error al buscar el usuario", error)
        throw error
    }
}

const agregarAmigo = async(id) =>{
    console.log("agregaste de amigo a la persona con la id: ", id)
}

const cambiarVisibilidadEmail = async (visible) => {

    const token = localStorage.getItem("token")
    const res = await axios.put(`${URL}/mostrar-email`,
        {visible},
        {headers:{Authorization:`Bearer ${token}` }}
    )
    return res
}

const cambiarPrivacidadPerfil = async(estado) =>{
    const token = localStorage.getItem("token")
     const res = await axios.put(`${URL}/perfil-privado`,
        {estado},
        {headers:{Authorization:`Bearer ${token}` }}
    )
    return res
}

export {registrarUsuario, loginUsuario, modificarPerfil,buscarUsuarios, obtenerUsuario, verificarEmail, reenviarEmail, agregarAmigo, cambiarVisibilidadEmail, cambiarPrivacidadPerfil}