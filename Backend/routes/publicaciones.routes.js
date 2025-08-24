import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import { cloudinary, storage } from "../utils/Cloudinary.js";
import multer from "multer";
const prisma = new PrismaClient();

const router = Router();
const upload = multer({ storage });

router.post("/", verificarToken, upload.single("imagen"), async (req, res) => {
  
  try {
    const { contenido } = req.body;
    const imagenUrl = req.file?.path || null;
    const autorId = req.usuario.id;

   


    if (!contenido && !imagenUrl) {
      return res
        .status(400)
        .json({ message: "El post debe tener contenido o imagen" });
    }

    if (!autorId) {
      return res.status(401).json({ message: "No autorizado" });
    }


     const usuario = await prisma.usuario.findUnique({
    where: { id: autorId },
  });

  if (!usuario.isVerified) {
    return res.status(403).json({
      message: "Debes verificar tu email antes de crear publicaciones.",
    });
  }
    

    const nuevoPost = await prisma.post.create({
      data: {
        autorId,
        contenido,
        imagenUrl,
      },
    });

    res.status(201).json({ message: "Publicacion Creada con exito" });
  } catch (error) {
    console.error("Error al crear publicación:", error);
    res
      .status(400)
      .json({ error: error.message || "Error al crear publicación" });
  }
});




router.get("/feed", verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    if (!usuarioId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const SolicitudesAceptadas = await prisma.solicitudAmistad.findMany({
      where: {
        estado: "ACEPTADA",
        OR: [{ emisorId: usuarioId }, { receptorId: usuarioId }],
      },
      select: {
        emisorId: true,
        receptorId: true,
      },
    });

    const amigosIds = SolicitudesAceptadas.map((solicitud) => {
      return solicitud.emisorId === usuarioId
        ? solicitud.receptorId
        : solicitud.emisorId;
    });

    amigosIds.push(usuarioId);

    const publicaciones = await prisma.post.findMany({
      where: {
        autorId: {
          in: amigosIds,
        },
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    res.status(200).json(publicaciones);
  } catch (error) {
    console.error("Error al obtener el feed:", error);
    res.status(500).json({ error: "Error al obtener publicaciones del feed" });
  }
});

router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const publicaciones = await prisma.post.findMany({
      where: {
        autorId: usuarioId,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(publicaciones);
  } catch (error) {
    console.error("Error al obtener publicaciones del perfil:", error);
    res
      .status(500)
      .json({ error: "Error al obtener publicaciones del perfil" });
  }
});

router.get("/:publicacionId", verificarToken, async (req, res) => {
  const publicacionId = parseInt(req.params.publicacionId);
  const usuarioId = req.usuario.id;

  try {
    const publicacion = await prisma.post.findUnique({
      where: { id: publicacionId },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
      },
    });

    if (!publicacion) {
      return res.status(404).json({ error: "Publicacion no encontrada" });
    }
    if (usuarioId !== publicacion.autorId) {
      return res.status(403).json({ error: "No autorizado " });
    }
    res.json(publicacion);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la publicacion" });
  }
});

router.delete("/:publicacionId", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const publicacionId = parseInt(req.params.publicacionId);

  try {
    const publicacion = await prisma.post.findUnique({
      where: { id: publicacionId },
    });
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    if (publicacion.autorId !== usuarioId) {
      return res
        .status(403)
        .json({ message: "No autorizado para eliminar esta publicacion" });
    }

    await prisma.post.delete({
      where: { id: Number(publicacionId) },
    });

    res.status(200).json({ message: "Publicacion Eliminada con exito" });
  } catch (error) {
    console.error("Error al eliminar publicacion:", error);
    res.status(500).json({ error: "Error al eliminar publicacion" });
  }
});

router.put(
  "/:id",
  verificarToken,
  upload.single("imagen"),
  async (req, res) => {
    try {
      const publicacionId = parseInt(req.params.id);
      const usuarioId = req.usuario.id;

      const publicacion = await prisma.post.findUnique({
        where: { id: publicacionId },
      });

      if (!publicacion) {
        return res.status(404).json({ error: "Publicacion no encontrada" });
      }

      if (publicacion.autorId !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No autorizado para modificar esta publicacion" });
      }

      const { contenido } = req.body;
      let imagenUrl = publicacion.imagenUrl;

      if (req.file) {
        const resultado = await cloudinary.uploader.upload(req.file.path, {
          folder: "red-social",
        });
        imagenUrl = resultado.secure_url;
      }

      if (!contenido && !imagenUrl) {
        return res
          .status(400)
          .json({ message: "El post debe tener contenido o imagen" });
      }

      const publcacionActualizada = await prisma.post.update({
        where: { id: publicacionId },
        data: {
          contenido,
          imagenUrl,
        },
      });

      res
        .status(200)
        .json({
          message: "Publicacion modificada con exito",
          publicacion: publcacionActualizada,
        });
    } catch (error) {
      console.error("Error al modificar la publicación:", error);
      res.status(500).json({ error: "Error al modificar la publicación" });
    }
  }
);






export default router;
