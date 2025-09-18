import { createTheme, responsiveFontSizes } from "@mui/material/styles";
const themes = {
  royalAmethyst: {
    palette: {
      mode: "dark",
      primary: { main: "#7b2cbf", dark: "#5e2191", contrastText: "#fff" },
      secondary: { main: "#f1c40f", dark: "#c09d0c", contrastText: "#000" },
      background: { default: "#14101b", paper: "#24202b" },
      text: { primary: "#e9d8fd", secondary: "#c3a6e4" },
    },
    typography: { fontFamily: "Playfair Display, serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  royalAmethystLight: {
    palette: {
      mode: "light",
      primary: { main: "#7b2cbf", dark: "#5e2191", contrastText: "#fff" },
      secondary: { main: "#e5a50a", dark: "#c09d0c", contrastText: "#000" },
      background: { default: "#f8f5fe", paper: "#ffffff" },
      text: { primary: "#24202b", secondary: "#5a5361" },
    },
    typography: { fontFamily: "Playfair Display, serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  crimsonNight: {
    palette: {
      mode: "dark",
      primary: { main: "#c0392b", dark: "#a93226", contrastText: "#fff" },
      secondary: { main: "#bdc3c7", dark: "#95a5a6", contrastText: "#000" },
      background: { default: "#1e1e1e", paper: "#2b2b2b" },
      text: { primary: "#ecf0f1", secondary: "#bdc3c7" },
    },
    typography: { fontFamily: "Merriweather, serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  ivoryAndInk: {
    palette: {
      mode: "light",
      primary: { main: "#2c3e50", dark: "#233140", contrastText: "#fff" },
      secondary: { main: "#e74c3c", dark: "#c0392b", contrastText: "#fff" },
      background: { default: "#fdfdfd", paper: "#ffffff" },
      text: { primary: "#2c3e50", secondary: "#7f8c8d" },
    },
    typography: { fontFamily: "Inter, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  oliveGrove: {
    palette: {
      mode: "light",
      primary: { main: "#556b2f", dark: "#425425", contrastText: "#fff" },
      secondary: { main: "#c89f62", dark: "#a07f4e", contrastText: "#000" },
      background: { default: "#f5f5f0", paper: "#ffffff" },
      text: { primary: "#3d3c37", secondary: "#6b6962" },
    },
    typography: { fontFamily: "Lato, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  cosmicFusion: {
    palette: {
      mode: "dark",
      primary: { main: "#9d4edd", dark: "#7b2cbf", contrastText: "#fff" },
      secondary: { main: "#00fddc", dark: "#00c4ac", contrastText: "#000" },
      background: { default: "#10002b", paper: "#240046" },
      text: { primary: "#e0e0ff", secondary: "#a0a0cc" },
      gradient: "linear-gradient(135deg, #9d4edd 0%, #00fddc 100%)",
    },
    typography: { fontFamily: "Poppins, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  cosmicFusionLight: {
    palette: {
      mode: "light",
      primary: { main: "#9d4edd", dark: "#7b2cbf", contrastText: "#fff" },
      secondary: { main: "#00fddc", dark: "#00c4ac", contrastText: "#000" },
      background: { default: "#f7f2ff", paper: "#ffffff" },
      text: { primary: "#240046", secondary: "#5c2799" },
      gradient: "linear-gradient(135deg, #9d4edd 0%, #00fddc 100%)",
    },
    typography: { fontFamily: "Poppins, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  mangoSunrise: {
    palette: {
      mode: "light",
      primary: { main: "#f77f00", dark: "#d35400", contrastText: "#fff" },
      secondary: { main: "#fcbf49", dark: "#e8a825", contrastText: "#000" },
      background: { default: "#fffbeb", paper: "#ffffff" },
      text: { primary: "#331800", secondary: "#663d1a" },
      gradient: "linear-gradient(135deg, #fcbf49 0%, #f77f00 100%)",
    },
    typography: { fontFamily: "Lato, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  forestMist: {
    palette: {
      mode: "light",
      primary: { main: "#2d6a4f", dark: "#1b4332", contrastText: "#fff" },
      secondary: { main: "#95d5b2", dark: "#74b49b", contrastText: "#000" },
      background: { default: "#f7f9f7", paper: "#ffffff" },
      text: { primary: "#24202b", secondary: "#5a5361" },
      gradient: "linear-gradient(135deg, #95d5b2 0%, #2d6a4f 100%)",
    },
    typography: { fontFamily: "Nunito, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  sapphireAndSilver: {
    palette: {
      mode: "dark",
      primary: { main: "#0f4c75", dark: "#0a3a5a", contrastText: "#fff" },
      secondary: { main: "#bbe1fa", dark: "#a1c4d6", contrastText: "#000" },
      background: { default: "#101820", paper: "#1B262C" },
      text: { primary: "#f0f8ff", secondary: "#bbe1fa" },
    },
    typography: { fontFamily: "Playfair Display, serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  emeraldAndGold: {
    palette: {
      mode: "dark",
      primary: { main: "#1e4620", dark: "#143016", contrastText: "#fff" },
      secondary: { main: "#ffd700", dark: "#cca300", contrastText: "#000" },
      background: { default: "#001000", paper: "#002000" },
      text: { primary: "#d4eada", secondary: "#a7d7a7" },
    },
    typography: { fontFamily: "Playfair Display, serif", button: { textTransform: "none", fontWeight: 700 } },
  },
  rubyAndPearl: {
    palette: {
      mode: "light",
      primary: { main: "#8B0000", dark: "#6e0000", contrastText: "#fff" },
      secondary: { main: "#a9a9a9", dark: "#696969", contrastText: "#000" },
      background: { default: "#fff8f8", paper: "#ffffff" },
      text: { primary: "#24202b", secondary: "#5a5361" },
    },
    typography: { fontFamily: "Playfair Display, serif", button: { textTransform: "none", fontWeight: 700 } },
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
  "Nunito, sans-serif",
  "Inter, sans-serif",
];

export function themeFromKey(key) {
  if (!themes[key]) key = "forestMist";
  let theme = createTheme(themes[key]);
  return responsiveFontSizes(theme);
}

export { themes, fonts };