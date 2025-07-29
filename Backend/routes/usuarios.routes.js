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
    if (!nombre || !email || !password || !apellido) {
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

    const token = crypto.randomBytes(32).toString("hex")

    await prisma.verificacionEmail.create({
      data: {
        token,
        usuarioId: user.id
      },
    })

    await enviarCorreoVerificacion(user.email, token)
    console.log("Mail enviado a:", user.email)
  
    res.status(201).json({
      message: "Usuario creado. Verifica tu correo para activar la cuenta.",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error interno del servidor" });
  }
});

router.get("/verificar-correo/:token", async(req,res) =>{
  const {token} = req.params;
   if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    const registro = await prisma.verificacionEmail.findUnique({
      where: {token},
      include:{usuario: true},
    })

    if(!registro){
      const posibleUsuario = await prisma.usuario.findFirst({
        where: {
          verificacionEmail: { none: { token } },
          isVerified: true
        }
      });

      if (posibleUsuario) {
        return res.json({ message: "Correo verificado exitosamente" });
      }

      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    if (registro.usuario.isVerified) {
      return res.json({ message: "Correo verificado exitosamente"  });
    }

   const usuarioActualizado = await prisma.usuario.update({
  where: { id: registro.usuarioId },
  data: { isVerified: true }
});

    await prisma.verificacionEmail.delete({
      where: {id: registro.id}
    })

    res.json({
  message: "Correo verificado con éxito",
  usuario: usuarioActualizado  
});


  } catch (error) {
    console.error("error verificando correo: ", error)
    res.status(500).json({message: "error interno del servidor"})
  }

})

router.post("/reenviar-verificacion", async(req,res) =>{
  const {email} = req.body
  const user = await prisma.usuario.findUnique({where: {email}})

  if(!user) return res.status(404).json({message: "usuario no encontrado"})
  if(user.isVerified) return res.status(400).json({message: "el usuario ya esta verificado"})

    await prisma.verificacionEmail.deleteMany({
    where: { usuarioId: user.id }
  });

  const token = crypto.randomBytes(32).toString("hex");
  
   await prisma.verificacionEmail.create({
    data: {
      token,
      usuarioId: user.id
    },
  });

  await enviarCorreoVerificacion(user.email, token);

  res.json({message: "correo de verificacion reenviado"})

})


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
        createdAt: user.createdAt
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

router.get("/buscar", async (req,res) =>{

  const query = req.query.query;

  if(!query || typeof query !== "string"){
    return res.status(400).json({error:"consulta invalida"})
  }

  const usuarios = await prisma.usuario.findMany({
    where:{
      OR:[
        {nombre: {contains: query, mode:"insensitive"}},
        {apellido: {contains: query, mode: "insensitive"}},
        {email: {contains: query, mode: "insensitive"}}
      ],
    },
    take: 10,
    select:{
      id:true,
      nombre: true,
      apellido: true,
      avatar: true,
      descripcion: true
    },
  })
    res.json(usuarios);
})







router.post("/perfil/editar",   verificarToken, upload.single("avatar"), async(req,res) => {
  
  const {genero,fechaNacimiento,descripcion} = req.body

    const avatarPath = req.file
    ? `/uploads/${path.basename(req.file.path)}`
    : null;
 
  try {
      const usuarioActualizado = await prisma.usuario.update({
        where: {id: req.usuario.id},
        data:{
          genero,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
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
        createdAt:usuarioActualizado.createdAt,
  },
});
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
})


router.post("/amigos/:receptorId", verificarToken, async(req,res) =>{

  const emisorId = req.usuario.id
  const receptorId = parseInt(req.params.receptorId)

  if (emisorId === receptorId){
    return res.status(400).json({error: "no te podes enviar solicitud a vos mismo"})
  }

  try {
    const solicitudExistente = await prisma.solicitudAmistad.findFirst({
      where: {
        OR:[
          {emisorId, receptorId},
          {emisorId: receptorId, receptorId: emisorId},
        ],
      },
    });

    if(solicitudExistente){
      return res.status(400).json({error: "ya existe una solicitud o amistad entre usuarios"})
    }

    const nuevaSolicitud = await prisma.solicitudAmistad.create({
      data:{
        emisorId,
        receptorId,
        estado: "PENDIENTE",
      }
    })

    res.status(201).json({
      message: "solicitud de amistad enviada",
      solicitud: nuevaSolicitud,
    });  
  } catch (error) {
       console.error("Error enviando solicitud de amistad:", error);
       res.status(500).json({ error: "Error interno del servidor" });
  }

})

router.patch("/amigos/:solicitudId/aceptar", verificarToken, async(req,res) =>{
  
  const usuarioId = req.usuario.id;
  const solicitudId = parseInt(req.params.solicitudId)

  try {
    const solicitud = await prisma.findUnique({
      where:{id:solicitudId}
    })

    if(!solicitud){
      return res.status(404).json({error:"Solicitud no encontrada"});
    }

    if(!solicitud.receptorId !== usuarioId){
      return res.status(404).json({error: "No autorizado para aceptar esta solicitud"})
    }

    if(solicitud.estado !== "PENDIENTE"){
      return res.status(400).json({error: "La solicitud ya fue procesada previamente"})
    }

    const solicitudActualizada = await prisma.solicitudAmistad.update({
      where: {id: solicitudId},
      data: {estado: "ACEPTADA"}
    });

    res.json({
      message: "Solicitud aceptada",
      solicitud: solicitudActualizada
    })
  
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.patch("/amigos/:solicitudId/rechazar", verificarToken, async(req,res) =>{
  
  const usuarioId = req.usuario.id;
  const solicitudId = parseInt(req.params.solicitudId)

  try {
      const solicitud = await prisma.solicitudAmistad.findUnique({
      where: { id: solicitudId },
    });

    if(!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    if(solicitud.receptorId !== userId) {
      return res.status(403).json({ error: "No autorizado para rechazar esta solicitud" });
    }

    if (solicitud.estado !== "PENDIENTE") {
      return res.status(400).json({ error: "La solicitud ya fue procesada" });
    }

     const solicitudActualizada = await prisma.solicitudAmistad.update({
      where: { id: solicitudId },
      data: { estado: "RECHAZADA" },
    });


    res.json({
      message: "Solicitud rechazada",
      solicitud: solicitudActualizada,
    });

  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }

})

router.get("/amigos/solicitudes-pendientes", verificarToken, async(req,res) =>{
  const usuarioId = req.usuario.id

  try {
    const solicitudesPendientes = await prisma.solicitudAmistad.findMany({
      where: {
        receptorId: userId,
        estado: "PENDIENTE",
      },
      include:{
        emisor:{
          select:{
            id: true,
            nombre: true,
            apellido: true,
            acatar: true,
            descripcion: true,
          },
        },
      },
      orderBy: {
        createdAt:"desc",
      },
    });
    res.json(solicitudesPendientes);

  } catch (error) {
    console.error("Error obteniendo solicitudes pendientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})


router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error al consuitar el usuario" });
  }
});


export default router;
