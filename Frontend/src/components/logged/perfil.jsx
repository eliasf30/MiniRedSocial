import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import { useEffect } from "react";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";

function Perfil() {
  const { usuario } = useAuth();
 

  const URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  
  

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
              style={{ borderRadius: "50%" , flexShrink:"0"}}
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

              <p className="descripcion-perfil" >
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
                    ? ajustarFechaSinZona(usuario.fechaNacimiento).toLocaleDateString()
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
      </div>
    </>
  );
}

export default Perfil;
