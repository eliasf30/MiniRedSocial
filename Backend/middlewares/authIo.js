import jwt from "jsonwebtoken"

export function verificarSocket(socket, next){
    const token = socket.handshake.auth.token
    if(!token){
        return next(new Error("token requerido"))
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.usuario = decoded;
        next();
    } catch (error) {
           next(new Error("Token inválido o expirado"))
    }

}