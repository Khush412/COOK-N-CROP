"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

const ThreeDCarousel = ({
  items = [],
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
  isMobileSwipe = true,
}) => {
  const [active, setActive] = useState(0);
  const carouselRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (autoRotate && !isHovering) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isHovering, autoRotate, rotateInterval, items.length]);

  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance)
      setActive((prev) => (prev + 1) % items.length);
    if (distance < -minSwipeDistance)
      setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  const getCardStyle = (index) => {
    if (index === active)
      return { transform: "scale(1)", opacity: 1, zIndex: 10 };
    if (index === (active + 1) % items.length)
      return { transform: "translateX(40%) scale(.95)", opacity: 0.6, zIndex: 5 };
    if (index === (active - 1 + items.length) % items.length)
      return { transform: "translateX(-40%) scale(.95)", opacity: 0.6, zIndex: 5 };
    return { transform: "scale(.9)", opacity: 0, pointerEvents: "none" };
  };

  return (
    <Box display="flex" justifyContent="center" width="100%" py={4}>
      <Box
        ref={carouselRef}
        position="relative"
        width="100%"
        maxWidth="900px"
        height={`${cardHeight}px`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={isMobileSwipe ? onTouchStart : undefined}
        onTouchMove={isMobileSwipe ? onTouchMove : undefined}
        onTouchEnd={isMobileSwipe ? onTouchEnd : undefined}
      >
        {items.map((item, index) => (
          <Box
            key={item.id}
            position="absolute"
            top={0}
            left="50%"
            sx={{
              transform: "translateX(-50%)",
              transition: "all .5s",
              width: "100%",
              maxWidth: 400,
              ...getCardStyle(index),
            }}
          >
            <Card
              sx={{
                height: `${cardHeight}px`,
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">{item.brand}</Typography>
                    <Typography variant="body2">{item.title}</Typography>
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.brand}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {item.description}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {item.tags.map((tag, i) => (
                    <Chip key={i} label={tag} size="small" />
                  ))}
                </Box>

                <Box
                  mt={2}
                  display="flex"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => window.open(item.link, "_self")}
                >
                  <Typography variant="body2" color="primary">
                    Learn More
                  </Typography>
                  <ArrowRightAltIcon fontSize="small" sx={{ ml: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}

        {!isMobile && (
          <>
            <IconButton
              sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setActive((prev) => (prev - 1 + items.length) % items.length)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setActive((prev) => (prev + 1) % items.length)}
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
