import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import "../app.css"
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onsubmit = (data) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center  vw-100">
        <div
          style={{ position: "relative", width: "40vw", maxWidth: "1500px" }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary position-absolute"
            style={{ top: "-15%", left: "0" }}
            onClick={() => navigate("/")}
          >
            ← Volver
          </button>
          <div
            className="card text-center "
            style={{ maxWidth: "1500px", width: "40vw" }}
          >
            <h2 className="text-center mb-4 mt-3"> Iniciar Sesion</h2>
            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="mb-3 formDiv" >
                <label className="form-label">Correo electronico</label>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-danger mt-1">Email requerido</p>
                )}
              </div>
              <div className="mb-3 formDiv" >
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                  <input
                    {...register("contraseña", { required: true })}
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
                {errors.contraseña && (
                  <p className="text-danger mt-1">Contraseña requerida</p>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-2 mb-4 submitbutton "
                
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
