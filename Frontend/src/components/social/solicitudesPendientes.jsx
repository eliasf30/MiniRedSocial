import { useEffect, useState } from "react";
import {
  aceptarSolicitud,
  obtenerSolicitudes,
  rechazarSolicitud,
} from "../../services/amistadServices";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import { toast } from "react-toastify";

function SolicitudesPendientes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const obtener = async () => {
      try {
        setLoading(true);
        const resultado = await obtenerSolicitudes();

        const falsas = Array.from({ length: 12 }, (_, i) => ({
          id: i + 10,
          emisor: {
            nombre: `Persona ${i}`,
            apellido: `Apellido`,
            descripcion: `Descripción ${i}`,
            avatar: null,
          },
        }));
        //setSolicitudes([...resultado, ...falsas]);
        setSolicitudes(resultado);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    obtener();
  }, []);

  const manejarAceptar = async (solicitudId, nombre) => {
    const nombreFormateado = formatearNombre(nombre);
    await aceptarSolicitud(solicitudId);
    setSolicitudes(solicitudes.filter((s) => s.id !== solicitudId));
    toast.success(`ahora tu y ${nombreFormateado} son amigos`)
  };

  const manejarRechazar = async (solicitudId) => {
    await rechazarSolicitud(solicitudId);
    setSolicitudes(solicitudes.filter((s) => s.id !== solicitudId));
  };

  if (loading)
    return (
      <div className="contenedor-principal d-flex justify-content-center align-items-center ">
        <p className="margin-auto">Cargando solicitudes...</p>
      </div>
    );

  return (
    <div
      className="contenedor-principal"
      style={{ width: "40vw", position: "relative" }}
    >
      <h3 className="mb-1 mt-5 text-muted">Solicitudes de amistad:</h3>
      <button
        className="btn btn-secondary btn-smbnv "
        style={{ position: "absolute", right: "15px", top: "1rem" }}
        onClick={() => navigate("enviadas")}
      >
        Solicitudes Enviadas
      </button>
      {solicitudes.length === 0 ? (
        <p className="text-muted mt-4 ">No tienes solicitudes pendientes</p>
      ) : (
        <div className="col mt-2 w-100">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="card  m-2 mt-4 p-3 shadow-sm w-100"
            >
              <div className="d-flex align-items-center">
                <img
                  src={
                    solicitud.emisor.avatar
                      ? `http://localhost:5000${solicitud.emisor.avatar}`
                      : preview
                  }
                  alt="Foto de perfil"
                  className="rounded-circle me-3"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <div>
                  <h5 className="mb-1">
                    {" "}
                    {formatearNombre(solicitud.emisor.nombre)}{" "}
                    {formatearNombre(solicitud.emisor.apellido)}
                  </h5>
                  <p
                    className="text-muted mb-1 descripcion-usuario"
                    style={{ fontSize: "0.9em" }}
                  >
                    {solicitud.emisor.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>
              <div className="mt-3 d-flex justify-content-between">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate(`/usuarios/${solicitud.emisor.id}`)}
                >
                  Ver perfil
                </button>
                <div>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => manejarAceptar(solicitud.id,solicitud.emisor.nombre)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => manejarRechazar(solicitud.id)}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SolicitudesPendientes;
