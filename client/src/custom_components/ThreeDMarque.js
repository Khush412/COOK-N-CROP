import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export const ThreeDMarquee = ({
  images,
  className = "",
  cols = 6,
  onImageClick,
}) => {
  const [columns, setColumns] = useState(cols);
  const [sectionHeight, setSectionHeight] = useState(600); // Base height for desktop
  
  // Adjust columns and height based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setColumns(3); // Strictly 3 columns on mobile
        setSectionHeight(300); // Reduced height for mobile
      } else if (window.innerWidth <= 768) {
        setColumns(4); // 4 columns on tablet
        setSectionHeight(400); // Medium height for tablet
      } else {
        setColumns(cols); // Original number of columns on desktop
        setSectionHeight(600); // Original height on desktop
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [cols]);

  // Duplicate images to ensure smooth animation
  const duplicatedImages = [...images, ...images, ...images];
  
  // Calculate how many images per column
  const groupSize = Math.ceil(duplicatedImages.length / columns);
  
  // Split images into columns
  const imageGroups = Array.from({ length: columns }, (_, index) =>
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
        height: `${sectionHeight}px`, // Dynamic height based on screen size
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
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
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
      
      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          section {
            height: 500px !important;
          }
          
          div[style*="rotateX"] {
            transform: rotateX(50deg) rotateZ(40deg) scale(0.9);
          }
          
          div[style*="gridTemplateColumns"] {
            gap: 12px;
          }
          
          div[style*="flexDirection"] {
            gap: 20px;
          }
        }
        
        @media (max-width: 768px) {
          section {
            height: 400px !important;
          }
          
          div[style*="rotateX"] {
            transform: rotateX(45deg) rotateZ(35deg) scale(0.8);
          }
          
          div[style*="gridTemplateColumns"] {
            gap: 8px;
          }
          
          div[style*="flexDirection"] {
            gap: 16px;
          }
          
          img[style*="maxWidth"] {
            maxWidth: 180px;
          }
        }
        
        @media (max-width: 480px) {
          section {
            height: 300px !important;
          }
          
          div[style*="rotateX"] {
            transform: rotateX(35deg) rotateZ(25deg) scale(0.6);
          }
          
          div[style*="gridTemplateColumns"] {
            gap: 4px;
          }
          
          div[style*="flexDirection"] {
            gap: 10px;
          }
          
          img[style*="maxWidth"] {
            maxWidth: 80px;
          }
          
          div[style*="borderRadius"] {
            borderRadius: 6px;
          }
          
          div[style*="boxShadow"] {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }
        }
      `}</style>
    </section>
  );
};