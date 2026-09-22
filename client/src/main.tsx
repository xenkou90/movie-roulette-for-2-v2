import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SocketProvider from "./context/SocketProvider";
import RoomProvider from "./context/RoomProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <RoomProvider>
        <App />
      </RoomProvider>
    </SocketProvider>
  </StrictMode>,
);