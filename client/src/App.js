import React from "react";
import { ThemeProviderComponent as ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import AppRouter from "./router";
import Footer from "./components/Footer";
import { Container, CssBaseline, GlobalStyles } from "@mui/material";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <GlobalStyles styles={{ body: { overflowY: 'scroll' } }} />
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
              <AppRouter />
            </Container>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;