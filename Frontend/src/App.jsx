import { useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
import "./app.css"
import Principal from "./components/Principal";
import Descripcion from "./components/Descripcion";
import Login from "./components/Login";
import Register from "./components/Register";
function App() {
  return (
    <>
      <BrowserRouter>
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
        <div style={{paddingTop:"70px"}}>
        <Routes>
          <Route path="/" element={<Principal/>}/>
          <Route path="/descripcion" element={<Descripcion/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        </div>
      
        
      </BrowserRouter>
    </>
  );
}

export default App;
