import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { loginUsuario } from "../services/userServices";

import "../App.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, usuario, darkMode } = useAuth();

  const onsubmit = async (data) => {
    try {
      const { token } = await loginUsuario(data);
      login(token);
      navigate("/home");
    } catch (error) {
      console.error("error al iniciar sesion: ", error);
      setErrorMsg(
        error?.response?.data?.error || error.message || "Error inesperado"
      );
    }
  };

  useEffect(() => {
    if (usuario) {
      navigate("/home");
    }
  }, [usuario, navigate]);

  if (usuario) {
    return null;
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center  vw-100">
        <div
          style={{ position: "relative",  maxWidth: "1500px", }}
          className="col-11 col-sm-8 col-md-6 col-lg-6 col-xl-5"
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
            className={`card card-login text-center }`}
            style={{ maxWidth: "1500px" }}
          >
            <h2 className="text-center mb-4 mt-3"> Iniciar Sesion</h2>
            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="mb-3 formDiv">
                <label className="form-label">Correo electronico</label>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                  autoComplete="username"
                />
                {errors.email && (
                  <p className="text-danger mt-1">Email requerido</p>
                )}
              </div>
              <div className="mb-3 formDiv">
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                  <input
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={showPassword ? "Contraseña" : "••••••••"}
                    autoComplete="current-password"
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
                {errors.password && (
                  <p className="text-danger mt-1">Contraseña requerida</p>
                )}
              </div>
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
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
