import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";
import { obtenerUsuario } from "../../services/userServices";
import { obtenerPublicacionesPorUsuario } from "../../services/publicacionesServices";
import BotonAgregar from "../social/botonAgregar";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";

function PerfilPublico() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const data = await obtenerUsuario(id);
        data.nombre = formatearNombre(data.nombre);
        data.apellido = formatearNombre(data.apellido);
        setUser(data);
      } catch (error) {
        console.error("No se pudo cargar el usuario:", error);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        if (!user.PerfilPrivado || user.esAmigo) {
          const posts = await obtenerPublicacionesPorUsuario(user.id);
          setPublicaciones(posts);
        } else {
          setPublicaciones([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [user?.id, user?.PerfilPrivado]);

  useEffect(() => {
    if (user?.id === usuario.id) {
      navigate("/perfil");
    }
  }, [user?.id, usuario.id]);

  if (!user) return <div>Cargando perfil...</div>;

  let edad = null;
  let cumpleaños = false;
  if (user.fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = ajustarFechaSinZona(user.fechaNacimiento);
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

  console.log();
  return (
    <div className="container my-4 align-items-center ">
      <div className="card shadow-lg  p-4 profilewidth">
        {usuario.id !== user.id && (
          <div className="position-absolute top-0 end-0 mt-2 me-2">
            <BotonAgregar amigoId={user.id} />
          </div>
        )}
        <div className="row align-items-center mb-3 position-relative">
          <div className="col-12 col-md-auto text-center mb-3 mb-md-0">
            <img
              src={`${URL}${user.avatar}`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
              draggable={false}
            />
          </div>
          {/* Datos */}
          <div className="col text-center text-md-start">
            <h3 className="mb-2 border-bottom border-2 d-inline-block pb-1">
              {`${user.nombre} ${user.apellido}`} {edad !== null && `- ${edad}`}{" "}
              {cumpleaños && "🎂"}
            </h3>
            <p className="descripcion-perfil">
              {user.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>
        <hr />

        <div className="row mt-4">
          <div className="col-12 col-lg-6 mb-3">
            <h5 className="mb-3">Datos personales</h5>
            <p>📫 Email:</p>
            <p className="text-muted">{user.email}</p>
            <p>🕓 Miembro desde:</p>
            <p className="text-muted">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="col-12 col-lg-6 mb-3">
            <h5 className="mb-3">Opcional</h5>
            <p>📅 Fecha de Nacimiento:</p>
            <p className="text-muted">
              {user.fechaNacimiento
                ? ajustarFechaSinZona(user.fechaNacimiento).toLocaleDateString()
                : "No especificada"}
            </p>
            <p>🧑 Género:</p>
            <p className="text-muted">{user.genero || "No especificado"}</p>
          </div>
        </div>
      </div>

      {/* Publicaciones */}

      {!user.PerfilPrivado || user.esAmigo ? (
        <div className="contenedor-principal mt-4 ">
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
                className="shadow-sm border flex-column p-3 w-100 mt-4 position-relative"
              >
                {/* Contenido del post */}
                <div className="d-flex  align-items-start gap-3 w-100">
                  <img
                    src={
                      post.autor.avatar ? `${URL}${post.autor.avatar}` : preview
                    }
                    alt="Avatar"
                    draggable={false}
                    className="rounded-circle flex-shrink-0"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">
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
                    className="mt-2"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {post.contenido}
                  </p>
                )}
                {post.imagenUrl && (
                  <img
                    src={post.imagenUrl}
                    alt="Imagen del post"
                    className="mt-2 w-100 rounded img-background"
                    style={{ maxHeight: "600px", objectFit: "contain" }}
                  />
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="contenedor-principal mt-4 ">
          {" "}
          <p className="text-muted text-center">
            Este perfil es privado, solo amigos pueden ver sus publicaciones.
          </p>
        </div>
      )}
    </div>
  );
}

export default PerfilPublico;
