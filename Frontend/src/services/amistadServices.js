import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const URL = `${API_URL}/api/amigos`;

const obtenerEstadoAmistad = async (receptorId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${URL}/${receptorId}/estado`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.estado;
  } catch (error) {
    console.error("Error al obtener estado de amistad:", error);
    throw error;
  }
};

const obtenerSolicitudes = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${URL}/solicitudes-pendientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener solicitudes pendientes:", error);
    throw error;
  }
};

const obtenerSolicitudesEnviadas = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${URL}/solicitudes-pendientes?tipo=enviadas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener solicitudes Enviadas:", error);
    throw error;
  }
};

const enviarSolicitud = async (receptorId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${URL}/${receptorId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    throw error;
  }
};

const aceptarSolicitud = async (solicitudId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(`${URL}/${solicitudId}/aceptar`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
    throw error;
  }
};
const rechazarSolicitud = async (solicitudId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(`${URL}/${solicitudId}/rechazar`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    throw error;
  }
};

const cancelarSolicitud = async (solicitudId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${URL}/${solicitudId}/cancelar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al cancelar solicitud:", error);
    throw error;
  }
};

const obtenerAmigos = async (nombre, apellido) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${URL}`, {
     params: {
              nombre,
              apellido,
            },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return res.data;
    } catch (error) {
        console.error("Error al obtener amigos:", error);
    throw error;
    }
  
};



const obtenerCantidadSolicitudes = async() =>{
  const token = localStorage.getItem("token")
  const res = await axios.get(`${URL}/count`, {
    headers: {
      Authorization: `Bearer ${token}` 
    }
  })
  return res.data.cantidad;
}

export {
  obtenerEstadoAmistad,
  obtenerSolicitudes,
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  obtenerSolicitudesEnviadas,
  cancelarSolicitud,
  obtenerAmigos,
  obtenerCantidadSolicitudes
};
