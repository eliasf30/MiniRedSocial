import { useAuth } from "../../context/useAuth";
import { Navigate, useNavigate } from "react-router";
import preview from "../../images/preview.png"

const chatsMock = [
  {
    id: 1,
    nombre: "Juan Pérez",
    avatar: "/avatars/juan.jpg",
    ultimoMensaje: "¡Hola! ¿Cómo estás?",
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    avatar: "/avatars/ana.jpg",
    ultimoMensaje: "Te mando el archivo que me pediste.",
  },
  {
    id: 3,
    nombre: "Carlos Díaz",
    avatar: "/avatars/carlos.jpg",
    ultimoMensaje: "¿Nos vemos mañana?",
  },
];

function ChatListItem({ chat, onClick }) {
  return (
    <div
      className="mb-2 d-flex align-items-center"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <img
        src={preview}
        alt={`${chat.nombre} avatar`}
        draggable="false"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: "0.75rem",
        }}
      />
      <div>
        <strong>{chat.nombre}</strong>
        <p
          className="mb-0 text-truncate"
          style={{ maxWidth: "250px", fontSize: "0.9rem", color: "#555" }}
        >
          {chat.ultimoMensaje}
        </p>
      </div>
    </div>
  );
}

function Chat() {
  const { usuario } = useAuth();
  const URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate()
  return (
    <>
      <div
        className="dropup position-fixed bottom-0 end-0 m-3 z-3"
        style={{ width: "350px" }}
      >
        <button
          className="btn dropdown-toggle w-100 text-start"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{
            backgroundColor: "#f0f0f0",
            border: "1px solid gray",
            height: "45px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            fontWeight: 500,
            color: "#333",
          }}
        >
          💬 Chat
        </button>

        <ul
          className="dropdown-menu w-100 p-3"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {chatsMock.length === 0 && (
          <p className="text-muted mb-2">No hay mensajes aún.</p>
        )}

        {chatsMock.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            onClick={() => navigate(`/chat/${chat.id}`)}
          />
        ))}

        <input
          className="form-control mt-2"
          type="text"
          placeholder="Buscar chat..."
          onChange={(e) => {
            // Podrías agregar filtro aquí luego
          }}
        />
        </ul>
      </div>
    </>
  );
}

export default Chat;
