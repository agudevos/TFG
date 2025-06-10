import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../utils/context/AuthContext";

const ClientRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.rol !== "client") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ClientRoute;