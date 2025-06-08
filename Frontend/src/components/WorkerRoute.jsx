import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../utils/context/AuthContext";

const WorkerRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.rol !== "worker") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default WorkerRoute;