import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom'
import App from "./App";
import { SessionProvider } from "./Context/SessionContext";
import "./index.css";

/*
  main.jsx is the entry point of the React app.

  We wrap App with SessionProvider so every component inside App
  can access the same session data using useSession().
*/

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SessionProvider>
  </React.StrictMode>
);