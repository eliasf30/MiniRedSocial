import { Router } from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { enviarCorreoVerificacion } from "../utils/mailer.js";
import crypto from "crypto";
import axios from "axios";
import { multerErrorHandler } from "../middlewares/multerErrorHandler.js"
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

router.post("/register", upload.single("avatar"), async (req, res) => {
  const { nombre, apellido, email, password, descripcion, captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ error: "Captcha faltante" });
  }

  const avatarPath = req.file
    ? `/uploads/${path.basename(req.file.path)}`
    : `/avatars/default-avatar.jpg`;
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`
    );

    const data = response.data;

    if (!data.success ||  data.score < 0.5) {
      return res.status(400).json({ error: "Captcha inválido o sospechoso" });
    }

    if (!nombre || !email || !password || !apellido) {
      return res.status(400).json({ error: "faltan datos obligatorios" });
    }

    if (nombre.length < 2 || nombre.length > 30) {
      return res
        .status(400)
        .json({ error: "Nombre inválido (2-30 caracteres)" });
    }

    if (apellido.length < 2 || apellido.length > 30) {
      return res
        .status(400)
        .json({ error: "Apellido inválido (2-30 caracteres)" });
    }

    if (descripcion && descripcion.length > 200) {
      return res
        .status(400)
        .json({ error: "Descripción demasiado larga (máximo 200 caracteres)" });
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

    const botId = 2;
    await prisma.solicitudAmistad.create({
      data: {
        emisorId: botId,
        receptorId: user.id,
        estado: "ACEPTADA",
      },
    });

    const io = req.app.locals.io;

    const mensaje = await prisma.mensaje.create({
      data: {
        emisorId: botId,
        receptorId: user.id,
        contenido:
          "¡Hola! 👋 Bienvenido al chat de prueba. Acá podés probar cómo funciona: enviar mensajes de texto, emojis o incluso imágenes.      ",
      },
    });
    io.to(user.id).emit("nuevo-mensaje", mensaje);

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificacionEmail.create({
      data: {
        token,
        usuarioId: user.id,
      },
    });

    await enviarCorreoVerificacion(user.email, token);

    res.status(201).json({
      message: "Usuario creado. Verifica tu correo para activar la cuenta.",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

router.get("/verificar-correo/:token", async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  try {
    const registro = await prisma.verificacionEmail.findUnique({
      where: { token },
      include: { usuario: true },
    });

    if (!registro) {
      const posibleUsuario = await prisma.usuario.findFirst({
        where: {
          verificacionEmail: { none: { token } },
          isVerified: true,
        },
      });

      if (posibleUsuario) {
        return res.json({ message: "Correo verificado exitosamente" });
      }

      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    if (registro.usuario.isVerified) {
      return res.json({ message: "Correo verificado exitosamente" });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { isVerified: true },
    });

    await prisma.verificacionEmail.delete({
      where: { id: registro.id },
    });

    res.json({
      message: "Correo verificado con éxito",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("error verificando correo: ", error);
    res.status(500).json({ message: "error interno del servidor" });
  }
});

router.post("/reenviar-verificacion", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ message: "usuario no encontrado" });
  if (user.isVerified)
    return res.status(400).json({ message: "el usuario ya esta verificado" });

  await prisma.verificacionEmail.deleteMany({
    where: { usuarioId: user.id },
  });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.verificacionEmail.create({
    data: {
      token,
      usuarioId: user.id,
    },
  });

  await enviarCorreoVerificacion(user.email, token);

  res.json({ message: "correo de verificacion reenviado" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no Encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        isAdmin: user.isAdmin,
        descripcion: user.descripcion,
        genero: user.genero,
        fechaNacimiento: user.fechaNacimiento,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        EmailVisible: user.EmailVisible,
        PerfilPrivado: user.PerfilPrivado,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(" Error en login:", error);
  res.status(500).json({ error: "error interno del servidor", detalle: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error al consultar usuarios" });
  }
});

router.get("/buscar", async (req, res) => {
  const query = req.query.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "consulta invalida" });
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { apellido: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      avatar: true,
      descripcion: true,
    },
  });
  res.json(usuarios);
});

router.post(
  "/perfil/editar",
  verificarToken,
  upload.single("avatar"),
  async (req, res) => {
    const { genero, fechaNacimiento, descripcion } = req.body;

    const avatarPath = req.file
      ? `/uploads/${path.basename(req.file.path)}`
      : null;

    try {
      const usuarioActualizado = await prisma.usuario.update({
        where: { id: req.usuario.id },
        data: {
          genero,
          fechaNacimiento: fechaNacimiento
            ? new Date(fechaNacimiento)
            : undefined,
          descripcion,
          ...(avatarPath && { avatar: avatarPath }),
        },
      });
      res.json({
        mensaje: "Perfil actualizado correctamente",
        usuario: {
          id: usuarioActualizado.id,
          nombre: usuarioActualizado.nombre,
          apellido: usuarioActualizado.apellido,
          email: usuarioActualizado.email,
          avatar: usuarioActualizado.avatar,
          descripcion: usuarioActualizado.descripcion,
          genero: usuarioActualizado.genero,
          fechaNacimiento: usuarioActualizado.fechaNacimiento,
          createdAt: usuarioActualizado.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  }
);

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  let solicitanteId = null;

  // Verificamos si hay token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      solicitanteId = decoded.id; // id del usuario logueado
    } catch (err) {
      console.error("Token inválido, visitante anónimo");
    }
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let esAmigo = false;

    if (solicitanteId) {
      const amistad = await prisma.solicitudAmistad.findFirst({
        where: {
          estado: "ACEPTADA",
          OR: [
            { emisorId: solicitanteId, receptorId: usuario.id },
            { emisorId: usuario.id, receptorId: solicitanteId },
          ],
        },
      });
      esAmigo = Boolean(amistad);
    }

    const usuarioSeguro = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      avatar: usuario.avatar,
      descripcion: usuario.descripcion,
      fechaNacimiento: usuario.fechaNacimiento,
      genero: usuario.genero,
      createdAt: usuario.createdAt,
      PerfilPrivado: usuario.PerfilPrivado,
      EmailVisible: usuario.EmailVisible,
      email: usuario.EmailVisible ? usuario.email : "******",
      esAmigo,
    };

    res.json(usuarioSeguro);
  } catch (error) {
    res.status(500).json({ error: "error al consuitar el usuario" });
  }
});

router.put("/mostrar-email", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { visible } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const actualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { EmailVisible: visible },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "error al cambiar la visibilidad del mail" });
  }
});

router.put("/perfil-privado", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { estado } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const actualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { PerfilPrivado: estado },
    });

    res.json(actualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error al cambiar privacidad de la cuenta" });
  }
});

router.use(multerErrorHandler);

export default router;
