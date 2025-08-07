import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/:receptorId/estado", verificarToken, async (req, res) => {
  const emisorId = req.usuario.id;
  const receptorId = parseInt(req.params.receptorId);

  if (emisorId === receptorId) {
    return res
      .status(400)
      .json({ message: "No podes consultarte a vos mismo" });
  }

  try {
    const solicitud = await prisma.solicitudAmistad.findFirst({
      where: {
        OR: [
          { emisorId, receptorId },
          { emisorId: receptorId, receptorId: emisorId },
        ],
      },
      select: {
        estado: true,
      },
    });

    if (!solicitud) {
      return res.json({ estado: "NINGUNO" });
    }

    return res.json({ estado: solicitud.estado });
  } catch (error) {
    console.error("Error consultando estado de amistad:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const amistades = await prisma.solicitudAmistad.findMany({
      where: {
        estado: "ACEPTADA",
        OR: [{ emisorId: usuarioId }, { receptorId: usuarioId }],
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            descripcion: true,
            avatar: true,
          },
        },
        receptor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            descripcion: true,
            avatar: true,
          },
        },
      },
    });

    const amigos = amistades
      .map((amistad) => {
        const amigo =
          amistad.emisorId === usuarioId ? amistad.receptor : amistad.emisor;
        return {
          solicitudId: amistad.id,
          ...amigo,
        };
      })
      .filter((amigo) => {
        const coincideNombre = req.query.nombre
          ? amigo.nombre.toLowerCase().includes(req.query.nombre.toLowerCase())
          : true;
        const coincideApellido = req.query.apellido
          ? amigo.apellido
              .toLowerCase()
              .includes(req.query.apellido.toLowerCase())
          : true;
        return coincideNombre && coincideApellido;
      });
    return res.json(amigos);
  } catch (error) {
    console.error("Error al obtener amigos:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

router.post("/:receptorId", verificarToken, async (req, res) => {
  const emisorId = req.usuario.id;
  const receptorId = parseInt(req.params.receptorId);

  if (emisorId === receptorId) {
    return res
      .status(400)
      .json({ message: "no te podes enviar solicitud a vos mismo" });
  }

  try {
    const solicitudExistente = await prisma.solicitudAmistad.findFirst({
      where: {
        OR: [
          { emisorId, receptorId },
          { emisorId: receptorId, receptorId: emisorId },
        ],
      },
    });

    if (solicitudExistente) {
      if (solicitudExistente.estado === "RECHAZADA") {
        await prisma.solicitudAmistad.update({
          where: { id: solicitudExistente.id },
          data: {
            emisorId,
            receptorId,
            estado: "PENDIENTE",
          },
        });
        return res.json({ message: "Solicitud reenviada correctamente." });
      } else if (solicitudExistente.estado === "ACEPTADA") {
        return res
          .status(400)
          .json({ message: "Ya son amigos.", estado: "PENDIENTE" });
      } else if (solicitudExistente.estado === "PENDIENTE") {
        return res
          .status(400)
          .json({ message: "Ya existe una solicitud pendiente." });
      }
    }

    const nuevaSolicitud = await prisma.solicitudAmistad.create({
      data: {
        emisorId,
        receptorId,
        estado: "PENDIENTE",
      },
    });

    res.status(201).json({
      message: "solicitud de amistad enviada",
      solicitud: nuevaSolicitud,
    });
  } catch (error) {
    console.error("Error enviando solicitud de amistad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.patch(
  "/:solicitudId/aceptar",
  verificarToken,
  async (req, res) => {
    const usuarioId = req.usuario.id;
    const solicitudId = parseInt(req.params.solicitudId);

    try {
      const solicitud = await prisma.solicitudAmistad.findUnique({
        where: { id: solicitudId },
      });

      if (!solicitud) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      if (solicitud.receptorId !== usuarioId) {
        return res
          .status(404)
          .json({ error: "No autorizado para aceptar esta solicitud" });
      }

      if (solicitud.estado !== "PENDIENTE") {
        return res
          .status(400)
          .json({ error: "La solicitud ya fue procesada previamente" });
      }

      const solicitudActualizada = await prisma.solicitudAmistad.update({
        where: { id: solicitudId },
        data: { estado: "ACEPTADA" },
      });

      res.json({
        message: "Solicitud aceptada",
        solicitud: solicitudActualizada,
      });
    } catch (error) {
      console.error("Error aceptando solicitud:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.patch(
  "/:solicitudId/rechazar",
  verificarToken,
  async (req, res) => {
    const usuarioId = req.usuario.id;
    const solicitudId = parseInt(req.params.solicitudId);

    try {
      const solicitud = await prisma.solicitudAmistad.findUnique({
        where: { id: solicitudId },
      });

      if (!solicitud) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      if (solicitud.receptorId !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No autorizado para rechazar esta solicitud" });
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
  }
);

router.get(
  "/solicitudes-pendientes",
  verificarToken,
  async (req, res) => {
    const usuarioId = req.usuario.id;
    const tipo = req.query.tipo;

    try {
      let solicitudes;

      if (tipo === "enviadas") {
        solicitudes = await prisma.solicitudAmistad.findMany({
          where: {
            emisorId: usuarioId,
            estado: "PENDIENTE",
          },
          include: {
            receptor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatar: true,
                descripcion: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } else {
        // por defecto o si tipo === 'recibidas'
        solicitudes = await prisma.solicitudAmistad.findMany({
          where: {
            receptorId: usuarioId,
            estado: "PENDIENTE",
          },
          include: {
            emisor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatar: true,
                descripcion: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }

      res.json(solicitudes);
    } catch (error) {
      console.error("Error obteniendo solicitudes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.delete(
  "/:solicitudId/cancelar",
  verificarToken,
  async (req, res) => {
    const solicitudId = parseInt(req.params.solicitudId);
    const usuarioId = req.usuario.id;
    try {
      const solicitud = await prisma.solicitudAmistad.findUnique({
        where: { id: solicitudId },
      });

      if (!solicitud || (solicitud.emisorId !== usuarioId && solicitud.receptorId !== usuarioId)) {
        return res.status(403).json({ mensaje: "No autorizado" });
      }

      await prisma.solicitudAmistad.delete({
        where: { id: solicitudId },
      });

      res.status(200).json({ mensaje: "Solicitud cancelada correctamente" });
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
      res.status(500).json({ mensaje: "Error al eliminar solicitud" });
    }
  }
);

export default router;
