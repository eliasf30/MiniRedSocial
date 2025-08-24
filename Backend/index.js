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

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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

const PORT = process.env.PORT || 5000;





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


server.listen(PORT, () => {
  console.log(`servidor corriendo en el puerto ${PORT}`);
});
