import express from "express";
import { fileURLToPath } from 'url';
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import usuariosRoutes from "./routes/usuarios.routes.js";
import amigosRoutes from "./routes/amigos.routes.js";
import publicacionesRouter from "./routes/publicaciones.routes.js";
import http from "http";
import chatRoutes from "./routes/Chat.routes.js";

import { verificarSocket } from "./middlewares/authIo.js";

import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log("PORT:", process.env.PORT || "No definido");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "OK" : "No definido");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "No definido");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
     origin: [
    "http://localhost:5173",     // vite en local
    "http://192.168.0.51:5000", // tu IP en local
    "https://miniredsocial-production.up.railway.app" // producción
  ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

app.locals.io = io;

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/amigos", amigosRoutes);
app.use("/api/publicaciones", publicacionesRouter);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/avatars", express.static(path.join(process.cwd(), "avatars")));





io.use(verificarSocket);
io.on("connection", (socket) => {
  

  socket.on("joinRoom", ({ emisorId, receptorId }) => {
    const roomId =
      emisorId < receptorId
        ? `${emisorId}_${receptorId}`
        : `${receptorId}_${emisorId}`;
    socket.join(roomId);
  
  });

  socket.on(
    "mensaje",
    async ({ emisorId, receptorId, contenido, imagenUrl }) => {
      try {
        const mensaje = await prisma.mensaje.create({
          data: {
            contenido,
            imagenUrl,
            emisorId,
            receptorId,
          },
          include: {
            emisor: {
              select: { id: true, nombre: true, apellido: true, avatar: true },
            },
          },
        });

        const roomId =
          emisorId < receptorId
            ? `${emisorId}_${receptorId}`
            : `${receptorId}_${emisorId}`;

        io.to(roomId).emit("mensaje-recibido", mensaje);
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        socket.emit("error", { message: "No se pudo enviar el mensaje" });
      }
    }
  );

  socket.on("disconnect", () => {
    
  });
});



app.use(express.static(path.join(__dirname, '../Frontend/dist')));


app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});



const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log(`servidor corriendo en el puerto ${PORT}`);
});
