import React from "react";
import { render } from "react-dom";
import "style.css";
import App from "app.jsx";

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.querySelector("main")
);