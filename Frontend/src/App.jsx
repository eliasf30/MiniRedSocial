import { useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router";

import "./app.css"
import Principal from "./components/Principal";
import Descripcion from "./components/Descripcion";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/logged/home";
import  NavbarPublica  from "./components/navbarPublica";
import NavbarPrivada from "./components/logged/navbarPrivada";
import Footer from "./components/logged/footer";
import EditarPerfil from "./components/logged/editar";
import { useAuth } from "./context/useAuth";
import Perfil from "./components/logged/perfil";
import PerfilPublico from "./components/logged/perfilPublico";
import VerificarCorreo from "./components/logged/verificarCorreo";
import VerificarCorreoPendiente from "./components/logged/verificarCorreoPendiente";
import ProtectedRoute from "./components/logged/protectedRoute";
import SolicitudesPendientes from "./components/social/solicitudesPendientes";


function App() {

    const {usuario} = useAuth()

  return (
    <>
      <BrowserRouter>

      {usuario? <NavbarPrivada/> :<NavbarPublica/> }
        
        <div style={{paddingTop:"70px"}}>
        <Routes>
          <Route path="/" element={<Principal/>}/>
          <Route path="/descripcion" element={<Descripcion/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
          <Route path="/perfil" element={<ProtectedRoute><Perfil/></ProtectedRoute>}/>
          <Route path="/perfil/editar" element={<ProtectedRoute><EditarPerfil/></ProtectedRoute>}/>
          <Route path="/usuarios/:id" element={<ProtectedRoute><PerfilPublico /></ProtectedRoute>} />
          <Route path="/verificar-correo/:token" element={<VerificarCorreo />} />
          <Route path="/verificar-correo-pendiente" element={ <VerificarCorreoPendiente />} />
          <Route path="/solicitudes-pendientes"  element={<SolicitudesPendientes/>} />
        </Routes>
        </div>
      
      {usuario && <Footer/>}
        
      </BrowserRouter>
    </>
  );
}

export default App;
