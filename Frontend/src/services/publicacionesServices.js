import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const URL = `${API_URL}/api/publicaciones`;

const obtenerFeed = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${URL}/feed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener feed:", error);
    throw error;
  }
};

const crearPublicacion = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear publicacion:", error);
    throw error;
  }
};

const eliminarPublicacion = async (postId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${URL}/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error al Eliminar la publicacion:", error);
    throw error;
  }
};

const obtenerPublicacionesPorUsuario = async (usuarioId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${URL}/usuario/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error al Eliminar la publicacion:", error);
    throw error;
  }
};

const obtenerPublicacionPorId = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error al editar publicación:", error);
    throw error;
  }
};

const editarPublicacion = async (Id, datos) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${URL}/${Id}`, datos, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al editar publicación:", error);
    throw error;
  }
};

export {
  crearPublicacion,
  obtenerFeed,
  eliminarPublicacion,
  obtenerPublicacionesPorUsuario,
  obtenerPublicacionPorId,
  editarPublicacion,
};
