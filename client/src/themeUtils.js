import { createTheme, responsiveFontSizes } from "@mui/material/styles";
const themes = {
  lightMaroon: {
    palette: {
      mode: "light",
      primary: { main: "#800000", dark: "#4b0000", contrastText: "#fff" },
      secondary: { main: "#e8eb14d1", dark: "#6b5523", contrastText: "#fff" },
      background: { default: "#faf6f5", paper: "#fff" },
      text: { primary: "#2c2c2c", secondary: "#555555" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  darkMaroon: {
    palette: {
      mode: "dark",
      primary: { main: "#a94b4b", dark: "#7a3838", contrastText: "#fff" },
      secondary: { main: "#d4d111ff", dark: "#7f703e", contrastText: "#000" },
      background: { default: "#1b1212", paper: "#2d1f1f" },
      text: { primary: "#eee", secondary: "#bbb" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  lightBlue: {
    palette: {
      mode: "light",
      primary: { main: "#1976d2", dark: "#004ba0", contrastText: "#fff" },
      secondary: { main: "#e2dae4ff", dark: "#005b9f", contrastText: "#fff" },
      background: { default: "#e3f2fd", paper: "#ffffff" },
      text: { primary: "#0d1f44", secondary: "#555" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  darkBlue: {
    palette: {
      mode: "dark",
      primary: { main: "#2d3ac8ff", dark: "#5d99c6", contrastText: "#000" },
      secondary: { main: "#64b5f6", dark: "#357ab7", contrastText: "#000" },
      background: { default: "#0d47a1", paper: "#1565c0" },
      text: { primary: "#e6f0ff", secondary: "#bbb" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  lightGreen: {
    palette: {
      mode: "light",
      primary: { main: "#388e3c", dark: "#00600f", contrastText: "#fff" },
      secondary: { main: "#49ddbdff", dark: "#519657", contrastText: "#000" },
      background: { default: "#e8f5e9", paper: "#fff" },
      text: { primary: "#1b431e", secondary: "#555" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  darkGreen: {
    palette: {
      mode: "dark",
      primary: { main: "#1c7020ff", dark: "#519657", contrastText: "#000" },
      secondary: { main: "#a5d6a7", dark: "#6d9c6d", contrastText: "#000" },
      background: { default: "#1b5e20", paper: "#2e7d32" },
      text: { primary: "#e6f0e6", secondary: "#ccc" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  lightOrange: {
    palette: {
      mode: "light",
      primary: { main: "#f57c00", dark: "#bb4d00", contrastText: "#000" },
      secondary: { main: "#cbc9cbff", dark: "#c88719", contrastText: "#000" },
      background: { default: "#fff3e0", paper: "#fff" },
      text: { primary: "#4e2f00", secondary: "#555" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
  darkOrange: {
    palette: {
      mode: "dark",
      primary: { main: "#c63c1dff", dark: "#c88719", contrastText: "#000" },
      secondary: { main: "#ffe0b2", dark: "#d6a14c", contrastText: "#000" },
      background: { default: "#ed854dff", paper: "#ef6c00" },
      text: { primary: "#fff2e6", secondary: "#171010ff" },
    },
    typography: { fontFamily: "Roboto, Arial, sans-serif", button: { textTransform: "uppercase" } },
  },
};


const fonts = [
  "Roboto, Arial, sans-serif",
  "'Open Sans', sans-serif",
  "Lato, sans-serif",
  "Montserrat, sans-serif",
  "Oswald, sans-serif",
  "Raleway, sans-serif",
  "Merriweather, serif",
  "Playfair Display, serif",
  "Source Sans Pro, sans-serif",
  "Poppins, sans-serif",
];

export function themeFromKey(key) {
  if (!themes[key]) key = "lightMaroon";
  let theme = createTheme(themes[key]);
  return responsiveFontSizes(theme);
}

export { themes, fonts };