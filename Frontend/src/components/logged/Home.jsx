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
  const { usuario, darkMode } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [noHayMas, setNoHayMas] = useState(false);
  const navigate = useNavigate();
  const take = 20;
  const URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const cargarFeed = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const publicaciones = await obtenerFeed(currentPage, take);

      if (reset) {
        setFeed(publicaciones);
        setPage(2);
      } else {
        setFeed((prev) => [...prev, ...publicaciones]);
        setPage((prev) => prev + 1);
      }

      if (publicaciones.length < take) {
        setNoHayMas(true);
      } else {
        setNoHayMas(false);
      }
    } catch (error) {
      toast.error("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFeed(true); // Cargar la primera página al inicio
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
    <div className="contenedor-principal">
      <div className="w-100">
        <CrearPublicacion onPublicar={() => cargarFeed(true)} />
      </div>

      {feed.length === 0 && !loading && (
        <p className="p-5 text-muted">No hay publicaciones aún.</p>
      )}

      {feed.map((post) => (
        <div
          key={post.id}
          className="shadow-sm border p-3 w-100 mt-4 position-relative"
        >
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
          )}

          <div className="d-flex align-items-start gap-3 w-100">
            <img
              src={post.autor.avatar ? `${post.autor.avatar}` : preview}
              alt="Avatar"
              draggable="false"
              className="rounded-circle flex-shrink-0"
              style={{ width: "60px", height: "60px", objectFit: "cover", cursor:"pointer" }}
              onClick={() => navigate(`/usuarios/${post.autor.id}`)}
            />
            <div className="flex-grow-1">
              <h5
                className="mb-1"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/usuarios/${post.autor.id}`)}
              >
                {formatearNombre(post.autor.nombre)}{" "}
                {formatearNombre(post.autor.apellido)}
              </h5>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                {new Date(post.createdAt).toLocaleString("es-AR")}
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
              className="mt-3 max-h-96 w-full object-cover rounded-xl img-background"
              draggable="false"
              style={{
                width: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                borderRadius: "0.75rem",
                marginTop: "1rem",
                
                
              }}
            />
          )}
        </div>
      ))}

      {!noHayMas && !loading && (
        <button
          className="btn btn-primary my-4"
          onClick={() => cargarFeed()}
          disabled={loading}
        >
          Cargar más
        </button>
      )}

      {loading && <p className="text-center mt-3">Cargando...</p>}
    </div>
  );
}

export default Home;
