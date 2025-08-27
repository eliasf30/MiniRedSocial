import { useState, useEffect } from "react";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { obtenerAmigos } from "../../services/amistadServices";
import { cancelarSolicitud } from "../../services/amistadServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";
function Amigos() {
  const [loading, setLoading] = useState(true);
  const { register, watch } = useForm();
  const [amigos, setAmigos] = useState([]);
  const { darkMode } = useAuth();
  const nombre = watch("nombre");
  const apellido = watch("apellido");
  const timeout = 500;
  const URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const obtener = async () => {
        try {
          setLoading(true);
          const resultado = await obtenerAmigos(
            nombre?.trim() || "",
            apellido?.trim() || ""
          );

          setAmigos(resultado);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      obtener();
    }, timeout);

    return () => clearTimeout(delayDebounce);
  }, [nombre, apellido]);

  const navigate = useNavigate();

  const manejarEliminar = async (solicitudId, nombre) => {
    const nombreFormateado = formatearNombre(nombre);
    const resultado = await Swal.fire({
      title: `¿Eliminar a ${nombreFormateado}?`,
      text: "Para revertirlo deberas enviar nuevamente la solicitud",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "Red",
      cancelButtonText: "Cancelar",
    });
    if (resultado.isConfirmed) {
      await cancelarSolicitud(solicitudId);
      toast.success("Usuario eliminado con exito");
      setAmigos(amigos.filter((s) => s.solicitudId !== solicitudId));
    }
  };

  return (
    <>
      <div
        className="contenedor-principal contenedor-amigos"
        style={{ position: "relative" }}
      >
        <h3 className="mb-4 mt-2 text-muted">Lista de amigos</h3>
        <form className="ms-2 w-100">
          <p>Filtrar por: </p>
          <div className="row">
            <input
              {...register("nombre")}
              type="text"
              className="form-control ms-3 "
              placeholder="Nombre"
              style={{ width: "45%" }}
            />
            <input
              {...register("apellido")}
              type="text"
              className="form-control ms-2 "
              placeholder="Apellido"
              style={{ width: "48%" }}
            />
          </div>
        </form>

        {loading ? (
          <p className="mt-4 text-muted">Cargando amigos...</p>
        ) : amigos.length === 0 && !nombre && !apellido ? (
          <p className="mt-5 text-muted">Aun no has agregado ningun amigo</p>
        ) : amigos.length === 0 ? (
          <p className="mt-5 text-muted">
            No se encontraron amigos con esos datos
          </p>
        ) : (
          <div className="col mt-2 w-100 ">
            {amigos.map((amigo) => (
              <div
                key={amigo.id}
                className={`card m-2 mt-4 p-3 shadow-sm w-100 ${
                  darkMode ? "dark-style border-secondary" : ""
                }`}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={amigo.avatar ? `${amigo.avatar}` : preview}
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
                      {formatearNombre(amigo.nombre)}{" "}
                      {formatearNombre(amigo.apellido)}
                    </h5>
                    <p
                      className="text-muted mb-1 descripcion-usuario"
                      style={{ fontSize: "0.9em" }}
                    >
                      {amigo.descripcion || "Sin descripción"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 d-flex justify-content-between ">
                  <button
                    className={`btn btn-sm ${
                      darkMode ? "btn-outline-darkmode" : "btn-outline-primary"
                    }`}
                    onClick={() => navigate(`/usuarios/${amigo.id}`)}
                  >
                    Ver perfil
                  </button>
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        manejarEliminar(amigo.solicitudId, amigo.nombre)
                      }
                    >
                      Eliminar
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

export default Amigos;
