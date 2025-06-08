import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import AuthContext from "../../utils/context/AuthContext";
import EstablishmentContext from "../../utils/context/EstablishmentContext";
import HeaderLink from "./HeaderLink";
import { FaUserNinja } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";

const Header = () => {
  const { selectedEstablishment } = useContext(EstablishmentContext);
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  console.log("USER", user);

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
    <header className="sticky top-0 shadow-md bg-cyan-500 px-2 py-3 sm:px-10 font-sans min-h-[70px] z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to={user ?  user.rol === "client" ? "/client/home-page" : "/worker/establishment/statistics" : "/"} className="text-white font-bold text-xl mr-4">
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
            {user?.rol === "worker" && selectedEstablishment ? (
              <>
                <HeaderLink to="worker/my-services" >Mis Servicios</HeaderLink>
                <HeaderLink to="worker/schedules/" >Horarios</HeaderLink>
                {/* Dropdown */}
                <li className="relative group">
                  <button className="flex items-center space-x-1 text-white lg:hover:text-cyan-100 max-lg:text-cyan-700 max-lg:hover:text-cyan-900 transition-colors font-semibold text-lg">
                    <span>{selectedEstablishment.name} </span>
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 w-48 bg-cyan-600 rounded-lg shadow-lg border border-cyan-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <HeaderLink to="worker/establishment/statistics" className = "text-gray-600" > Estadísticas </HeaderLink>
                      <div className="border-t border-cyan-600   my-1"></div>
                      <HeaderLink to="worker/pricing" className = "text-gray-600" > Gestionar Suscripción </HeaderLink>
                      <div className="border-t border-cyan-600   my-1"></div>
                      <HeaderLink to="worker/establishment/select"> Seleccionar otro </HeaderLink>
                    </div>
                  </div>
                </li>
      
              </>
            ) : user?.rol === "client" ? (
              <>
                <HeaderLink to="services/list" >Servicios</HeaderLink>
                <HeaderLink to="client/reservations/list" >Reservas</HeaderLink>
              </>
            ) : (
              <>
              {!user && (
              
              <HeaderLink to="/services/list" >Servicios</HeaderLink>
              )}
              </>
            )}
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