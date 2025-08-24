import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { useForm } from "react-hook-form";
import { crearPublicacion } from "../../services/publicacionesServices";
import { toast } from "react-toastify";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import GraphemeSplitter from "grapheme-splitter";

function CrearPublicacion({ onPublicar }) {
  const { usuario,darkMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagenUrl, setImagemUrl] = useState("");
  const [previewImagen, setPreviewImagen] = useState(null);
  const { register, handleSubmit, watch, reset } = useForm();
  const imagen = watch("imagenUrl");
  const [contenido, setContenido] = useState("");
  const pickerRef = useRef(null);
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const splitter = new GraphemeSplitter();

  useEffect(() => {
    const archivo = watch("imagenUrl")?.[0];
    if (archivo) {
      const url = URL.createObjectURL(archivo);
      setPreviewImagen(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewImagen(null);
    }
  }, [watch("imagenUrl")]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setMostrarEmojis(false);
      }
    };

    if (mostrarEmojis) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarEmojis]);

  const onSubmit = async (data) => {
    const archivoImagen = data.imagenUrl?.[0];

    if (!contenido && (!imagen || !archivoImagen)) {
      toast.error("Debes agregar texto o una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("contenido", contenido);
    if (archivoImagen) formData.append("imagen", archivoImagen);

    setLoading(true);

    try {
      await crearPublicacion(formData);
      toast.success("Publicación creada con éxito");
      if (onPublicar) onPublicar();
      reset();
      setContenido("");
    } catch (error) {
      toast.error(`Error al crear publicación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    const currentCount = splitter.countGraphemes(contenido);
    if (currentCount < 500) {
      setContenido((prev) => prev + emoji.native);
    }
  };

  useEffect(() => {
    const currentCount = splitter.countGraphemes(contenido);
    if (currentCount >= 500 && mostrarEmojis) {
      setMostrarEmojis(false);
    }
  }, [contenido, mostrarEmojis]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="shadow-sm border p-3 " style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <textarea
              placeholder="¿Qué estás pensando?"
              className="w-100 p-2 resize-none form-control "
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={5}
              maxLength={500}
              style={{
                border: "1px solid #ced4da",
                borderRadius: "0.375rem",
              }}
            />
            <p className="contador-caracteres mb-1 me-2 d-none d-md-inline">
              {" "}
              {splitter.countGraphemes(contenido)}/500
            </p>
          </div>

          <div
            className=" d-flex align-items-center mt-3 rounded px-2 py-1 "
            style={{ position: "relative" }}
          >
            <div
              className="d-flex align-items-center  rounded py-1 me-2"
              style={{ position: "relative", flexShrink: 0 }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2 d-none d-md-inline"
                onClick={() => setMostrarEmojis((prev) => !prev)}
                disabled={splitter.countGraphemes(contenido) >= 500}
              >
                😊 Emoji
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2 d-inline d-md-none"
                onClick={() => setMostrarEmojis((prev) => !prev)}
                disabled={splitter.countGraphemes(contenido) >= 500}
              >
                😊
              </button>

              {mostrarEmojis && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 9999,
                    top: "100%",
                    left: "0",
                    marginTop: "0.5rem",
                  }}
                >
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiClick}
                    locale="es"
                    theme={darkMode?"dark": "light"}
                  />
                </div>
              )}
              <label
                htmlFor="imagen"
                className="btn btn-outline-secondary btn-sm  "
              >
                <i className="bi bi-image m-1 "></i>
                Agregar imagen
              </label>
            </div>
            <div className="d-flex w-100 justify-content-end mt-auto">
              <button
                type="submit"
                className="  btn btn-primary px-4 py-2 publicarButton"
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
          {previewImagen && (
            <div className="mt-2 position-relative">
              <button
                className="btn p-3 mt-3 border-0 bg-transparent"
                onClick={() => setPreviewImagen(null)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                }}
              >
                <i className="bi bi-trash " style={{ fontSize: "1.1rem" }}></i>
              </button>
              <img
                src={previewImagen}
                alt="Vista previa"
                className="mt-3 max-h-96 w-full object-cover rounded-xl img-background"
                style={{
                  width: "100%",
                  maxHeight: "600px",
                  objectFit: "contain",
                  borderRadius: "0.75rem",
                  marginTop: "1rem",
                  
                }}
              />
            </div>
          )}
        </div>

        <input
          type="file"
          id="imagen"
          accept="image/*"
          {...register("imagenUrl")}
          placeholder="URL de imagen (provisorio)"
          className="m-3 ms-1 form-control d-none"
        />
      </form>
    </>
  );
}

export default CrearPublicacion;
