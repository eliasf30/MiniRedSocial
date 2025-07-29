import { NavLink } from "react-router"

function NavbarPublica(){

    return(
        <>
<nav className="navbar navbar-expand-lg navbar-dark bg-dark vw-100 fixed-top">
            <ul className="navbar-nav">
              <li className="nav-item ms-2">
                <NavLink className="nav-link" to="/">
                  Principal
                </NavLink>
              </li>
              <li className="nav-item ms-2">
                <NavLink className="nav-link" to="/descripcion">
                  Descripcion
                </NavLink>
              </li>
            </ul>
         
        </nav>
        </>
        )
        }

export default NavbarPublica