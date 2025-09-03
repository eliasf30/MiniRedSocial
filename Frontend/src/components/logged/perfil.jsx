import { NavLink, useNavigate } from "react-router";
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
  const { usuario,darkMode } = useAuth();
  const URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      if (!usuario?.id) return;
      setLoadingPosts(true);
      try {
        const posts = await obtenerPublicacionesPorUsuario(usuario.id);
        setPublicaciones(posts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPosts(false);
      }
    };
    cargarPublicaciones();
  }, [usuario?.id]);

  // Cálculo de edad y cumpleaños
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
    cumpleaños = hoy.getDate() === nacimiento.getDate() && hoy.getMonth() === nacimiento.getMonth();
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
    <div className="container my-4 d-flex flex-column align-items-center">
      {/* Card Perfil */}
      <div className="card shadow-lg  p-4 profilewidth">
        <div className="row align-items-center mb-3">
          {/* Avatar */}
          <div className="col-12 col-md-auto text-center mb-3 mb-md-0">
            <img
             

              src={usuario.avatar?.startsWith("http") ? usuario.avatar : `${URL}${usuario.avatar}`} 

              alt="Avatar"
              className="rounded-circle"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
              draggable={false}
            />
          </div>
          {/* Datos */}
          <div className="col text-center text-md-start">
            <h3 className="mb-2 border-bottom border-2 d-inline-block pb-1">
              {`${usuario.nombre} ${usuario.apellido}`} {edad !== null && `- ${edad}`} {cumpleaños && "🎂"}
            </h3>
            <p className="descripcion-perfil">{usuario.descripcion || "Sin descripción"}</p>
          </div>
        </div>
         <hr />
        <div className="row mt-4">
          {/* Datos Personales */}
          <div className="col-12 col-lg-6 mb-3">
            <h5 className="mb-3">Datos personales</h5>
            <p>📫 Email:</p>
            <p className="text-muted">{usuario.email}</p>
            <p>🕓 Miembro desde:</p>
            <p className="text-muted">{new Date(usuario.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Opcional */}
          <div className="col-12 col-lg-6 mb-3">
            <h5 className="mb-3">Opcional</h5>
            <p>📅 Fecha de Nacimiento:</p>
            <p className="text-muted">
              {usuario.fechaNacimiento
                ? ajustarFechaSinZona(usuario.fechaNacimiento).toLocaleDateString()
                : "No especificada"}
            </p>
            <p>🧑 Género:</p>
            <p className="text-muted">{usuario.genero || "No especificado"}</p>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <NavLink to="editar" className="btn btn-success">
            <i className="bi bi-pencil"></i> Modificar
          </NavLink>
        </div>
      </div>

      {/* Publicaciones */}
      <div className="contenedor-principal mt-4 ">
        <h4>Publicaciones</h4>
        {loadingPosts && <p>Cargando publicaciones...</p>}
        {!loadingPosts && publicaciones.length === 0 && <p className="text-muted">Este usuario no tiene publicaciones aún.</p>}
        {!loadingPosts &&
          publicaciones.map((post) => (
            <div key={post.id} className="shadow-sm border p-3 w-100 mt-4 position-relative">
              {/* Opciones editar/eliminar */}
              {usuario?.id === post.autorId && (
                <div className="dropdown position-absolute end-0 top-0 m-3">
                  <button
                    className={`btn border-0 ${darkMode ? "btn-dark text-light" : "btn-light"}`}
                    type="button"
                    id={`dropdownMenuButton-${post.id}`}
                    data-bs-toggle="dropdown"
                    data-bs-display="static"
                    aria-expanded="false"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${post.id}`}>
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
              )}

              {/* Contenido del post */}
              <div className="d-flex align-items-start gap-3 w-100">
                <img
                  src={post.autor.avatar ? `${post.autor.avatar}` : preview}
                  alt="Avatar"
                  draggable="false"
                  className="rounded-circle flex-shrink-0"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <h5 className="mb-1">{formatearNombre(post.autor.nombre)} {formatearNombre(post.autor.apellido)}</h5>
                  <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(post.createdAt).toLocaleString("es-AR")}
                  </p>
                 
                </div>
              </div>
               {post.contenido && <p className="mt-2" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{post.contenido}</p>}
                  {post.imagenUrl && (
                    <img
                      src={post.imagenUrl}
                      alt="Imagen del post"
                      className="mt-2 w-100 rounded img-background"
                      style={{ maxHeight: "600px", objectFit: "contain",  }}
                    />
                  )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Perfil;