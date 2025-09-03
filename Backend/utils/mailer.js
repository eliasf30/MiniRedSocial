import nodemailer from "nodemailer";

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verificar-correo/${token}`;

  console.log("Intentando enviar correo de verificación a:", email);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // contraseña de aplicación
      },
    });

    const mailOptions = {
      from: `"MiRedSocial" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verifica tu correo",
      html: `
        <h2>¡Bienvenido!</h2>
        <p>Haz click en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${url}">${url}</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando correo con Nodemailer:", error);
    throw error;
  }
};