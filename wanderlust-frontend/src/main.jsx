import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

import { ToastProvider, useToast } from "./context/ToastContext";
import ToastHost from "./components/ToastHost";
import "./styles/wanderlust.css";


function ToastRoot() {
  const { toasts, removeToast } = useToast();
  return <ToastHost toasts={toasts} removeToast={removeToast} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ToastRoot />
        <AuthProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
