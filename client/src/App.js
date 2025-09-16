import React from "react";
import { ThemeProviderComponent as ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext"; // New
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import AppRouter from "./router";
import Footer from "./components/Footer";
import { CssBaseline, GlobalStyles } from "@mui/material";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <ThemeProvider>
            <CssBaseline />
            <GlobalStyles styles={{ body: { overflowY: 'scroll' } }} />
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Navbar />
              <main style={{ flexGrow: 1 }}>
                <AppRouter />
              </main>
               <Chatbot />
              <Footer />
            </div>
          </ThemeProvider>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;