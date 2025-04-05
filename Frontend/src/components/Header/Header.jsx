import { Button, Flex } from "@radix-ui/themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import AuthContext from "../../utils/context/AuthContext";
import HeaderLink from "./HeaderLink";
import { FaUserNinja } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";

const Header = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleMenu = useCallback(() => {
    setOpen(!open);
  }, [open]);

  useEffect(() => {
    return navigate(location.pathname);
  }, [location.pathname, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 shadow-md bg-cyan-500 px-5 py-3 sm:px-10 font-sans min-h-[70px] z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-white font-bold text-xl mr-4">
            UChoose
          </Link>
          
          <button 
            className="lg:hidden text-white focus:outline-none"
            onClick={handleMenu}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <IoMdClose className="size-7" /> : <IoMdMenu className="size-7" />}
          </button>
        </div>
        
        <div 
          className={`${
            open ? "max-lg:flex" : "max-lg:hidden"
          } flex-col lg:flex-row lg:flex items-center max-lg:absolute max-lg:top-[70px] max-lg:left-0 max-lg:right-0 max-lg:bg-white max-lg:shadow-md max-lg:px-5 max-lg:py-4 max-lg:space-y-3 lg:space-x-4 transition-all duration-300`}
        >
          <ul className="flex max-lg:flex-col max-lg:w-full lg:items-center lg:mr-10 max-lg:space-y-2 lg:space-x-8">
            {user?.rol === "worker" ? (
              <>
                <HeaderLink to="/auctions/create" className="text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors">Crear Puja</HeaderLink>
                <HeaderLink to="/services/create" className="text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors">Crear Servicio</HeaderLink>
              </>
            ) : user?.rol === "client" ? (
              <>
                <HeaderLink to="/auctions/353817" className="text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors">Pujar</HeaderLink>
                <HeaderLink to="/auctions/create" className="text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors">Crear Puja</HeaderLink>
                <HeaderLink to="/services/create" className="text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors">Crear Servicio</HeaderLink>
              </>
            ) : null}
          </ul>

          <div className="flex max-lg:flex-col max-lg:w-full lg:items-center max-lg:space-y-3 lg:space-x-6">
            {user ? (
              <>
                <div className="bg-cyan-600/30 px-6 py-2 rounded-lg flex items-center lg:mr-2">
                  <FaUserNinja className="text-white font-medium"/> <span className="text-white font-medium ml-2  ">{user.username}</span>
                </div>
                <Link to="/" className="w-full lg:w-auto">
                  <button
                    className="bg-white text-cyan-700 hover:bg-cyan-50 transition-colors px-6 py-2 rounded-lg font-medium w-full lg:w-auto flex items-center justify-center shadow-sm"
                    onClick={logoutUser}
                  >
                    <IoMdExit className="mr-2"/>Salir
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex max-lg:flex-col lg:items-center max-lg:space-y-3 lg:space-x-6 w-full">
                <Link to="/login" className="w-full lg:w-auto">
                  <button className="bg-white text-cyan-700 hover:bg-cyan-50 transition-colors px-8 py-2 rounded-lg font-medium w-full shadow-sm">
                    Entrar
                  </button>
                </Link>
                <Link to="/register-client" className="w-full lg:w-auto">
                  <button className="bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors px-8 py-2 rounded-lg font-medium w-full shadow-sm">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;