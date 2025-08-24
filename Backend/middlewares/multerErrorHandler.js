import multer from "multer";

export const multerErrorHandler = (err,req,res,next) => {
    if(err instanceof multer.MulterError){
    if(err.code == "LIMIT_FILE_SIZE"){
        return res.status(400).json({error: "La imagen es demasiado grande (máx 5MB) "})
    }
    return res.status(400).json({ error: `Error al subir la imagen: ${err.message}` });
}else if (err.message && err.message.includes("Solo se permiten imágenes")){
    return res.status(400).json({error: "Formato de imagen no valido (solo jpg, jpeg,png)"})
}

next(err)

}