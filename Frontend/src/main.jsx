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
          path:"/services/create",
          element: <CreateService />,
        },
        {
          path:"/auctions/create",
          element: <CreateAuction />,
        },
        {
          path:"/login",
          element:<LoginPage />
        },
        {
          path: "/auctions/:auctionId",
          element: <AuctionDetail />
        },
        {
          path:"/schedules",
          element: <ScheduleManagement />
        },
        {
          path:"/conversations/service",
          element: <ConversationalService />
        },
        {
          path: "/services/list",
          element: <ServiceList />
        }
      ]
    }])

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Theme accentColor="blue">
        <RouterProvider router={router} />
        </Theme>
    </React.StrictMode>,
    );