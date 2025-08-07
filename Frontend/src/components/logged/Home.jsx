import { useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState } from "react";
import CrearPublicacion from "../post/crearPublicacion";
import { toast } from "react-toastify";
import { obtenerFeed } from "../../services/publicacionesServices";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import { eliminarPublicacion } from "../../services/publicacionesServices";
import Swal from "sweetalert2";

function Home() {
  const { usuario } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cargarFeed = async () => {
    try {
      const publicaciones = await obtenerFeed();
      setFeed(publicaciones);
    } catch (error) {
      console.error("Error al cargar el feed:", error);
      toast.error("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFeed();
  }, []);

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
        setFeed((prev) => prev.filter((p) => p.id !== id));
        toast.success("Publicación eliminada");
      } catch (err) {
        toast.error("No se pudo eliminar la publicación");
      }
    }
  };

  return (
    <>
      <div className="contenedor-principal" style={{ width: "60vw" }}>
        <div className="w-100">
          <CrearPublicacion onPublicar={cargarFeed} />
        </div>
        {loading && <p className="p-5 text-muted">Cargando publicaciones...</p>}
        {!loading && feed.length === 0 && (
          <p className="p-5 text-muted">No hay publicaciones aún.</p>
        )}

        {!loading &&
          feed.map((post) => (
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
                style={{gap: "1rem"}}
                
              >
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer",gap: "1rem" }}
                onClick={() => navigate(`/usuarios/${post.autor.id}`)}>
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
                  </div>
                  </div>
                  <p className="text-muted " style={{marginTop: "1.1%",  marginLeft: "3%" }}>
                    {`${new Date(post.createdAt).toLocaleString("es-AR")}`}
                  </p>
                
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
    </>
  );
}

export default Home;
