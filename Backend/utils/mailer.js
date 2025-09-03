import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verificar-correo/${token}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // funciona sin dominio propio
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
    console.error("Error enviando correo:", error);
    throw error;
  }
};