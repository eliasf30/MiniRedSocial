import { useState, useRef, useEffect } from "react";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import { useNavigate } from "react-router";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useAuth } from "../../context/useAuth";
import { cargarMensajesHistoricos } from "../../services/chatServices";
import { subirImagen } from "../../services/chatServices";
import { toast } from "react-toastify";
function VentanaChat({
  chat,
  onCerrar,
  abrirDropdown,
  socket,
  mensajes,
  setMensajes,
}) {
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const contenedorRef = useRef(null);
  const navigate = useNavigate();
  const { usuario, darkMode, colorTema, coloresNavbar } = useAuth();

  const colorActual = darkMode
    ? coloresNavbar.oscuro[colorTema]
    : coloresNavbar.claro[colorTema];

  const neonBoxStyle = {
    backgroundColor: colorActual,
    ...(colorTema !== "default" && {
      boxShadow: `
     
      
    `,
    }),
  };

  // Cerrar emoji picker si clickeas afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !e.target.closest("[data-emoji-button]")
      ) {
        setEmojiPickerVisible(false);
      }
    }
    if (emojiPickerVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerVisible]);

  // Scroll infinito hacia arriba
  const handleScroll = async () => {
    if (!contenedorRef.current || cargandoMas || !hayMas) return;

    if (contenedorRef.current.scrollTop === 0) {
      setCargandoMas(true);

      const primerId = mensajes.length > 0 ? mensajes[0].id : null;
      if (!primerId) {
        setCargandoMas(false);
        return;
      }

      const nuevos = await cargarMensajesHistoricos(
        usuario.id, // emisor
        chat.id, // receptor
        primerId, // para traer más viejos que este
        20
      );

      if (nuevos.length === 0) {
        setHayMas(false);
      } else {
        const alturaAntes = contenedorRef.current.scrollHeight;
        setMensajes((prev) => [...nuevos, ...prev]);

        setTimeout(() => {
          const alturaDespues = contenedorRef.current.scrollHeight;
          contenedorRef.current.scrollTop = alturaDespues - alturaAntes;
        }, 0);
      }

      setCargandoMas(false);
    }
  };

  useEffect(() => {
    if (socket && chat) {
      socket.emit("joinRoom", { emisorId: usuario.id, receptorId: chat.id });
    }
  }, [socket, chat]);

  useEffect(() => {
    if (contenedorRef.current) {
      contenedorRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (contenedorRef.current) {
        contenedorRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [mensajes, cargandoMas, hayMas]);

  useEffect(() => {
    if (!socket) return;

    const handleMensajeRecibido = (mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    };

    socket.on("mensaje-recibido", handleMensajeRecibido);

    return () => {
      socket.off("mensaje-recibido", handleMensajeRecibido);
    };
  }, [socket]);

  const handleCerrar = () => {
    onCerrar();
    setTimeout(() => {
      abrirDropdown();
    }, 50);
  };

  useEffect(() => {
    if (!contenedorRef.current || cargandoMas) return;

    contenedorRef.current.scrollTop = contenedorRef.current.scrollHeight;
  }, [mensajes, cargandoMas]);

  const handleEnviarMensaje = async () => {
    if (nuevoMensaje.trim() === "" && !imagenPreview) return;
    setEnviando(true);
    let imagenUrl = null;

    if (imagenPreview) {
      const formData = new FormData();
      formData.append("imagen", imagenPreview);

      try {
        const { data } = await subirImagen(formData);
        imagenUrl = data.imagenUrl;
      } catch (error) {
        console.error("Error subiendo la imagen:", error);
        toast.error("error al enviar imagen");
        setEnviando(false);
        return;
      }
    }

    socket.emit("mensaje", {
      emisorId: usuario.id,
      receptorId: chat.id,
      contenido: nuevoMensaje.trim(),
      imagenUrl,
    });

    setNuevoMensaje("");
    setImagenPreview(null);
    inputRef.current?.focus();

    setEnviando(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const agregarEmoji = (emoji) => {
    setNuevoMensaje((m) => m + emoji.native);
    inputRef.current?.focus();
  };

  if (!chat) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "60px",
        right: "20px",
        width: "350px",
        height: "450px",
        backgroundColor: darkMode ? "black" : "white",
        border: "1px solid #ccc",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          padding: "6px 10px",
          backgroundColor: darkMode ? "#1F1F1F" : "#DFDFDF",
          ...neonBoxStyle,
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <button
          onClick={handleCerrar}
          style={{
            border: "none",
            background: "none",
            fontSize: "20px",
            cursor: "pointer",
            margin: "0",
            padding: "0 15px 0 0",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Cerrar chat"
          title="Cerrar chat"
        >
          <i
            className="bi bi-chevron-left"
            style={{ color: darkMode ? "#F0F1F2" : "black" }}
          ></i>
        </button>
        <div
          onClick={() => navigate(`/usuarios/${chat.id}`)}
          className="d-flex justify-content-center align-items-center"
          style={{ flexShrink: 0, cursor: "pointer" }}
        >
          <img
            src={chat.avatar ? `${chat.avatar}` : preview}
            alt={chat.nombre}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover", marginRight: 10 }}
            draggable="false"
          />
          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            {formatearNombre(chat.nombre)} {formatearNombre(chat.apellido)}
          </h4>
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={contenedorRef}
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: 10,
          borderRadius: "0 0 8px 8px",
          backgroundColor: darkMode ? "#161616" : "#fafafa",
        }}
      >
        {cargandoMas && <div style={{ textAlign: "center" }}>Cargando...</div>}
        {mensajes.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.emisorId === usuario.id ? "flex-end" : "flex-start",
              marginBottom: "6px",
            }}
          >
            <div
              title={`Enviado el ${new Date(m.createdAt).toLocaleDateString(
                "es-AR"
              )} a las ${new Date(m.createdAt).toLocaleTimeString("es-AR")}`}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                padding: "6px 10px",
                borderRadius: "12px",
                backgroundColor:
                  m.emisorId === usuario.id
                    ? darkMode
                      ? "#3b5a3b"
                      : "#d1ffd6"
                    : darkMode
                    ? "#2C2C2C"
                    : "#f0f0f0",
                maxWidth: "80%",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                gap: "4px",
              }}
            >
              {m.imagenUrl && (
                <img
                  src={m.imagenUrl}
                  alt="imagen enviada"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              )}
              {m.contenido && <span>{m.contenido}</span>}
            </div>
          </div>
        ))}
      </div>
      {imagenPreview && (
        <div
          className="img-background"
          style={{
            position: "relative",
            margin: "5px 10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "5px",

            maxHeight: "120px",
            overflow: "hidden",
          }}
        >
          <button
            className="btn p-1 m-1 border-0 bg-transparent"
            onClick={() => setImagenPreview(null)}
            style={{
              position: "absolute",

              right: 0,
              top: 0,
            }}
          >
            <i className="bi bi-trash"></i>
          </button>
          <img
            src={URL.createObjectURL(imagenPreview)}
            alt="preview"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: "8px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Input y botones */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 10px 10px 10px",
          borderTop: "1px solid #ddd",
          backgroundColor: darkMode ? "#1F1F1F" : "#f9f9f9",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          position: "relative",
        }}
      >
        {/* Botón cámara */}
        <button
          type="button"
          title="Agregar imagen"
          style={{
            border: "none",
            backgroundColor: darkMode ? "#2e2e2e" : "#eee",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#666",
          }}
          onClick={() => document.getElementById("imagen-chat").click()}
        >
          📷
        </button>
        <input
          type="file"
          id="imagen-chat"
          accept="image/*"
          onChange={(e) => setImagenPreview(e.target.files[0])}
          className="m-3 ms-1 form-control d-none"
        />

        {/* Input con emoji */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribí un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{
              width: "100%",
              padding: "8px 32px 8px 12px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "14px",
            }}
          />
          <button
            type="button"
            data-emoji-button
            onClick={() => setEmojiPickerVisible((v) => !v)}
            style={{
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
              userSelect: "none",
              color: "#666",
              padding: 0,
              lineHeight: 1,
            }}
            title="Emojis"
          >
            😊
          </button>

          {emojiPickerVisible && (
            <div
              ref={pickerRef}
              style={{
                position: "absolute",
                zIndex: 9999,
                bottom: "2.5rem",
                right: 0,
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={agregarEmoji}
                locale="es"
                theme={darkMode ? "dark" : "light"}
              />
            </div>
          )}
        </div>

        {/* Botón enviar */}
        <button
          type="button"
          onClick={handleEnviarMensaje}
          disabled={(nuevoMensaje.trim() === "" && !imagenPreview) || enviando}
          style={{
            backgroundColor:
              (nuevoMensaje.trim() === "" && !imagenPreview) || enviando
                ? darkMode
                  ? "#505050"
                  : "#ccc"
                : "#4CAF50",
            border: "none",
            color: "white",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            cursor:
              (nuevoMensaje.trim() === "" && !imagenPreview) || enviando
                ? "not-allowed"
                : "pointer",
            fontWeight: "bold",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            padding: 0,
          }}
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
        >
          {enviando ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}

export default VentanaChat;
