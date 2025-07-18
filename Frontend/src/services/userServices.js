import axios from "axios";
const URL = "http://localhost:5000/api/auth";

export const registrarUsuario = async(userData) =>{
    try{ 
        const response = await axios.post(`${URL}/register`, userData);
        return response.data

    }catch(error){
        console.log(error)
          throw error.response?.data || new Error("Error en el registro");
    }
}

export default {registrarUsuario}