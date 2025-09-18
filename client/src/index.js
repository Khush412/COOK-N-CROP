import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import CssBaseline from "@mui/material/CssBaseline";

import { themeFromKey } from "./themeUtils";

const getInitialThemeKey = () => localStorage.getItem("themeKey") || "forestMist";
const themeKey = getInitialThemeKey();
const theme = themeFromKey(themeKey);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <StyledThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </StyledThemeProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
