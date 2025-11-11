import { motion } from "framer-motion";
import React from "react";

export const ThreeDMarquee = ({
  images,
  className = "",
  cols = 6,
  onImageClick,
}) => {
  // Duplicate images to ensure smooth animation
  const duplicatedImages = [...images, ...images, ...images,];
  
  // Calculate how many images per column
  const groupSize = Math.ceil(duplicatedImages.length / cols);
  
  // Split images into columns
  const imageGroups = Array.from({ length: cols }, (_, index) =>
    duplicatedImages.slice(index * groupSize, (index + 1) * groupSize)
  );

  const handleImageClick = (image, globalIndex) => {
    if (onImageClick) {
      onImageClick(image, globalIndex);
    } else if (image.href) {
      window.open(image.href, image.target || "_self");
    }
  };

  return (
    <section
      style={{
        margin: '0 auto',
        display: 'block',
        height: '600px', // Increased height from 500px to 600px
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: "transparent",
        ...className
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          transform: "rotateX(55deg) rotateZ(45deg)",
        }}
      >
        <div style={{ width: '100%', overflow: 'hidden', transform: 'scale(1.0)' }}>
          <div
            style={{
              position: 'relative',
              display: 'grid',
              height: '100%',
              width: '100%',
              transformOrigin: 'center',
              gap: '16px',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {imageGroups.map((imagesInGroup, idx) => (
              <motion.div
                key={`column-${idx}`}
                animate={{ y: idx % 2 === 0 ? 150 : -150 }}
                transition={{
                  duration: idx % 2 === 0 ? 15 : 20,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '26px',
                  position: 'relative',
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  height: '100%', 
                  width: '2px', 
                  backgroundColor: '#e5e7eb' 
                }} />
                {imagesInGroup.map((image, imgIdx) => {
                  const globalIndex = idx * groupSize + imgIdx;
                  const isClickable = image.href || onImageClick;

                  return (
                    <div key={`img-${imgIdx}`} style={{ position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '2px', 
                        backgroundColor: '#e5e7eb' 
                      }} />
                      <motion.img
                        whileHover={{ y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        src={image.src}
                        alt={image.alt || 'Product image'}
                        style={{
                          aspectRatio: '1',
                          width: '100%',
                          maxWidth: '240px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'box-shadow 0.3s ease',
                        }}
                        onClick={() => handleImageClick(image, globalIndex)}
                      />
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};