import { Router } from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, jpeg, png)"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
});

router.post("/register", upload.single("avatar"), async (req, res) => {
  const { nombre, apellido, email, password, descripcion } = req.body;

 const avatarPath = req.file
  ? `/uploads/${path.basename(req.file.path)}`
  : `/avatars/default-avatar.jpg`;
  try {
    if (!nombre || !email || !password ||!apellido) {
      return res.status(400).json({ error: "faltan datos obligatorios" });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "el email ya esta registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password: hashedPassword,
        descripcion,
        avatar: avatarPath,
      },
    });

    res.status(201).json({
      message: "usuario creado exitosamente",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error al consultar usuarios" });
  }
});


router.get("/:id", async (req,res) =>{
  const {id} = req.params

  try {
    const usuario = await prisma.usuario.findUnique({
      where:{id: parseInt(id)}
    })

    if(!usuario){
      return res.status(404).json({error: "Usuario no encontrado"})
    }

    res.json(usuario)
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "error al consuitar el usuario"})
  }

  
})






export default router;
