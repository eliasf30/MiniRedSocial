import { useEffect, useState } from "react";
import { obtenerUsuario } from "../../services/userServices";
import { useParams } from "react-router";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";
import { useNavigate, NavLink } from "react-router";
import { useAuth } from "../../context/useAuth";
import BotonAgregar from "../social/botonAgregar";
import formatearNombre from "../../utils/formatearNombre";
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
  useEffect(() => {
    if (!usuario) {
      navigate("/");
    }
  }, [usuario, navigate]);

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
      <div className="container d-flex align-items-start justify-content-start">
        <div
          className="card shadow-lg p-5 pt-4 d-flex  "
          style={{ width: "80vw" }}
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
      </div>
    </>
  );
}

export default PerfilPublico;
