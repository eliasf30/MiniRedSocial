import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreoVerificacion = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verificar-correo/${token}`;

  console.log("Intentando enviar correo de verificación a:", email);

  try {
    const emailResponse = await resend.emails.send({
      from: "noreply@miniredsocial.org", 
      to: email,
      subject: "Verifica tu correo",
      html: `
        <h2>¡Bienvenido!</h2>
        <p>Haz click en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${url}">${url}</a>
      `,
    });

    console.log(`Correo enviado a ${email}. ID del envío:`, emailResponse.id);
  } catch (error) {
    console.error("Error enviando correo con Resend:", error);
    throw error;
  }
};