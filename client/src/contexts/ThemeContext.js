import React, { createContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from "styled-components";
import CssBaseline from "@mui/material/CssBaseline";
import { themeFromKey, themes, fonts } from "../themeUtils";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: ${({ theme }) => theme.typography.fontFamily} !important;
    margin: 0;
    padding: 0;
    background-color: ${({ theme }) => theme.palette.background.default};
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const ThemeContext = createContext();

export const ThemeProviderComponent = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("themeKey") || "lightMaroon");
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("fontFamily") || fonts[0]);

  useEffect(() => localStorage.setItem("themeKey", themeKey), [themeKey]);
  useEffect(() => localStorage.setItem("fontFamily", fontFamily), [fontFamily]);

  const theme = useMemo(() => {
    const baseTheme = themeFromKey(themeKey);
    return {
      ...baseTheme,
      typography: {
        ...baseTheme.typography,
        fontFamily
      },
    };
  }, [themeKey, fontFamily]);

  const changeTheme = (key) => { if (themes[key]) setThemeKey(key); };
  const changeFont = (font) => { if (fonts.includes(font)) setFontFamily(font); };

  return (
    <ThemeContext.Provider value={{ themeKey, changeTheme, fontFamily, changeFont, themes, fonts }}>
      <ThemeProvider theme={theme}>
        <StyledThemeProvider theme={theme}>
          <>
            <CssBaseline />
            <GlobalStyle />
            {children}
          </>
        </StyledThemeProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
