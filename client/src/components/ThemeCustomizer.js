import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from "@mui/material";

export default function ThemeCustomizer() {
  const { themeKey, changeTheme, fontFamily, changeFont, themes, fonts } = useContext(ThemeContext);

  return (
    <Box sx={{ px: 1, pb: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontFamily }}>
        Theme Palette
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="theme-select-label" sx={{ fontFamily }}>Theme Palette</InputLabel>
        <Select
          labelId="theme-select-label"
          value={themeKey}
          label="Theme Palette"
          onChange={(e) => changeTheme(e.target.value)}
          autoWidth
          sx={{
            fontFamily,
            textTransform: "uppercase"
          }}
        >
          {Object.keys(themes).map((key) => (
            <MenuItem
              key={key}
              value={key}
              style={{ fontFamily, textTransform: "uppercase" }}
            >
              {key.replace(/([A-Z])/g, " $1")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle1" gutterBottom sx={{ fontFamily }}>
        Font Family
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="font-select-label" sx={{ fontFamily }}>Font Family</InputLabel>
        <Select
          labelId="font-select-label"
          value={fontFamily}
          label="Font Family"
          onChange={(e) => changeFont(e.target.value)}
          autoWidth
          sx={{
            fontFamily,
            textTransform: "uppercase",
          }}
        >
          {fonts.map((font) => (
            <MenuItem
              key={font}
              value={font}
              style={{ fontFamily: font, textTransform: "uppercase" }}
            >
              {font.split(",")[0]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
