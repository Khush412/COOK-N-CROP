import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '@mui/material';

// Smooth fade animation
const fadeAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.25;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Main container with fullscreen support
const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  ${(props) => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props.$bgColor};
    backdrop-filter: blur(12px);
    z-index: 9999;
  `}
`;

// Loader wrapper with glassmorphism
const LoaderWrapper = styled.div`
  ${(props) => props.$fullScreen && `
    background: ${props.$cardBg};
    backdrop-filter: blur(12px);
    padding: 32px;
    border-radius: 20px;
    border: 1px solid ${props.$borderColor};
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  `}
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    width: ${p => Math.min(parseInt(p.$size) * 0.8, 54)}px;
    height: ${p => Math.min(parseInt(p.$size) * 0.8, 54)}px;
  }
  
  @media (max-width: 480px) {
    width: ${p => Math.min(parseInt(p.$size) * 0.7, 40)}px;
    height: ${p => Math.min(parseInt(p.$size) * 0.7, 40)}px;
  }
`;

const SpinnerBar = styled.div`
  width: 8%;
  height: 24%;
  background: ${p => p.$color};
  position: absolute;
  left: 50%;
  top: 30%;
  opacity: 0;
  border-radius: 50px;
  box-shadow: 0 0 8px ${p => p.$color}40;
  animation: ${fadeAnimation} 1s linear infinite;
  transform: ${p => p.$transform};
  animation-delay: ${p => p.$delay};
`;

const LoaderText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.$color};
  text-align: center;
  letter-spacing: 0.5px;
  animation: ${slideIn} 0.5s ease-out;
  font-family: ${p => p.$fontFamily};
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Loader = ({ size = 'medium', color, text, fullScreen = false }) => {
  const theme = useTheme();
  
  // Theme-aware colors
  const primaryColor = color || theme.palette.primary.main;
  const textColor = theme.palette.text.primary;
  const bgColor = `${theme.palette.background.default}e6`; // 90% opacity
  const cardBg = `${theme.palette.background.paper}cc`; // 80% opacity
  const borderColor = `${primaryColor}33`; // 20% opacity
  const fontFamily = theme.typography.fontFamily;
  
  // Size configuration
  const sizeConfig = {
    tiny: 30,
    small: 40,
    medium: 54,
    large: 70,
    xlarge: 85
  };
  
  const loaderSize = sizeConfig[size] || sizeConfig.medium;
  
  // Bar configurations
  const bars = [
    { rotation: 0, delay: '0s' },
    { rotation: 30, delay: '-1.1s' },
    { rotation: 60, delay: '-1s' },
    { rotation: 90, delay: '-0.9s' },
    { rotation: 120, delay: '-0.8s' },
    { rotation: 150, delay: '-0.7s' },
    { rotation: 180, delay: '-0.6s' },
    { rotation: 210, delay: '-0.5s' },
    { rotation: 240, delay: '-0.4s' },
    { rotation: 270, delay: '-0.3s' },
    { rotation: 300, delay: '-0.2s' },
    { rotation: 330, delay: '-0.1s' }
  ];

  return (
    <LoaderContainer 
      $fullScreen={fullScreen}
      $bgColor={bgColor}
    >
      <LoaderWrapper
        $fullScreen={fullScreen}
        $cardBg={cardBg}
        $borderColor={borderColor}
      >
        <SpinnerContainer $size={loaderSize}>
          {bars.map((bar, index) => (
            <SpinnerBar
              key={index}
              $color={primaryColor}
              $transform={`rotate(${bar.rotation}deg) translate(0, -130%)`}
              $delay={bar.delay}
            />
          ))}
        </SpinnerContainer>
      </LoaderWrapper>
      
      {text && (
        <LoaderText $color={textColor} $fontFamily={fontFamily}>
          {text}
        </LoaderText>
      )}
    </LoaderContainer>
  );
};

export default Loader;
