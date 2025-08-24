import Chat from "../chat/chat";
import { useAuth } from "../../context/useAuth";

function Footer() {

  const { darkMode, colorTema, coloresNavbar } = useAuth();

  const colorActual = darkMode
  ? coloresNavbar.oscuro[colorTema]
  : coloresNavbar.claro[colorTema];


   const neonBoxStyle = {
  backgroundColor: colorActual,
  ...(colorTema !== "default" && {
    boxShadow: `
      0 0 5px ${colorActual},
      0 0 10px ${colorActual},
      0 0 15px ${colorActual},
      0 0 20px ${colorActual}
    `
  })
};
 

  return (
    <>
      <footer style={neonBoxStyle} className="navbar navbar-expand-lg navbar-dark  vw-100 fixed-bottom footer">
        <div className="container  flex flex-col md:flex-row justify-between items-center px-4">
          <div className="">
           
          </div>
          <div className="ms-auto">
            <Chat />
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
