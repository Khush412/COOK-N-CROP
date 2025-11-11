import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { useNavigate } from "react-router-dom";

const ThreeDCarousel = ({
  items = [],
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
}) => {
  const [active, setActive] = useState(0);
  const carouselRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRotate && !isHovering && items.length > 0) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isHovering, autoRotate, rotateInterval, items.length]);

  const handleCardClick = (link) => {
    if (link.startsWith("/")) {
      // Internal link - use React Router
      navigate(link);
    } else {
      // External link - open in new tab
      window.open(link, "_blank");
    }
  };

  const getCardStyle = (index) => {
    const position = (index - active + items.length) % items.length;
    
    // Center card
    if (position === 0) {
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        zIndex: 10,
        transition: "all 0.5s ease",
      };
    }
    // Right card 1
    else if (position === 1) {
      return {
        transform: "translateX(35%) scale(0.9)",
        opacity: 0.9,
        zIndex: 9,
        transition: "all 0.5s ease",
      };
    }
    // Right card 2
    else if (position === 2) {
      return {
        transform: "translateX(70%) scale(0.8)",
        opacity: 0.7,
        zIndex: 8,
        transition: "all 0.5s ease",
      };
    }
    // Left card 1
    else if (position === items.length - 1) {
      return {
        transform: "translateX(-35%) scale(0.9)",
        opacity: 0.9,
        zIndex: 9,
        transition: "all 0.5s ease",
      };
    }
    // Left card 2
    else if (position === items.length - 2) {
      return {
        transform: "translateX(-70%) scale(0.8)",
        opacity: 0.7,
        zIndex: 8,
        transition: "all 0.5s ease",
      };
    }
    // Hidden cards
    else {
      return {
        transform: "translateX(0) scale(0.7)",
        opacity: 0,
        zIndex: 7,
        transition: "all 0.5s ease",
      };
    }
  };

  // Handle navigation with proper event handling
  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActive((prev) => (prev + 1) % items.length);
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      width="100%" 
      py={4}
      sx={{ 
        minHeight: `${cardHeight + 100}px`,
      }}
    >
      <Box
        ref={carouselRef}
        position="relative"
        width="100%"
        maxWidth="1200px"
        height={`${cardHeight}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {items.map((item, index) => (
          <Box
            key={item.id}
            position="absolute"
            sx={{
              width: { xs: "90%", sm: "80%", md: "70%" },
              maxWidth: "400px",
              ...getCardStyle(index),
            }}
          >
            <Card
              sx={{
                height: `${cardHeight}px`,
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              }}
              onClick={() => handleCardClick(item.link)}
            >
              <CardMedia
                component="img"
                height="250"
                image={item.imageUrl}
                alt={item.title}
                sx={{
                  objectFit: "cover",
                }}
              />
              <CardContent 
                sx={{ 
                  flexGrow: 1, 
                  display: "flex", 
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={item.brand} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: "bold",
                      mb: 1,
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h5" 
                  component="div" 
                  gutterBottom
                  sx={{ 
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    flexGrow: 1,
                  }}
                >
                  {item.description}
                </Typography>
                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  gap={1} 
                  mb={2}
                >
                  {item.tags.map((tag, i) => (
                    <Chip 
                      key={i} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      sx={{
                        borderRadius: "4px",
                      }}
                    />
                  ))}
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ 
                    mt: "auto",
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                  }}
                >
                  <Typography variant="body2">
                    Learn More
                  </Typography>
                  <ArrowRightAltIcon 
                    fontSize="small" 
                    sx={{ ml: 1 }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}

        {!isMobile && items.length > 1 && (
          <>
            <IconButton
              sx={{ 
                position: "absolute", 
                left: { xs: 10, sm: 20, md: 30 }, 
                top: "50%", 
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 3,
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "translateY(-50%) scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={handlePrev}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              sx={{ 
                position: "absolute", 
                right: { xs: 10, sm: 20, md: 30 }, 
                top: "50%", 
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 3,
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "translateY(-50%) scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={handleNext}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ThreeDCarousel;