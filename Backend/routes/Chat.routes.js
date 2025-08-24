import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { cloudinary, storage } from "../utils/Cloudinary.js";

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage });

router.get("/lista", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const solicitudesAceptadas = await prisma.solicitudAmistad.findMany({
      where: {
        estado: "ACEPTADA",
        OR: [{ emisorId: usuarioId }, { receptorId: usuarioId }],
      },
      include: {
        emisor: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
        receptor: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
      },
    });

    const amigos = solicitudesAceptadas.map((solicitud) =>
      solicitud.emisorId === usuarioId ? solicitud.receptor : solicitud.emisor
    );

    const amigosConUltimoMensaje = await Promise.all(
      amigos.map(async (amigo) => {
        const ultimoMensaje = await prisma.mensaje.findFirst({
          where: {
            OR: [
              { emisorId: usuarioId, receptorId: amigo.id },
              { emisorId: amigo.id, receptorId: usuarioId },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        return {
          id: amigo.id,
          nombre: amigo.nombre,
          apellido: amigo.apellido,
          avatar: amigo.avatar,
          ultimoMensaje: ultimoMensaje
            ? {
                id: ultimoMensaje.id,
                contenido: ultimoMensaje.contenido,
                emisorId: ultimoMensaje.emisorId,
                receptorId: ultimoMensaje.receptorId,
                imagenUrl: ultimoMensaje.imagenUrl,
                createdAt: ultimoMensaje.createdAt,
                leido: ultimoMensaje.leido,
              }
            : null,
        };
      })
    );
    res.json(amigosConUltimoMensaje);
  } catch (error) {
    console.error("Error en /api/chat/lista:", error);
    res.status(500).json({ error: "Error al obtener la lista de chats" });
  }
});

router.get("/:emisorId/:receptorId", verificarToken, async (req, res) => {
  const { emisorId, receptorId } = req.params;
  const { lastMessageId, limit = 20 } = req.query;

  try {
    const whereCondition = {
      OR: [
        { emisorId: Number(emisorId), receptorId: Number(receptorId) },
        { emisorId: Number(receptorId), receptorId: Number(emisorId) },
      ],
    };

    if (lastMessageId) {
      whereCondition.id = { lt: Number(lastMessageId) };
    }

    let mensajes = await prisma.mensaje.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      include: {
        emisor: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
      },
    });

    mensajes = mensajes.reverse();

    res.json(mensajes);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

router.post("/subir-imagen", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se envió imagen" });

    const resultado = await cloudinary.uploader.upload(req.file.path, {
      folder: "red-social",
    });
    res.status(200).json({ imagenUrl: resultado.secure_url });
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    res.status(500).json({ error: "Error subiendo imagen" });
  }
});

export default router;
