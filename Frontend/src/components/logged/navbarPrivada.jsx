import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import "../../app.css";
import BarraDeBusqueda from "./barraDeBusqueda";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from "bootstrap";
import { cerrarDropdownsAbiertos } from "../../utils/cerrarDropdowns";
import { obtenerCantidadSolicitudes } from "../../services/amistadServices";
import  preview  from "../../images/preview.png";

function NavbarPrivada() {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const URL = import.meta.env.VITE_API_URL;

  const handleDropdownClick = (e) => {
    cerrarDropdownsAbiertos();
    dropdownInstance?.toggle();
  };

  const dropdownBtnRef = useRef(null);
  const [dropdownInstance, setDropdownInstance] = useState(null);

  useEffect(() => {
    if (dropdownBtnRef.current && !dropdownInstance) {
      setDropdownInstance(new Dropdown(dropdownBtnRef.current));
    }
  }, [dropdownBtnRef.current]);

  const { darkMode, colorTema, coloresNavbar } = useAuth();

  const colorActual = darkMode
    ? coloresNavbar.oscuro[colorTema]
    : coloresNavbar.claro[colorTema];

  const [cantidad, setCantidad] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const obtener = async () => {
      try {
        const res = await obtenerCantidadSolicitudes();
        setCantidad(res);
      } catch (error) {
        console.error(error);
      }
    };
    obtener();
    const intervalo = setInterval(obtener, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const tituloColor =
    colorTema !== "default"
      ? darkMode
        ? "#ffffff" // blanco si es darkmode y no es default
        : "#000000" // negro si no es darkmode y no es default
      : "#818181";

  const neonBoxStyle = {
    backgroundColor: colorActual,
    ...(colorTema !== "default" && {
      boxShadow: `
      0 0 5px ${colorActual},
      0 0 10px ${colorActual},
      0 0 15px ${colorActual},
      0 0 20px ${colorActual}
    `,
    }),
  };
  console.log(usuario)
  return (
    <>
      <nav
        className=" navbarPrivada d-flex navbar navbar-expand-lg fixed-top  "
        style={neonBoxStyle}
      >
        <div className="d-flex w-100 align-items-center">
          <h4
            className="ms-3 me-3 col-md-auto"
            style={{ color: tituloColor, flexShrink: 0, cursor: "pointer" }}
            onClick={() => navigate("/home")}
          >
            {" "}
            MRS <i className="bi bi-chat-left-text"></i>
          </h4>
          <div className="pc-menu">
            <ul className="navbar-nav">
              <li className=" ms-2">
                <NavLink className="nav-link" to="/home">
                  Inicio
                </NavLink>
              </li>
              <li className=" ms-2">
                <NavLink className="nav-link" to="/descripcion">
                  Descripcion
                </NavLink>
              </li>
            </ul>
          </div>
          <div
            className="container   w-50 pc-bar
        "
          >
            {usuario.isVerified && <BarraDeBusqueda />}
          </div>
          <div className="dropdown ms-auto me-4">
            <button
              ref={dropdownBtnRef}
              onClick={handleDropdownClick}
              className="btn d-flex align-items-center gap-2 dropdown-toggle hover-avatar-button"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                border: "1px solid gray",
                backgroundColor: darkMode ? "#1C1C1C" : "",
              }}
            >
              <div
                className="d-flex align-items-center position-relative gap-2 me-2 butonNavDiv"
                style={{ minWidth: "180px" }}
              >
                <img
                 src={usuario.avatar ? `${URL}${usuario.avatar}` : preview}
                  className="navbar-avatar"
                  alt="Avatar"
                  draggable="false"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink:0,
                  }}
                />
                <h5
                  className="mb-0 me-4"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize:"1.1rem"
                  }}
                >
                  Hola {usuario.nombre}!
                </h5>

                <div
                  className="position-absolute"
                  style={{ fontSize: "1.2rem", right: "0" }}
                >
                  <i
                    className="bi bi-bell"
                    style={{ fontSize: "1.2rem", margin: 0, padding: 0 }}
                  ></i>
                  {cantidad > 0 && (
                    <i
                      className="bi bi-circle-fill text-danger position-absolute"
                      style={{ fontSize: ".5rem", top: "0", right: "0" }}
                    ></i>
                  )}
                </div>
              </div>
            </button>

            <ul
              className="dropdown-menu w-100 mt-1"
              aria-labelledby="dropdownMenuButton"
            >
              <li className=" solo-mobile">
                <NavLink className="dropdown-item " to="/home">
                  <i className="bi bi-house-fill"></i> Inicio
                </NavLink>
              </li>
              <li className="solo-mobile">
                <NavLink className="dropdown-item " to="/descripcion">
                  <i className="bi bi-card-text"></i> Descripcion
                </NavLink>
              </li>
              <li>
                <NavLink className="dropdown-item" to="/perfil">
                  <i className="bi bi-person-circle"></i> Mi Perfil
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="dropdown-item "
                  to="/solicitudes-pendientes"
                >
                  <i className="bi bi-person-plus-fill"></i> Solicitudes de
                  amistad{" "}
                  {cantidad > 0 && (
                    <span
                      className=" badge rounded-pill bg-danger"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {cantidad}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink className="dropdown-item " to="/amigos">
                  <i className="bi bi-people-fill"></i> Mis amigos
                </NavLink>
              </li>
              <li>
                <NavLink className="dropdown-item " to="/configuracion">
                  <i className="bi bi-gear-fill"></i> Configuracion
                </NavLink>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={logout}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="mobile-bar
        "
          style={{ width: "95vw" }}
        >
          <BarraDeBusqueda />
        </div>
      </nav>
    </>
  );
}

export default NavbarPrivada;
