import { NavLink } from "react-router";
import { useAuth } from "../../context/useAuth";
import "../../app.css"
import BarraDeBusqueda from "./barraDeBusqueda";


function NavbarPrivada() {
  const { usuario,logout } = useAuth();


  const URL = import.meta.env.VITE_API_URL;

  return (
    <>
      <nav className=" d-flex navbar navbar-expand-lg fixed-top bg.secondary navbarPrivada">
        <h5 className="ms-3 me-3" style={{ color: "#747272" }}>
          {" "}
          MRS <i className="bi bi-chat-left-text"></i>
        </h5>
        <ul className="navbar-nav">
          <li className="nav-item ms-3">
            <NavLink className="nav-link" to="/home">
              Inicio
            </NavLink>
          </li>
          <li className="nav-item ms-2">
            <NavLink className="nav-link" to="/descripcion">
              Descripcion
            </NavLink>
          </li>
        </ul>
        <div className="container d-flex justify-content-center w-50
        ">
          <BarraDeBusqueda/>
        </div>
        <div className="dropdown ms-auto me-4">
          <button
            className="btn d-flex align-items-center gap-2 dropdown-toggle hover-avatar-button"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{
              border: "1px solid gray",
            }}
          >
           <div className="d-flex align-items-center gap-2 me-2">
            <img
              src={`${URL}${usuario.avatar}`}
              className="navbar-avatar"
              alt="Avatar"
              draggable="false"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <h5 className="mb-0 me-4">Hola {usuario.nombre}!</h5>
           </div>
          </button>

          <ul className="dropdown-menu w-100 mt-1" aria-labelledby="dropdownMenuButton" >
            <li>
              <NavLink className="dropdown-item" to="/perfil">
                Mi Perfil
              </NavLink>
            </li>
            <li>
              <NavLink className="dropdown-item" to="/solicitudes-pendientes">
                Solicitudes de amistad
              </NavLink>
            </li>
            <li>
              <NavLink className="dropdown-item " to="/amigos">
                Mis amigos
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
        
      </nav>
    </>
  );
}

export default NavbarPrivada;
