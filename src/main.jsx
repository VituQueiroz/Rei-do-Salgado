// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Admin from "./pages/Admin";

// Roteamento simples: /admin abre o painel, qualquer outra rota abre o cardápio
const ehAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {ehAdmin ? <Admin /> : <App />}
  </StrictMode>
);
