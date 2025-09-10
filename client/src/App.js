import React from "react";
import { ThemeProviderComponent as ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext"; // New
import Navbar from "./components/Navbar";
import AppRouter from "./router";
import Footer from "./components/Footer";
import { Container, CssBaseline, GlobalStyles } from "@mui/material";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <CssBaseline />
          <GlobalStyles styles={{ body: { overflowY: 'scroll' } }} />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flexGrow: 1 }}>
              <AppRouter />
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;