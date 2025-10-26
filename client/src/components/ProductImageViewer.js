import React, { useState, useRef } from 'react';
import ImageGallery from 'react-image-gallery';
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import 'react-image-gallery/styles/css/image-gallery.css';

const ProductImageViewer = ({ images, productName }) => {
  const theme = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const galleryRef = useRef(null);

  // Format images for react-image-gallery
  const formattedImages = images.map((img, index) => ({
    original: img.original || img,
    thumbnail: img.thumbnail || img,
    originalAlt: `${productName} - View ${index + 1}`,
    thumbnailAlt: `${productName} - Thumbnail ${index + 1}`,
  }));

  const handleZoomIn = () => {
    if (galleryRef.current) {
      const galleryElement = galleryRef.current;
      const currentZoom = parseFloat(galleryElement.style.zoom) || 1;
      const newZoom = Math.min(currentZoom + 0.1, 3);
      galleryElement.style.zoom = newZoom;
    }
  };

  const handleZoomOut = () => {
    if (galleryRef.current) {
      const galleryElement = galleryRef.current;
      const currentZoom = parseFloat(galleryElement.style.zoom) || 1;
      const newZoom = Math.max(currentZoom - 0.1, 0.5);
      galleryElement.style.zoom = newZoom;
    }
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderCustomControls = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 2,
        display: 'flex',
        gap: 1,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        borderRadius: 2,
        p: 1,
      }}
    >
      <Tooltip title="Zoom In">
        <IconButton size="small" onClick={handleZoomIn}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <IconButton size="small" onClick={handleZoomOut}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate Left">
        <IconButton size="small" onClick={handleRotateLeft}>
          <RotateLeftIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate Right">
        <IconButton size="small" onClick={handleRotateRight}>
          <RotateRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
        <IconButton size="small" onClick={handleFullscreen}>
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (formattedImages.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          borderRadius: 2,
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/images/placeholder.png`}
          alt="No image available"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </Box>
    );
  }

  return (
    <Box
      ref={galleryRef}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
        '& .image-gallery': {
          borderRadius: 3,
        },
        '& .image-gallery-content': {
          borderRadius: 3,
        },
        '& .image-gallery-slide-wrapper': {
          borderRadius: 3,
        },
        '& .image-gallery-thumbnails-wrapper': {
          mt: 2,
        },
        '& .image-gallery-thumbnail': {
          border: 'none',
          borderRadius: 2,
          '&.active': {
            border: `2px solid ${theme.palette.primary.main}`,
          },
        },
      }}
    >
      <ImageGallery
        items={formattedImages}
        showPlayButton={false}
        showFullscreenButton={false}
        showBullets={formattedImages.length > 1}
        showThumbnails={formattedImages.length > 1}
        showNav={formattedImages.length > 1}
        showIndex={false}
        lazyLoad={true}
        slideDuration={450}
        slideInterval={3000}
        thumbnailPosition="bottom"
        additionalClass="product-image-gallery"
        renderCustomControls={renderCustomControls}
        onScreenChange={setIsFullscreen}
      />
    </Box>
  );
};

export default ProductImageViewer;