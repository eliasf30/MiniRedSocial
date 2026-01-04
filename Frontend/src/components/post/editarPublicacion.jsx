import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { obtenerPublicacionPorId } from "../../services/publicacionesServices";
import { toast } from "react-toastify";
import formatearNombre from "../../utils/formatearNombre";
import preview from "../../images/preview.png";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import GraphemeSplitter from "grapheme-splitter";
import { NavLink, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { editarPublicacion } from "../../services/publicacionesServices";
import Swal from "sweetalert2";
import { useAuth } from "../../context/useAuth";

function EditarPublicacion({ onModificar }) {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [contenido, setContenido] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const navigate = useNavigate();
  const splitter = new GraphemeSplitter();
  const pickerRef = useRef(null);
  const {darkMode} = useAuth()

  const [imagen, setImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [modificando, setModificando] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const imagenUrlWatch = watch("imagenUrl");
  useEffect(() => {
    if (imagen) {
      const url = URL.createObjectURL(imagen);
      setPreviewImagen(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagen]);

  useEffect(() => {
    const obtener = async () => {
      try {
        const data = await obtenerPublicacionPorId(id);
        setPost(data);
        setContenido(data.contenido || "");
      } catch (error) {
        console.error("Error al obtener la publicación:", error);
        toast.error("Error al obtener publicacion");
      } finally {
        setLoading(false);
      }
    };
    obtener();
  }, [id]);

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

  const onSubmit = async (data) => {
    const archivoImagen = imagenUrlWatch?.[0];
    
    if (!contenido && (!imagen || !archivoImagen)) {
      toast.error("Debes agregar texto o una imagen");
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Estas a punto de modificar tu Publicacion",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, guardar",
      confirmButtonColor: "Green",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "Red",
    });
    if (resultado.isConfirmed) {
      const formData = new FormData();
      formData.append("contenido", contenido);
      if (imagen) formData.append("imagen", imagen);
      setModificando(true);

      try {
        await editarPublicacion(id, formData);
        toast.success("Publicación Modificada con éxito");
        if (onModificar) onModificar();

        setContenido("");
        navigate("/home");
      } catch (error) {
        toast.error(`Error al modificar publicación: ${error.message}`);
      } finally {
        setModificando(false);
      }
    }
  };

  if (loading) return <p>Cargando publicación...</p>;
  if (!post) return <p>No se encontró la publicación.</p>;

  return (
    <>
      <div
        className="shadow-sm border p-3 center mt-4 contenedor-principal"
        style={{ marginBottom: "100px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-100">
          <div className="d-flex align-items-start gap-3 w-100">
            <img
              src={
                post.autor.avatar ? `${post.autor.avatar}` : preview
              }
              alt="Avatar"
              draggable="false"
              className="rounded-circle flex-shrink-0"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
            <div className="flex-grow-1">
              <h5 className="mb-1" >
                {formatearNombre(post.autor.nombre)}{" "}
                {formatearNombre(post.autor.apellido)}
              </h5>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                {new Date(post.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
          <div className="position-relative">
            <textarea
              className="w-100 p-2"
              name=""
              id=""
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={6}
              maxLength={500}
              style={{
                border: "1px solid #ced4da",
                borderRadius: "0.375rem",
              }}
            ></textarea>
            <p className="contador-caracteres mb-2 me-2  d-none d-md-inline">
              {splitter.countGraphemes(contenido)}/500
            </p>
          </div>

          <div
            className="d-flex align-items-center mt-2 rounded px-2 py-1"
            style={{ position: "relative" }}
          >
            <div className="d-flex  align-items-center rounded px-2 py-1 me-auto">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-3 d-inline d-lg-none"
                onClick={() => setMostrarEmojis((prev) => !prev)}
                disabled={splitter.countGraphemes(contenido) >= 500}
              >
                😊
              </button>

              <label
                htmlFor="imagen"
                className="btn btn-outline-secondary btn-sm d-inline d-lg-none"
              >
                <i className="bi bi-image"></i>
              </label>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2 d-none d-lg-inline"
                onClick={() => setMostrarEmojis((prev) => !prev)}
                disabled={splitter.countGraphemes(contenido) >= 500}
                style={{ flexShrink: 0 }}
              >
                😊 Emoji
              </button>
              {mostrarEmojis && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 9999,
                    top: "100%",
                    left: "0",
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
                className="btn btn-outline-secondary btn-sm d-none d-lg-inline"
                style={{ flexShrink: 0 }}
              >
                <i className="bi bi-image m-1"></i> Agregar imagen
              </label>
            </div>

            <div className="d-flex w-100 justify-content-end mt-auto">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 me-2"
                onClick={() => navigate("/")}
                disabled={modificando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-success px-4 py-2"
                disabled={modificando}
              >
                {modificando ? "Modificando..." : "Confirmar"}
              </button>
            </div>
          </div>
          {(previewImagen || post.imagenUrl) && (
            <img
              src={previewImagen || post.imagenUrl}
              alt="Imagen del post"
              className="mt-3 max-h-96 w-full object-cover rounded-xl img-background"
              style={{
                width: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                borderRadius: "0.75rem",
                marginTop: "1rem",
              }}
            />
          )}
          <input
            type="file"
            id="imagen"
            accept="image/*"
            placeholder="URL de imagen (provisorio)"
            className="m-3 ms-1 form-control d-none"
            {...register("imagenUrl")}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImagen(file);
              }
            }}
          />
        </form>
      </div>
    </>
  );
}

export default EditarPublicacion;
