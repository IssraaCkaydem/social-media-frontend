


// src/theme.js
import { createTheme } from "@mui/material/styles";
import { COLORS } from "./utils/constants"; 

const theme = createTheme({
  palette: {
    primary: { 
      main: COLORS.PRIMARY 
    },
    secondary: { 
      main: COLORS.SECONDARY 
    },
    error: { 
      main: COLORS.ERROR 
    },
    background: { 
      default: COLORS.BACKGROUND 
    },
    text: { 
      primary: COLORS.TEXT_MAIN, 
      secondary: COLORS.TEXT_SECONDARY 
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: { 
      fontWeight: 600 
    },
    body1: { 
      fontSize: 16 
    },
  },
  shape: { 
    borderRadius: 10 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "16px",
        },
      },
    },
  },
});

export default theme;