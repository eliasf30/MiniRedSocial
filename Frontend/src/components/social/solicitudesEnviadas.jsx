import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import {
  cancelarSolicitud,
  obtenerSolicitudesEnviadas,
} from "../../services/amistadServices";
import "../../App.css";
import { useAuth } from "../../context/useAuth";

function SolicitudesEnviadas() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const URL = import.meta.env.VITE_API_URL;
  const { darkMode } = useAuth();

  const manejarCancelar = async (solicitudId) => {
    await cancelarSolicitud(solicitudId);
    setSolicitudes(solicitudes.filter((s) => s.id !== solicitudId));
  };

  useEffect(() => {
    const obtener = async () => {
      try {
        setLoading(true);
        const resultado = await obtenerSolicitudesEnviadas();

        const falsas = Array.from({ length: 12 }, (_, i) => ({
          id: i + 10,
          receptor: {
            nombre: `Persona ${i}`,
            apellido: `Apellido`,
            descripcion: `Descripción ${i}`,
            avatar: null,
          },
        }));
        // setSolicitudes([...resultado, ...falsas]);

        setSolicitudes(resultado);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    obtener();
  }, []);

  return (
    <>
      <div
        className="contenedor-principal contenedor-amigos"
        style={{ position: "relative" }}
      >
        <h3 className="mb-1 mt-5 text-muted">Solicitudes Enviadas:</h3>
        <button
          className="btn btn-secondary btn-smbnv "
          style={{ position: "absolute", right: "15px", top: "1rem" }}
          onClick={() => navigate("/Solicitudes-pendientes")}
        >
          Solicitudes Recibidas
        </button>
        {loading ? (
          <p className="mt-4 text-muted">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="mt-4 text-muted">
            No hay solicitudes enviadas pendientes
          </p>
        ) : (
          <div className="col mt-2 w-100">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className={`card m-2 mt-4 p-3 shadow-sm w-100 ${
                  darkMode ? "dark-style border-secondary" : ""
                }`}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={
                      solicitud.receptor.avatar
                        ? `${solicitud.receptor.avatar}`
                        : preview
                    }
                    alt="Foto de perfil"
                    className="rounded-circle me-3"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <h5 className="mb-1">
                      {" "}
                      {formatearNombre(solicitud.receptor.nombre)}{" "}
                      {formatearNombre(solicitud.receptor.apellido)}
                    </h5>
                    <p
                      className="text-muted mb-1 descripcion-usuario"
                      style={{ fontSize: "0.9em" }}
                    >
                      {solicitud.receptor.descripcion || "Sin descripción"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 d-flex justify-content-between">
                  <button
                    className={`btn btn-sm ${
                      darkMode ? "btn-outline-darkmode" : "btn-outline-primary"
                    }`}
                    onClick={() =>
                      navigate(`/usuarios/${solicitud.receptor.id}`)
                    }
                  >
                    Ver perfil
                  </button>
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => manejarCancelar(solicitud.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SolicitudesEnviadas;
