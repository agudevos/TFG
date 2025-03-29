import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { Theme } from "@radix-ui/themes";
import MainLayout from "./views/MainLayout/MainLayout";
import CreateService from "./views/Services/CreateService"
import "./index.css";

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