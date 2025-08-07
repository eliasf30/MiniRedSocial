import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import usuariosRoutes from "./routes/usuarios.routes.js";
import amigosRoutes from "./routes/amigos.routes.js";
import publicacionesRouter from "./routes/publicaciones.routes.js";


dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/amigos", amigosRoutes);
app.use("/api/publicaciones", publicacionesRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/avatars", express.static(path.join(process.cwd(), "public/avatars")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`servidor corriendo en el puerto ${PORT}`)
})