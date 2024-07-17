import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { StrictMode } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';




const domain = "dev-yuxav7m3slnq1ehn.us.auth0.com";
const clientId = "qmayDPrqZn3wc2XY8CLrWZQgauDzh5Z4";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
  rootElement
);
