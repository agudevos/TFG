import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { Theme } from "@radix-ui/themes";
import MainLayout from "./views/MainLayout/MainLayout";
import CreateService from "./views/Services/CreateService";
import ServiceList from "./views/Services/ServiceList";
import CreateAuction from "./views/Auctions/CreateAuction";
import "./index.css";
import LoginPage from "./views/LoginPage/Login";
import AuctionDetail from "./views/Auctions/AuctionDetail";
import ScheduleManagement from "./views/Schedule/ScheduleManagement";
import ConversationalService from "./views/Conversation/ConversationalService";
import CreateEstablishment from "./views/Establishment/CreateEstablishment";
import EstablishmentStats from "./views/Establishment/EstablishmentStats";
import WorkerRoute from "./components/WorkerRoute";
import ClientRoute from "./components/ClientRoute";
import PricingPage from "./views/Pricing/PricingPage";
import EstablishmentSelector from "./views/Establishment/SelectEstablishment";
import SuccessPage from "./views/Pricing/SuccessPage";
import EstablishmentServicesList from "./views/Services/EstablishmentServiceList";
import EstablishmentServiceDetail from "./views/Services/EstablishmentServiceDetail";
import ClientReservationsList from "./views/Reservation/ClientReservationList";
import SuccessCreditPayment from "./views/Pricing/SuccesCreditPayment";


const workerRoutes = [
  {
    path:"services/create",
    element: <CreateService />,
  },
  {
    path:"auctions/create",
    element: <CreateAuction />,
  },
  {
    path:"schedules",
    element: <ScheduleManagement />
  },
  {
    path:"conversations/service",
    element: <ConversationalService />
  },
  {
    path: "establishment/create",
    element: <CreateEstablishment />
  },
  {
    path: "establishment/statistics",
    element: <EstablishmentStats />
  },
  {
    path: "pricing",
    element: <PricingPage />
  },
  {
    path: "establishment/select",
    element: <EstablishmentSelector />
  },
  {
    path: "success",
    element: <SuccessPage />
  },
  {
    path: "my-services",
    element: <EstablishmentServicesList />
  },
  {
    path: "services/:serviceId",
    element: <EstablishmentServiceDetail />
  }
]

const clientRoutes = [
  {
    path: "services/:serviceId",
    element: <EstablishmentServiceDetail />
  },
  {
    path: "reservations/list",
    element: <ClientReservationsList />
  },
  {
    path: "success",
    element: <SuccessCreditPayment />
  },
]
const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <App />,
        },
        {
          path:"/login",
          element:<LoginPage />
        },
        {
          path: "/worker",
          element: <WorkerRoute />,
          children: workerRoutes,
        },
        {
          path: "/client",
          element: <ClientRoute />,
          children: clientRoutes,
        },
        {
          path: "auctions/:auctionId",
          element: <AuctionDetail />
        },
        {
          path: "/services/list",
          element: <ServiceList />
        },
        
      ]
    }])

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Theme accentColor="blue">
        <RouterProvider router={router} />
        </Theme>
    </React.StrictMode>,
    );