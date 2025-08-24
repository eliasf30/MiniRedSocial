import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";

function Principal() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      navigate("/home");
    }
  }, [usuario, navigate]);

  if (usuario) {
    return null;
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center  ">
        <div
          className="card text-center w-100 w-md-75 w-lg-50 m-3 card-body"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div className="p-4">
            <h2
              className="card-title mb-4 fw-bold"
              style={{ color: "#435f7a" }}
            >
              {" "}
              Bienvenido a Mini Red Social{" "}
              <i className="bi bi-chat-left-text"></i>
            </h2>
            <p className="card-text-principal ">
              Conectate con otras personas, comparti tu perfil y chatea en
              tiempo real.
            </p>

            <p className="card-text text-muted m">
              Registrate o inicia sesion para empezar
            </p>
            <div className="container d-flex justify-content-evenly mt-5 ">
              <NavLink to="/Login" className=" btn btn-primary submitbutton ">
                Iniciar sesion
              </NavLink>
              <NavLink
                to="/Register"
                className="btn btn-secondary submitbutton "
              >
                Registrarse
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Principal;
