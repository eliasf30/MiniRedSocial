import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { buscarUsuarios } from "../../services/userServices";
import preview from "../../images/preview.png";
import PerfilPublico from "./perfilPublico";
import { useNavigate } from "react-router";
import BotonAgregar from "../social/botonAgregar";
import { useAuth } from "../../context/useAuth";
import formatearNombre from "../../utils/formatearNombre";

function BarraDeBusqueda() {
  const [query, setQuery] = useState("");
  const [deboundedQuery] = useDebounce(query, 300);
  const [resultados, setResultados] = useState([]);

  const URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const {usuario, darkMode} = useAuth()
  useEffect(() => {
    if (deboundedQuery.trim() === "") {
      setResultados([]);
      return;
    }
    const buscar = async () => {
      try {
        const res = await buscarUsuarios(deboundedQuery);
        setResultados(res.data);
      } catch (error) {
        console.error("error al buscar usuarios:".error);
      }
    };
    buscar();
  }, [deboundedQuery]);

  return (
    <>
      <div className="col-12 col-lg-9 mx-auto mt-3" style={{ position: "relative" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar Usuarios"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {resultados.length > 0 && (
          <ul className="list-group shadow listaResultados">
            {resultados.map((user) => (
              <li
                className="list-group-item list-group-item-action item-usuario"
                style={{ cursor: "pointer" }}
                key={user.id}
              >
                <div
                  className="contenido-usuario"
                  onClick={() => {
                    navigate(`/usuarios/${user.id}`);
                    setQuery("");
                    setResultados([]);
                  }}
                >
                  <img
                    draggable="false"
                    src={user.avatar ? `${URL}${user.avatar}` : preview}
                    alt={`${user.nombre} ${user.apellido}`}
                    className="avatar-usuario"
                  />
                  <div className="info-usuario">
                    <strong style={{color: darkMode? "#F0F0F0":"black"}}>
                       {formatearNombre(user.nombre)}  {formatearNombre(user.apellido)}
                    </strong>
                    {user.descripcion && (
                      <p className="descripcion-usuario" style={{color: darkMode && "#cccccc"}} >{user.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="boton-agregar-container">
                  
                {usuario.id !== user.id && <BotonAgregar amigoId={user.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default BarraDeBusqueda;
