import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import RenderHost from "./RenderHost.jsx";
import "./templates/templates.css";
import "./app.css";
createRoot(document.getElementById("root")).render(window.__KX_RENDER__ ? <RenderHost /> : <App />);
