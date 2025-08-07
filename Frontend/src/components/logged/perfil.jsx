import { NavLink, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState } from "react";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";
import {
  obtenerPublicacionesPorUsuario,
  eliminarPublicacion,
} from "../../services/publicacionesServices";
import preview from "../../images/preview.png";
import formatearNombre from "../../utils/formatearNombre";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function Perfil() {
  const { usuario } = useAuth();

  const URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPosts, setLoadingPósts] = useState(true);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        if (!usuario?.id) return;
        setLoadingPósts(true);
        const posts = await obtenerPublicacionesPorUsuario(usuario.id);
        setPublicaciones(posts);
      } catch (error) {
        console.error("Error al cargar las publicaciones del usuario", error);
      } finally {
        setLoadingPósts(false);
      }
    };
    cargarPublicaciones();
  }, [usuario?.id]);

  let edad = null;
  let cumpleaños = false;
  if (usuario.fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = ajustarFechaSinZona(usuario.fechaNacimiento);

    hoy.setHours(0, 0, 0, 0);
    nacimiento.setHours(0, 0, 0, 0);

    edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    cumpleaños =
      hoy.getDate() === nacimiento.getDate() &&
      hoy.getMonth() === nacimiento.getMonth();
  }

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la publicación permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await eliminarPublicacion(id);
        setPublicaciones((prev) => prev.filter((p) => p.id !== id));
        toast.success("Publicación eliminada");
      } catch (error) {
        toast.error("No se pudo eliminar la publicación");
      }
    }
  };

  return (
    <>
      <div className="container d-flex flex-column align-items-center justify-content-center">
        <div
          className="card shadow-lg p-5 pt-4 d-flex  "
          style={{ width: "70vw" }}
        >
          <div
            className="d-flex align-items-center m-3"
            style={{ width: "70%" }}
          >
            <div
              className="card shadow-lg  me-4"
              style={{ borderRadius: "50%", flexShrink: "0" }}
            >
              <img
                src={`${URL}${usuario.avatar}`}
                style={{
                  width: "10vw",
                  height: "10vw",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                draggable={false}
              />
            </div>
            <div className="textColor ms-4">
              <h3 className="textColor mb-4  border-bottom border-2 d-inline-block pb-1">
                {`${usuario.nombre} ${usuario.apellido}`}{" "}
                {edad !== null && `- ${edad}`} {cumpleaños && "🎂"}
              </h3>

              <p className="descripcion-perfil">
                {usuario.descripcion || "Sin descripción"}
              </p>
            </div>
          </div>
          <hr />
          <div className="d-flex col">
            <div style={{ width: "50%" }}>
              <h5 className="mb-3">Datos personales</h5>
              <div style={{ height: "20vh" }}>
                <p>📫Email:</p>
                <p className="text-muted">{usuario.email}</p>
                <p>🕓Miembro desde:</p>
                <p className="text-muted">
                  {" "}
                  {new Date(usuario.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h5 className="text-muted mb-3">Opcional</h5>
              <div className=" d-flex row">
                <p>📅Fecha de Nacimiento:</p>
                <p className="text-muted">
                  {usuario.fechaNacimiento
                    ? ajustarFechaSinZona(
                        usuario.fechaNacimiento
                      ).toLocaleDateString()
                    : "No especificada"}
                </p>
                <p>🧑Genero:</p>
                <p className="text-muted">
                  {" "}
                  {usuario.genero || "No especificado"}
                </p>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <NavLink to="editar" className="btn btn-success">
              {" "}
              <i className="bi bi-pencil"></i>Modificar
            </NavLink>
          </div>
        </div>
        <hr />
        <div className="contenedor-principal mt-2">
          <h4>Publicaciones</h4>
          {loadingPosts && <p>Cargando publicaciones...</p>}
          {!loadingPosts && publicaciones.length === 0 && (
            <p className="text-muted">
              Este usuario no tiene publicaciones aún.
            </p>
          )}
          {!loadingPosts &&
            publicaciones.map((post) => (
              <div
                key={post.id}
                className="shadow-sm border p-3 w-100 mt-4 position-relative"
              >
                {usuario?.id === post.autorId && (
                  <div className="dropdown position-absolute end-0 top-0 m-3">
                    <button
                      className="btn btn-light border-0"
                      type="button"
                      id={`dropdownMenuButton-${post.id}`}
                      data-bs-toggle="dropdown"
                      data-bs-display="static"
                      aria-expanded="false"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end "
                      aria-labelledby={`dropdownMenuButton-${post.id}`}
                    >
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          onClick={() => navigate(`/editar-post/${post.id}`)}
                        >
                          <i className="bi bi-pencil-square"></i> Editar
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger d-flex align-items-center gap-2"
                          onClick={() => handleEliminar(post.id)}
                        >
                          <i className="bi bi-trash"></i> Eliminar
                        </button>
                      </li>
                    </ul>
                  </div>

                  /* <button
                    onClick={() => {handleEliminar(post.id)}}
                    className="d-flex align-items-center gap-1 text-secondary text-sm border-0 bg-transparent p-0 hover:text-danger transition position-absolute end-0 top-0 m-3"
                  >
                    <i className="bi bi-trash"></i>
                    <span>Eliminar</span>
                  </button> */
                )}
                <div
                  className="d-flex align-items-center mb-2"
                  style={{ gap: "1rem" }}
                >
                  <img
                    src={
                      post.autor.avatar ? `${URL}${post.autor.avatar}` : preview
                    }
                    alt="Avatar"
                    draggable="false"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div className="d-flex flex-row w-100 ">
                    <h5 className="font-semibold text-muted">
                      {formatearNombre(post.autor.nombre)}{" "}
                      {formatearNombre(post.autor.apellido)}
                    </h5>
                    <p className="text-muted" style={{ marginLeft: "5%" }}>
                      {`${new Date(post.createdAt).toLocaleString("es-AR")}`}
                    </p>
                  </div>
                </div>
                {post.contenido && (
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                    className="mt-3"
                  >
                    {post.contenido}
                  </p>
                )}
                {post.imagenUrl && (
                  <img
                    src={post.imagenUrl}
                    alt="Imagen del post"
                    className="mt-3 max-h-96 w-full object-cover rounded-xl"
                    draggable="false"
                    style={{
                      width: "100%",
                      maxHeight: "600px",
                      objectFit: "contain",
                      borderRadius: "0.75rem",
                      marginTop: "1rem",
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Perfil;
