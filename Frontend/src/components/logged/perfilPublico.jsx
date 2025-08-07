import { useEffect, useState } from "react";
import { obtenerUsuario } from "../../services/userServices";
import { useParams } from "react-router";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";
import { useNavigate, NavLink } from "react-router";
import { useAuth } from "../../context/useAuth";
import BotonAgregar from "../social/botonAgregar";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import { obtenerPublicacionesPorUsuario } from "../../services/publicacionesServices";

function PerfilPublico() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const { usuario } = useAuth();

  useEffect(() => {
    if (!id) return;
    const obtener = async () => {
      try {
        const data = await obtenerUsuario(id);
        data.nombre = formatearNombre(data.nombre);
        data.apellido = formatearNombre(data.apellido);
        setUser(data);
      } catch (error) {
        console.error("No se pudo cargar el usuario:", error);
      }
    };

    obtener();
  }, [id]);

  const URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPosts, setLoadingPósts] = useState(true);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        if (!user?.id) return;
        setLoadingPósts(true);
        const posts = await obtenerPublicacionesPorUsuario(user.id);
        setPublicaciones(posts);
      } catch (error) {
        console.error("Error al cargar las publicaciones del usuario", error);
      } finally {
        setLoadingPósts(false);
      }
    };
    cargarPublicaciones();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id === usuario.id) {
      navigate("/perfil");
    }
  }, [user?.id, usuario.id]);

  if (!user) {
    return <div>Cargando perfil</div>;
  }

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
              style={{ borderRadius: "50%" }}
            >
              <img
                src={`${URL}${user.avatar}`}
                style={{
                  width: "10vw",
                  height: "10vw",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
                draggable={false}
              />
            </div>
            <div className="textColor ms-4" style={{ flex: 1, minWidth: 0 }}>
              <h3 className="textColor mb-4  border-bottom border-2 d-inline-block pb-1">
                {`${user.nombre} ${user.apellido}`}{" "}
                {edad !== null && `- ${edad}`} {cumpleaños && "🎂"}
              </h3>

              <p className="descripcion-perfil" style={{ width: "100%" }}>
                {user.descripcion || "Sin descripción"}
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              {usuario.id !== user.id && <BotonAgregar amigoId={user.id} />}
            </div>
          </div>
          <hr />
          <div className="d-flex col">
            <div style={{ width: "50%" }}>
              <h5 className="mb-3">Datos personales</h5>
              <div style={{ height: "20vh" }}>
                <p>📫Email:</p>
                <p className="text-muted">{user.email}</p>
                <p>🕓Miembro desde:</p>
                <p className="text-muted">
                  {" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h5 className="text-muted mb-3">Opcional</h5>
              <div className=" d-flex row">
                <p>📅Fecha de Nacimiento:</p>
                <p className="text-muted">
                  {user.fechaNacimiento
                    ? ajustarFechaSinZona(
                        user.fechaNacimiento
                      ).toLocaleDateString()
                    : "No especificada"}
                </p>
                <p>🧑Genero:</p>
                <p className="text-muted">
                  {" "}
                  {user.genero || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="contenedor-principal mt-2 ">
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
                    className="mt-3"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
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

export default PerfilPublico;
