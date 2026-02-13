import React from "react";
import ReactDOM from "react-dom/client";
import { WebSocketProvider } from "./context/WebSocketContext";
import { CallProvider } from "./context/CallContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WebSocketProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </WebSocketProvider>
  </React.StrictMode>
);
