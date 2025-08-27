import { useAuth } from "../../context/useAuth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router";
import { useForm } from "react-hook-form";
import { modificarPerfil } from "../../services/userServices";
import { ajustarFechaSinZona } from "../../utils/formatearFechas";
import { toast } from "react-toastify";
import "../../App.css";
import Swal from "sweetalert2";

function EditarPerfil() {
  const URL = import.meta.env.VITE_API_URL;

  const { usuario, setUsuario } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (usuario?.avatar) {
      setImage(usuario.avatar);
    }
  }, [usuario]);

  /* selector de imagen */
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // <-- AGREGAR ESTO
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /*controlador de rutas*/

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (!hayCambios()) {
      toast.info("No realizaste ningún cambio");
      navigate("/perfil");
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Estas a punto de modificar tu perfil",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, guardar",
      confirmButtonColor: "Green",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "Red",
    });
    if (resultado.isConfirmed) {
      const formData = new FormData();

      formData.append("descripcion", data.descripcion);
      formData.append("fechaNacimiento", data.fechaNacimiento);
      formData.append("genero", data.genero);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      try {
        const res = await modificarPerfil(formData, usuario.id);

        setUsuario((prev) => ({
          ...prev,
          descripcion: res.usuario.descripcion,
          genero: res.usuario.genero,
          fechaNacimiento: res.usuario.fechaNacimiento,
          avatar: res.usuario.avatar,
        }));
        toast.success("Usuario modificado con exito");
        navigate("/perfil");
      } catch (error) {
        toast.error("Error al modificar el usuario");
        console.error(error);
      }
    }
  };

  const fechaNacimientoInput = usuario?.fechaNacimiento
    ? (() => {
        const fecha = ajustarFechaSinZona(usuario.fechaNacimiento);
        fecha.setDate(fecha.getDate());
        return fecha.toISOString().split("T")[0];
      })()
    : "";

  const hayCambios = () => {
    const descripcion = watch("descripcion");
    const fechaNacimiento = watch("fechaNacimiento");
    const genero = watch("genero");

    return (
      descripcion !== usuario.descripcion ||
      fechaNacimiento !==
        ajustarFechaSinZona(usuario.fechaNacimiento)
          .toISOString()
          .split("T")[0] ||
      genero !== usuario.genero ||
      selectedFile !== null
    );
  };

  return (
    <>
      <div className="container my-4 d-flex justify-content-center">
        <div
          className="card shadow-lg p-4 profilewidth"
          style={{ marginBottom: "100px" }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar y descripción */}
            <div className="d-flex flex-column flex-md-row align-items-center mb-4">
              <div
                onClick={handleClick}
                className="me-md-4 mb-3 mb-md-0 avatar-wrapper"
                style={{ cursor: "pointer", position: "relative" }}
              >
                <img
                  src={
                    image?.startsWith("data:") 
                      ? image
                      : image?.startsWith("http") 
                      ? image
                      : `${URL}/${image.replace(/^\/+/, "")}` 
                  }
                  alt="Avatar"
                  className="rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <div className="avatar-overlay d-flex justify-content-center align-items-center">
                  <i className="bi bi-pencil"></i>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex-grow-1 w-100">
                <h3 className="mb-2 border-bottom border-2 d-inline-block pb-1">
                  {usuario.nombre} {usuario.apellido}
                </h3>
                <textarea
                  {...register("descripcion")}
                  className="form-control mt-2"
                  rows={3}
                  defaultValue={usuario.descripcion}
                  style={{ resize: "none" }}
                  maxLength={200}
                />
                <p className="text-end text-muted">
                  {watch("descripcion")?.length || 0}/200
                </p>
              </div>
            </div>

            <hr />

            {/* Datos personales y Opcional */}
            <div className="row mt-3">
              <div className="col-12 col-lg-6 mb-3">
                <h5 className="mb-3">Datos personales</h5>
                <p>📫 Email:</p>
                <p className="text-muted">{usuario.email}</p>
                <p>🕓 Miembro desde:</p>
                <p className="text-muted">
                  {new Date(usuario.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="col-12 col-lg-6 mb-3">
                <h5 className="mb-3">Opcional</h5>
                <p>📅 Fecha de Nacimiento:</p>
                <input
                  {...register("fechaNacimiento")}
                  className="form-control mb-2"
                  type="date"
                  defaultValue={fechaNacimientoInput}
                />
                <p>🧑 Género:</p>
                <select
                  {...register("genero")}
                  className="form-control mb-2"
                  defaultValue={usuario?.genero || ""}
                >
                  <option value="" disabled>
                    Elegí una opción
                  </option>
                  <option>Hombre</option>
                  <option>Mujer</option>
                  <option>Otro</option>
                  <option>Prefiero no decirlo</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex justify-content-center mt-3 gap-3">
              <NavLink to="/perfil" className="btn btn-danger">
                Cancelar
              </NavLink>
              <button type="submit" className="btn btn-primary">
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditarPerfil;
