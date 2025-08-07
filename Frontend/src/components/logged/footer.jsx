import Chat from "../chat/chat";

function Footer() {
  return (
    <>
      <footer className="navbar navbar-expand-lg navbar-dark  vw-100 fixed-bottom footer">
        <div className="container  flex flex-col md:flex-row justify-between items-center px-4">
          <div className="text-sm text-gray-400 italic">
            &copy; {new Date().getFullYear()} MiRedSocial
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
