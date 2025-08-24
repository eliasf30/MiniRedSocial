import { NavLink } from "react-router";
import { useNavigate } from "react-router";

function NavbarPublica() {

  const navigate = useNavigate()

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark vw-100 fixed-top align-items-center" style={{zIndex:9999}}>
        <h5
          className="m-2 ms-3 me-3 "
          style={{ color: "#b6b6b6", flexShrink: 0, cursor:"pointer" }}
          onClick={() => navigate("/")}
        >
          {" "}
          MRS <i className="bi bi-chat-left-text"></i>
        </h5>
        <ul className="navbar-nav justify-content-center align-items-center">
          <li className="nav-item ms-2 d-none d-lg-inline">
            <NavLink className="nav-link" to="/">
              Principal
            </NavLink>
          </li>
          <li className="nav-item ms-2 d-none d-lg-inline">
            <NavLink className="nav-link" to="/descripcion">
              Descripcion
            </NavLink>
          </li>
        </ul>
        <div className="dropdown position-absolute  end-0 ">
          <button
            className="btn  d-inline d-lg-none "
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="dropdownMenuButton"
          >
            {" "}
            <i
              className="bi bi-list"
              style={{ color: "#b6b6b6", fontSize: "1.5rem" }}
            ></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end  mt-1" style={{minWidth:"200px"}} aria-labelledby="dropdownMenuButton">
            <li className="">
              <NavLink className="dropdown-item" to="/" >Inicio</NavLink>{" "}
            </li>
            <li className="">
              <NavLink className="dropdown-item" to="/descripcion" >Descripcion</NavLink>{" "}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NavbarPublica;
