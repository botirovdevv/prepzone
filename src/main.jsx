import { installErrorLog } from "./utils/errorLog";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/tokens.css";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import App from "./App.jsx";

installErrorLog();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </ThemeProvider>
  </StrictMode>
);
