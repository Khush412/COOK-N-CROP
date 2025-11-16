import React, { useState, useEffect } from "react";
import { ThemeProviderComponent as ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext"; // New
import { CartProvider } from "./contexts/CartContext";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import AppRouter from "./router";
import Footer from "./components/Footer";
import { CssBaseline, GlobalStyles } from "@mui/material";
import Chatbot from "./components/Chatbot";
import ScrollToTopButton from "./components/ScrollToTopButton";
import MobileDock from "./components/MobileDock";

function AppContent() {
  const location = useLocation();
  // Don't show footer on messenger page
  const hideFooter = location.pathname === '/messages';
  
  const [showMobileDock, setShowMobileDock] = useState(true);
  
  useEffect(() => {
    const saved = localStorage.getItem('showMobileDock');
    if (saved !== null) {
      setShowMobileDock(JSON.parse(saved));
    }
  }, []);
  
  // Listen for changes to the MobileDock visibility
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'showMobileDock') {
        setShowMobileDock(JSON.parse(e.newValue));
      }
    };
    
    const handleMobileDockToggle = (e) => {
      setShowMobileDock(e.detail.visible);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mobiledock-toggle', handleMobileDockToggle);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mobiledock-toggle', handleMobileDockToggle);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingBottom: hideFooter ? '0px' : '80px' }}>
        <AppRouter />
      </main>
      <Chatbot />
      <ScrollToTopButton />
      {!hideFooter && <Footer />}
      {showMobileDock && <MobileDock />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <ThemeProvider>
            <CssBaseline />
            <GlobalStyles styles={{ body: { overflowY: 'scroll' } }} />
            <AppContent />
          </ThemeProvider>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;