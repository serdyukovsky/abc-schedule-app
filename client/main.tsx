import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Initialize Telegram WebApp if running inside Telegram
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
