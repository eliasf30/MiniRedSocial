import { useAuth } from "../../context/useAuth.js";
import preview from "../../images/preview.png";
import { useEffect, useState, useRef } from "react";
import { obtenerListaChats } from "../../services/chatServices";
import { toast } from "react-toastify";
import formatearNombre from "../../utils/formatearNombre";
import VentanaChat from "./ventanaChat";
import { Dropdown } from "bootstrap";
import { cerrarDropdownsAbiertos } from "../../utils/cerrarDropdowns";
import { cargarMensajesHistoricos } from "../../services/chatServices";

import { io } from "socket.io-client";

function Chat() {
  const { usuario, darkMode } = useAuth();
  const URL = import.meta.env.VITE_API_URL;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  const socketRef = useRef(null);

  const dropdownRef = useRef(null);
  const dropdownInstanceRef = useRef(null);

  // Conectar socket una vez
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    socketRef.current = io(URL || "http://localhost:5000", {
      auth: {
        token: token,
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket conectado:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [URL]);

  // Listener único para mensajes nuevos que actualiza chats y mensajes activos
  useEffect(() => {
    if (!socketRef.current || !usuario) return;

    const onMensajeNuevo = (mensaje) => {
      // Actualiza ventana activa solo si el mensaje corresponde
      if (
        chatActivo &&
        (mensaje.emisorId === chatActivo.id ||
          mensaje.receptorId === chatActivo.id)
      ) {
        setMensajes((prev) => [...prev, mensaje]);
      }

      // Actualizar la lista de chats para mostrar último mensaje actualizado
      setChats((prevChats) => {
        const idx = prevChats.findIndex(
          (chat) =>
            chat.id ===
            (mensaje.emisorId === usuario.id
              ? mensaje.receptorId
              : mensaje.emisorId)
        );

        if (idx !== -1) {
          const chatActualizado = {
            ...prevChats[idx],
            ultimoMensaje: {
              contenido: mensaje.contenido,
              emisorId: mensaje.emisorId,
              imagenUrl: mensaje.imagenUrl || null,
            },
          };
          const nuevosChats = [...prevChats];
          nuevosChats[idx] = chatActualizado;
          return nuevosChats;
        } else {
          return prevChats;
        }
      });
    };

    socketRef.current.on("mensaje", onMensajeNuevo);

    return () => {
      socketRef.current.off("mensaje", onMensajeNuevo);
    };
  }, [usuario, chatActivo]);

  // Cargar lista de chats al montar
 useEffect(() => {
  let interval;

  const cargarChats = async () => {
    try {
      const res = await obtenerListaChats();
      setChats(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  cargarChats(); // carga inicial

  interval = setInterval(() => {
    cargarChats();
  }, 5000); // 👈 cada 5 segundos

  return () => clearInterval(interval);
}, []);

  // Cargar mensajes históricos al cambiar chat activo
  useEffect(() => {
    if (!chatActivo || !usuario || !socketRef.current) return;

    const emisorId = usuario.id;
    const receptorId = chatActivo.id;

    // Unirse a la sala
    socketRef.current.emit("joinRoom", { emisorId, receptorId });

    const cargar = async () => {
      const data = await cargarMensajesHistoricos(emisorId, receptorId);
      setMensajes(data || []);
    };
    cargar();

    // Limpiar mensajes cuando se cambia chat o se desmonta
    return () => {
      setMensajes([]);
    };
  }, [chatActivo, usuario, URL]);

  // Dropdown Bootstrap
  const ensureDropdownInstance = () => {
    if (!dropdownInstanceRef.current && dropdownRef.current) {
      dropdownInstanceRef.current = new Dropdown(dropdownRef.current);
    }
  };

  useEffect(() => {
    ensureDropdownInstance();
  }, [dropdownRef.current]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    cerrarDropdownsAbiertos();
    ensureDropdownInstance();

    if (chatActivo) {
      setChatActivo(null);
      dropdownInstanceRef.current?.show();
    } else {
      dropdownInstanceRef.current?.toggle();
    }
  };

  const abrirDropdown = () => {
    ensureDropdownInstance();
    dropdownInstanceRef.current?.show();
  };

  if (loading) return <div>Cargando chats...</div>;

  return (
    <>
      <div className="dropup position-fixed bottom-0 end-0 m-3 z-3 chat">
        <button
          ref={dropdownRef}
          className="btn dropdown-toggle w-100 text-start"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{
            backgroundColor: darkMode ? "#1F1F1F" : "#f0f0f0",
            border: "1px solid gray",
            height: "45px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            fontWeight: 500,
            color: darkMode ? "#f0f0f0" : "#333",
          }}
          onClick={toggleDropdown}
        >
          💬 Chat
        </button>

        <ul
          className="dropdown-menu w-100 listaChats"
          style={{
            backgroundColor: darkMode ? "#1F1F1F" : "#ffffff",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            maxHeight: "350px",
            overflowY: "auto",
          }}
        >
          {chats.length === 0 ? (
            <li
              style={{
                textAlign: "center",
                color: darkMode ? "#f0f0f0" : "#999",
                fontStyle: "italic",
                padding: "20px 0",
                pointerEvents: "none",
              }}
            >
              No tienes conversaciones aún. Agregá amigos para chatear
            </li>
          ) : (
            chats.map((chat) => {
              const esMio = chat.emisorId === usuario.id;
              const nombreEmisor = esMio
                ? "Tú"
                : `${formatearNombre(chat.nombre)}`;

              return (
                <li
                  key={chat.id}
                  onClick={() =>
                    setChatActivo((prev) =>
                      prev?.id === chat.id ? null : chat
                    )
                  }
                  className={chatActivo?.id === chat.id ? "chat-activo" : ""}
                  style={{
                    display: "flex",
                    position: "relative",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 0",
                    borderBottom: darkMode
                      ? "1px solid #494949"
                      : "1px solid #eee",
                    marginBottom: "3px",
                    cursor: "pointer",
                    backgroundColor:
                      chatActivo?.id === chat.id ? "#d1ffd6" : "transparent",
                  }}
                >
                  <img
                    src={chat.avatar || preview}
                    alt={chat.nombre}
                    
                    width={55}
                    height={55}
                    onError={(e) => {
                      e.currentTarget.src = preview;
                    }}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                    className="ms-3"
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong
                      style={{ fontSize: "16px", color: darkMode && "#f0f0f0" }}
                    >
                      {formatearNombre(chat.nombre)}{" "}
                      {formatearNombre(chat.apellido)}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        color: darkMode ? "#cccccc" : "#5a5a5a",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {chat.ultimoMensaje ? (
                        <>
                          <strong>
                            {chat.ultimoMensaje.emisorId === usuario.id
                              ? "Tú"
                              : formatearNombre(chat.nombre)}
                            :
                          </strong>{" "}
                          {chat.ultimoMensaje.imagenUrl ? " 📷 " : ""}{" "}
                          {chat.ultimoMensaje.contenido
                            ? chat.ultimoMensaje.contenido
                            : ""}
                        </>
                      ) : (
                        "Sin mensajes aún"
                      )}
                    </p>
                    <span
                      style={{
                        fontSize: "12px",
                        color: darkMode ? "#888" : "#999",
                        position: "absolute",
                        right: "10px",
                        bottom: "15px",
                      }}
                    >
                      {chat.ultimoMensaje?.createdAt
                        ? new Date(
                            chat.ultimoMensaje.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {chatActivo && (
          <VentanaChat
            chat={chatActivo}
            abrirDropdown={abrirDropdown}
            onCerrar={() => {
              setChatActivo(null);
              abrirDropdown();
            }}
            socket={socketRef.current}
            mensajes={mensajes}
            setMensajes={setMensajes}
          />
        )}
      </div>
    </>
  );
}

export default Chat;
