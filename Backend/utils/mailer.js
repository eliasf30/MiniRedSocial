import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,          // TLS
  secure: false,      // false para STARTTLS
  auth: {
    user: "resend",   // usuario fijo en Resend
    pass: process.env.RESEND_API_KEY, // tu API key en Railway
  },
  logger: true,
  debug: true,
});

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verificar-correo/${token}`;

  try {
    await transporter.sendMail({
      from: "onboarding@resend.dev", // debe ser un dominio verificado en Resend
      to: email,
      subject: "Verifica tu correo",
      html: `
        <h2>¡Bienvenido!</h2>
        <p>Haz click en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${url}">${url}</a>
      `,
    });

    console.log(`Correo enviado a ${email}`);
  } catch (error) {
    console.error("Error enviando correo:", error?.response || error);
    throw error;
  }
};