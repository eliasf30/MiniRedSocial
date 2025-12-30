function Descripcion() {
  return (
    <div className="contenedor-principal">
      {/* Título del proyecto */}
      <h4>Mini Red Social Fullstack 🚀</h4>

      {/* Descripción general */}
      <p>
        Proyecto Fullstack donde los usuarios pueden registrarse, crear
        publicaciones con texto e imágenes, agregar amigos y chatear en tiempo
        real.   Diseñado pensando en experiencia de usuario, rendimiento y
        escalabilidad.
      </p>

      {/* Tecnologías y funcionalidades */}
      <p>
        <strong>Tecnologías:</strong> React, Express, Prisma, PostgreSQL,
        Socket.io, Cloudinary, JWT.
      </p>

      <p>
        <strong>Funcionalidades destacadas:</strong>
      </p>
      <ul>
        <li>🔑 Registro y autenticación segura con JWT.</li>
        <li>👤 Perfiles de usuario con imagen y descripción.</li>
        <li>📰 Feed dinámico con ABMC de publicaciones (texto e imagen).</li>
        <li>💬 Chat en tiempo real.</li>
        <li>🤝 Gestión de amigos y solicitudes de amistad.</li>
        <li>
          ⚙️ Opciones de usuario: modo oscuro, esquema de colores y privacidad
          de perfil.
        </li>
      </ul>

      <p>
        <strong>Seguridad y buenas prácticas:</strong> validación de sesiones,
        protección de rutas y manejo de errores.
      </p>

      {/* Nota final sobre el enfoque del proyecto */}
      <p>
        Proyecto realizado con enfoque en desarrollo fullstack, integración de
        APIs, comunicación en tiempo real y despliegue en entorno web.
      </p>
      <p>
        <strong>Contacto:</strong>
        <br />
        📫 Email: maestrofigueroa1@gmail.com
        <br />
        💼 LinkedIn:{" "}
        <a href="https://www.linkedin.com/in/eliasfigueroa-/" target="_blank">
          https://www.linkedin.com/in/eliasfigueroa-/
        </a>
        <br />
        💻 GitHub:{" "}
        <a href="https://github.com/eliasf30" target="_blank">
          https://github.com/eliasf30
        </a>
      </p>
    </div>
  );
}

export default Descripcion;
