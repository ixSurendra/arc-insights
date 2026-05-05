import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme, getInitialTheme } from "./lib/theme";
import "./ui/tokens.css";

// Apply the persisted/system theme before the first render — avoids a
// flash of the wrong palette.
applyTheme(getInitialTheme());

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
