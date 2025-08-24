import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

export const enviarCorreoVerificacion = async(email,token) =>{
    const url =  `http://192.168.0.51:5173/verificar-correo/${token}`;

 try {
     await transporter.sendMail({
        from: `"MiniRedSocial" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "verifica  tu correo",
        html: `
            <h2>¡Bienvenido!</h2>
            <p> Hace click en el siguiente enlace para verificar tu cuenta </p>
            <a href="${url}">${url}</a>
        
        `
        
    });
 } catch (error) {
     console.error("Error enviando correo:", error);
    throw error;
 }
   

};