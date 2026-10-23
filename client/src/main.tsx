import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SocketProvider from "./context/SocketProvider";
import RoomProvider from "./context/RoomProvider";
import ConnectionBanner from "./components/room/ConnectionBanner";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <RoomProvider>
        <ConnectionBanner />
        <App />
      </RoomProvider>
    </SocketProvider>
  </StrictMode>,
);