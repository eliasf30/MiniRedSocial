import { useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "../App.css";

import defaultpreview from "../images/preview.png" ;

import { registrarUsuario } from "../services/userServices";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const [preview, setPreview] = useState(defaultpreview)
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
     watch 
  } = useForm();

   const handleImageChange = (data) =>{
        const file = data.target.files[0]
        if (file){

          const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
          if(!allowedTypes.includes(file.type)){
            setErrorMsg("Formato de imagen no permitido")
            return
          }

            setPreview(URL.createObjectURL(file))
        }
    }
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");


     const onsubmit = async(data) => {
       setLoading(true);
        setErrorMsg("");
    try{

      const formData = new FormData();
      formData.append("nombre", data.nombre);
      formData.append("apellido", data.apellido); // aunque no se usa aún en backend
      formData.append("email", data.email);
      formData.append("password", data.contrasenia);
      formData.append("descripcion", data.descripcion || "");

      if (data.avatar && data.avatar[0]){
        formData.append("avatar", data.avatar[0])
      }



      const result = await registrarUsuario(formData);
      console.log("usuario registrado: ",result)
    }catch (error){
      console.error("error al registrar usuario: ",error)
      setErrorMsg(error.message || "Error inesperado");
    } finally {
    setLoading(false);
  }
  };

  const contrasenia = watch("contrasenia")

  return (

   
    <>
      <div className="d-flex justify-content-center align-items-center  vw-100">
        <div
          style={{ position: "relative", width: "40vw", maxWidth: "1500px" }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary position-absolute"
            style={{ top: "-7%", left: "0", zIndex: "1050" }}
            onClick={() => navigate("/")}
          >
            ← Volver
          </button>
          <div
            className="card text-center "
            style={{ maxWidth: "1500px", width: "40vw" }}
          >
            
            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="mb-3 formDiv">
                <label className="form-label text-start"></label>

                <div className="mb-3 d-flex align-items-start gap-3 descripcion-container">
                <img src={preview} alt={preview} className="mb-3 d-flex flex-column align-items-center previewImage"/>
                  <div className="d-flex flex-column w-100">
                <textarea {...register("descripcion", {maxLength:{value:200, message: "Maximo 200 caracteres permitidos"}})}type="text" className="form-control descripcion-textarea " placeholder="escribe una breve descripcion" style={{  minHeight: "130px", resize:"none" }}/>
                <p className="contador-caracteres"> {(watch("descripcion")?.length || 0)}/200 </p>
                {errors.descripcion && (<p className="error-text">{errors.descripcion.message}</p>)}
                </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  {...register("avatar")}
                  onChange={handleImageChange}
                />
              </div>
              <div className="mb-3 px-4">
                <label className="form-label d-block text-start mb-2">
                  Nombre completo <span className="text-danger">*</span>
                </label>
                <div className="row">
                  <div className="col">
                    <input
                      {...register("nombre", { required: "Nombre requerido" })}
                      type="text"
                      className="form-control"
                      placeholder="Nombre"
                    />
                    {errors.nombre && (
                      <p className="error-text">
                        {errors.nombre.message}
                      </p>
                    )}
                  </div>
                  <div className="col">
                    <input
                      {...register("apellido", {
                        required: "Apellido requerido",
                      })}
                      type="text"
                      className="form-control"
                      placeholder="Apellido"
                    />
                    {errors.apellido && (
                      <p className="error-text">
                        {errors.apellido.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3 formDiv">
                <label className="form-label d-block text-start">
                  Correo electronico <span className="text-danger">*</span>
                </label>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="error-text">Email requerido</p>
                )}
              </div>
              <div className="mb-3 formDiv">
                <label className="form-label d-block text-start">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    {...register("contrasenia", { required: "Contraseña requerida",
                        minLength:{value:6, message:"la contraseña debe tener al menos 6 caracteres"},
                        maxLength:{value:20, message:"la contraseña no puede tener mas de 20 caracteres"}
                     })}
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={showPassword ? "Contraseña" : "••••••••"}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="bi bi-eye text-primary"></i>
                    ) : (
                      <i className="bi bi-eye-slash text-secondary"></i>
                    )}
                  </button>
                </div>
                {errors.contrasenia && (
                  <p className="error-text">{errors.contrasenia.message}</p>
                )}
              </div>
              <div className="mb-3 formDiv">
                <label className="form-label d-block text-start">Confirmar Contraseña <span className="text-danger">*</span></label>
                <div className="input-group">
                     <input
                    {...register("confirmarContrasenia", { required: "Debe confirmar la contraseña",
                        validate: (value) => value === contrasenia || "las contraseñas no coinciden"
                        
                     })}
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={showPassword ? "Confirmar contraseña" : "••••••••"}
                    onPaste={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="bi bi-eye text-primary"></i>
                    ) : (
                      <i className="bi bi-eye-slash text-secondary"></i>
                    )}
                  </button>
                </div>
                {errors.confirmarContrasenia && <p className="error-text" >{errors.confirmarContrasenia.message}</p>}
              </div>
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
              <button type="submit"  disabled={loading} className="btn btn-primary mb-2 submitbutton">
                 {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
