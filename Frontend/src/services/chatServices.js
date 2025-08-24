import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/chat";
const URL = `${API_URL}/api/chat`;
 const obtenerListaChats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${URL}/lista`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener lista de chats:" + error);
    throw error;
  }
};

 const cargarMensajesHistoricos = async (
  emisorId,
  receptorId,
  lastMessageId = null,
  limit = 20
) => {
  try {
    const token = localStorage.getItem("token");

    let url = `${URL}/${emisorId}/${receptorId}?limit=${limit}`;
    if (lastMessageId) url += `&lastMessageId=${lastMessageId}`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error cargando mensajes históricos:", error);
    return [];
  }
};



const subirImagen = (formData) =>{
  return axios.post(`${URL}/subir-imagen`, formData,{
    headers: { "Content-Type": "multipart/form-data" },})
}

export {obtenerListaChats, cargarMensajesHistoricos,subirImagen}