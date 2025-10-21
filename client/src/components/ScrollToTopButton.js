import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ScrollToTopButton = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Zoom in={isVisible}>
      <Box
        onClick={scrollToTop}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: theme.spacing(14), // Positioned above the chatbot button (4 + 8 + 2)
          right: theme.spacing(4),
          zIndex: theme.zIndex.tooltip,
        }}
      >
        <Fab color="secondary" size="large" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  );
};

export default ScrollToTopButton;
