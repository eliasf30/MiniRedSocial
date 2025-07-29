import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const crearBot = async () => {
  try {
    const hashedPassword = await bcrypt.hash("aaaaaa", 10);

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: "bot@test.com" },
    });

    if (usuarioExistente) {
      console.log("Ya existe un bot con ese email.");
      return;
    }

    const nuevoBot = await prisma.usuario.create({
      data: {
        nombre: "Bot",
        apellido: "de Prueba",
        email: "bot@test.com",
        password: hashedPassword,
        descripcion: "Cuenta de prueba automatizada para desarrollo.",
        avatar: "https://robohash.org/bot123?set=set1", // podés cambiar el link si querés otro diseño
      },
    });

    console.log("✅ Bot creado con éxito:", nuevoBot);
  } catch (error) {
    console.error("❌ Error al crear el bot:", error);
  } finally {
    await prisma.$disconnect();
  }
};

crearBot();