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

  const [imagen, setImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [modificando, setModificando] = useState(false)
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
    console.log(archivoImagen);
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
          confirmButtonColor:"Green",
          cancelButtonText: "Cancelar",
          cancelButtonColor: "Red"
        })
        if (resultado.isConfirmed) {

    const formData = new FormData();
    formData.append("contenido", contenido);
    if (imagen) formData.append("imagen", imagen);
    setModificando(true)

    try {
      await editarPublicacion(id, formData);
      toast.success("Publicación Modificada con éxito");
      if (onModificar) onModificar();

      setContenido("");
      navigate("/home");
    } catch (error) {
      toast.error(`Error al modificar publicación: ${error.message}`);
    } finally {
      setModificando(false)
    }}
  };

  if (loading) return <p>Cargando publicación...</p>;
  if (!post) return <p>No se encontró la publicación.</p>;

  return (
    <>
      <div
        className="shadow-sm border p-3 center mt-4 position-relative"
        style={{ width: "60vw", marginBottom: "100px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="d-flex align-items-center mb-2 w-100"
            style={{ gap: "1rem" }}
          >
            <img
              src={
                post.autor.avatar ? `${API_URL}${post.autor.avatar}` : preview
              }
              alt="Avatar"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div className="d-flex flex-row w-100 ">
              <h5 className="font-semibold text-muted">
                {formatearNombre(post.autor.nombre)}{" "}
                {formatearNombre(post.autor.apellido)}
              </h5>
              <p className="text-muted" style={{ marginLeft: "5%" }}>
                {`${new Date(post.createdAt).toLocaleString("es-AR")}`}
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
            <p className="contador-caracteres mb-2 me-2">
              {splitter.countGraphemes(contenido)}/500
            </p>
          </div>

          <div
            className="d-flex align-items-center mt-2 rounded px-2 py-1"
            style={{ position: "relative" }}
          >
            <div
              className="d-flex align-items-center rounded px-2 py-1"
              style={{ position: "relative", flexShrink: 0 }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2"
                onClick={() => setMostrarEmojis((prev) => !prev)}
                disabled={splitter.countGraphemes(contenido) >= 500}
              >
                😊 Emoji
              </button>
              {mostrarEmojis && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 9999,
                    top: "0",
                    left: "5.5rem",
                  }}
                >
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiClick}
                    locale="es"
                    theme="light"
                  />
                </div>
              )}
              <label
                htmlFor="imagen"
                className="btn btn-outline-secondary btn-sm"
              >
                <i className="bi bi-image m-1"></i>
                Agregar/Cambiar Imagen
              </label>
            </div>

            <div className="d-flex w-100 justify-content-end mt-auto">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 me-2"
                onClick={() => navigate("/")   }
                disabled={modificando}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-success px-4 py-2" disabled={modificando}>
                {modificando? "Modificando..." : "Confirmar" }
              </button>
            </div>
          </div>
          {post.imagenUrl && (
            <img
              src={previewImagen || post.imagenUrl}
              alt="Imagen del post"
              className="mt-3 max-h-96 w-full object-cover rounded-xl"
              style={{
                width: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                borderRadius: "0.75rem",
                marginTop: "1rem",
                backgroundColor: "#f0f0f0",
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
