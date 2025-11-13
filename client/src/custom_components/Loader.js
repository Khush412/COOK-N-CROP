import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

// Create styled components with proper prop handling
const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${(props) => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  `}
`;

const HourglassBackground = styled.div`
  position: relative;
  background-color: ${p => p.$color || '#3498db'};
  height: ${p => p.$containerHeight || '130px'};
  width: ${p => p.$containerWidth || '130px'};
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HourglassContainer = styled.div`
  position: absolute;
  top: ${p => p.$top || '30px'};
  left: ${p => p.$left || '40px'};
  width: ${p => p.$width || '50px'};
  height: ${p => p.$height || '70px'};
  animation: hourglassRotate 2s ease-in infinite;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  @keyframes hourglassRotate {
    0% {
      transform: rotateX(0deg);
    }
    50% {
      transform: rotateX(180deg);
    }
    100% {
      transform: rotateX(180deg);
    }
  }
`;

const HourglassCurves = styled.div`
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: ${p => `${(parseInt(p.$height) || 70) * 0.46}px`};
    width: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    height: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: hideCurves 2s ease-in infinite;
  }
  
  &:before {
    left: ${p => `${(parseInt(p.$width) || 50) * 0.3}px`};
  }
  
  &:after {
    left: ${p => `${(parseInt(p.$width) || 50) * 0.58}px`};
  }
  
  @keyframes hideCurves {
    0% {
      opacity: 1;
    }
    25% {
      opacity: 0;
    }
    30% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
`;

const HourglassCapTop = styled.div`
  position: absolute;
  top: 0;
  
  &:before {
    content: '';
    position: absolute;
    top: ${p => `-${(parseInt(p.$height) || 70) * 0.35}px`};
    left: 0;
    width: 100%;
    height: ${p => `${(parseInt(p.$height) || 70) * 0.07}px`};
    background-color: inherit;
    border-radius: 50%;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: ${p => `-${(parseInt(p.$height) || 70) * 0.28}px`};
    left: 0;
    width: 100%;
    height: ${p => `${(parseInt(p.$height) || 70) * 0.14}px`};
    background-color: inherit;
    border-radius: 50%;
  }
`;

const HourglassCapBottom = styled.div`
  position: absolute;
  bottom: 0;
  
  &:before {
    content: '';
    position: absolute;
    bottom: ${p => `-${(parseInt(p.$height) || 70) * 0.35}px`};
    left: 0;
    width: 100%;
    height: ${p => `${(parseInt(p.$height) || 70) * 0.07}px`};
    background-color: inherit;
    border-radius: 50%;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: ${p => `-${(parseInt(p.$height) || 70) * 0.28}px`};
    left: 0;
    width: 100%;
    height: ${p => `${(parseInt(p.$height) || 70) * 0.14}px`};
    background-color: inherit;
    border-radius: 50%;
  }
`;

const HourglassGlassTop = styled.div`
  transform: rotateX(90deg);
  position: absolute;
  top: ${p => `-${(parseInt(p.$height) || 70) * 0.23}px`};
  left: ${p => `${(parseInt(p.$width) || 50) * 0.06}px`};
  border-radius: 50%;
  width: ${p => `${(parseInt(p.$width) || 50) * 0.88}px`};
  height: ${p => `${(parseInt(p.$width) || 50) * 0.88}px`};
  background-color: rgba(255, 255, 255, 0.7);
`;

const HourglassGlass = styled.div`
  perspective: 100px;
  position: absolute;
  top: ${p => `${(parseInt(p.$height) || 70) * 0.46}px`};
  left: ${p => `${(parseInt(p.$width) || 50) * 0.4}px`};
  width: ${p => `${(parseInt(p.$width) || 50) * 0.2}px`};
  height: ${p => `${(parseInt(p.$height) || 70) * 0.085}px`};
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 0.5;
  
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    left: ${p => `-${(parseInt(p.$width) || 50) * 0.34}px`};
    width: ${p => `${(parseInt(p.$width) || 50) * 0.88}px`};
    height: ${p => `${(parseInt(p.$height) || 70) * 0.4}px`};
  }
  
  &:before {
    top: ${p => `-${(parseInt(p.$height) || 70) * 0.385}px`};
    border-radius: 0 0 ${p => `${(parseInt(p.$width) || 50) * 0.5}px`} ${p => `${(parseInt(p.$width) || 50) * 0.5}px`};
  }
  
  &:after {
    bottom: ${p => `-${(parseInt(p.$height) || 70) * 0.385}px`};
    border-radius: ${p => `${(parseInt(p.$width) || 50) * 0.5}px`} ${p => `${(parseInt(p.$width) || 50) * 0.5}px`} 0 0;
  }
`;

const HourglassSandStream = styled.div`
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: ${p => `${(parseInt(p.$width) || 50) * 0.48}px`};
    width: ${p => `${(parseInt(p.$width) || 50) * 0.06}px`};
    background-color: white;
    animation: sandStream1 2s ease-in infinite;
  }
  
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: ${p => `${(parseInt(p.$height) || 70) * 0.515}px`};
    left: ${p => `${(parseInt(p.$width) || 50) * 0.38}px`};
    border-left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`} solid transparent;
    border-right: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`} solid transparent;
    border-bottom: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`} solid #fff;
    animation: sandStream2 2s ease-in infinite;
  }
  
  @keyframes sandStream1 {
    0% {
      height: 0;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.5}px`};
    }
    50% {
      height: 0;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.64}px`};
    }
    60% {
      height: ${p => `${(parseInt(p.$height) || 70) * 0.5}px`};
      top: ${p => `${(parseInt(p.$height) || 70) * 0.115}px`};
    }
    85% {
      height: ${p => `${(parseInt(p.$height) || 70) * 0.5}px`};
      top: ${p => `${(parseInt(p.$height) || 70) * 0.115}px`};
    }
    100% {
      height: 0;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.115}px`};
    }
  }
  
  @keyframes sandStream2 {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    51% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    91% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
`;

const HourglassSand = styled.div`
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    background-color: white;
    perspective: 500px;
  }
  
  &:before {
    top: ${p => `${(parseInt(p.$height) || 70) * 0.115}px`};
    width: ${p => `${(parseInt(p.$width) || 50) * 0.78}px`};
    border-radius: ${p => `${(parseInt(p.$width) || 50) * 0.06}px`} ${p => `${(parseInt(p.$width) || 50) * 0.06}px`} ${p => `${(parseInt(p.$width) || 50) * 0.58}px`} ${p => `${(parseInt(p.$width) || 50) * 0.58}px`};
    animation: sandFillup 2s ease-in infinite;
  }
  
  &:after {
    border-radius: ${p => `${(parseInt(p.$width) || 50) * 0.58}px`} ${p => `${(parseInt(p.$width) || 50) * 0.58}px`} ${p => `${(parseInt(p.$width) || 50) * 0.06}px`} ${p => `${(parseInt(p.$width) || 50) * 0.06}px`};
    animation: sandDeplete 2s ease-in infinite;
  }
  
  @keyframes sandFillup {
    0% {
      opacity: 0;
      height: 0;
    }
    60% {
      opacity: 1;
      height: 0;
    }
    100% {
      opacity: 1;
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
    }
  }
  
  @keyframes sandDeplete {
    0% {
      opacity: 0;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.64}px`};
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
      width: ${p => `${(parseInt(p.$width) || 50) * 0.76}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    }
    1% {
      opacity: 1;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.64}px`};
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
      width: ${p => `${(parseInt(p.$width) || 50) * 0.76}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    }
    24% {
      opacity: 1;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.64}px`};
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
      width: ${p => `${(parseInt(p.$width) || 50) * 0.76}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    }
    25% {
      opacity: 1;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.585}px`};
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
      width: ${p => `${(parseInt(p.$width) || 50) * 0.76}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    }
    50% {
      opacity: 1;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.585}px`};
      height: ${p => `${(parseInt(p.$height) || 70) * 0.24}px`};
      width: ${p => `${(parseInt(p.$width) || 50) * 0.76}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.12}px`};
    }
    90% {
      opacity: 1;
      top: ${p => `${(parseInt(p.$height) || 70) * 0.585}px`};
      height: 0;
      width: ${p => `${(parseInt(p.$width) || 50) * 0.2}px`};
      left: ${p => `${(parseInt(p.$width) || 50) * 0.4}px`};
    }
  }
`;

const LoaderText = styled.div`
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.palette.text.primary};
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-top: 12px;
  }
`;

const Loader = ({ size = 'medium', color, text, fullScreen = false }) => {
  const theme = useTheme();
  const loaderColor = color || theme.palette.primary.main;

  // Size configuration with proper fallbacks
  const sizeConfig = {
    tiny: { 
      container: { width: '40px', height: '40px' },
      hourglass: { width: '16px', height: '22px', top: '9px', left: '12px' }
    },
    small: { 
      container: { width: '60px', height: '60px' },
      hourglass: { width: '24px', height: '34px', top: '13px', left: '18px' }
    },
    medium: { 
      container: { width: '100px', height: '100px' },
      hourglass: { width: '40px', height: '56px', top: '22px', left: '30px' }
    },
    large: { 
      container: { width: '140px', height: '140px' },
      hourglass: { width: '56px', height: '78px', top: '31px', left: '42px' }
    },
    xlarge: { 
      container: { width: '180px', height: '180px' },
      hourglass: { width: '70px', height: '98px', top: '41px', left: '55px' }
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <LoaderContainer $fullScreen={fullScreen} className="responsive-hourglass-loader">
      <HourglassBackground 
        $color={loaderColor}
        $containerHeight={config.container.height}
        $containerWidth={config.container.width}
      >
        <HourglassContainer
          $top={config.hourglass.top}
          $left={config.hourglass.left}
          $width={config.hourglass.width}
          $height={config.hourglass.height}
        >
          <HourglassCurves 
            $width={config.hourglass.width}
            $height={config.hourglass.height}
          />
          <HourglassCapTop 
            $height={config.hourglass.height}
          />
          <HourglassGlassTop 
            $width={config.hourglass.width}
            $height={config.hourglass.height}
          />
          <HourglassSand 
            $width={config.hourglass.width}
            $height={config.hourglass.height}
          />
          <HourglassSandStream 
            $width={config.hourglass.width}
            $height={config.hourglass.height}
          />
          <HourglassCapBottom 
            $height={config.hourglass.height}
          />
          <HourglassGlass 
            $width={config.hourglass.width}
            $height={config.hourglass.height}
          />
        </HourglassContainer>
      </HourglassBackground>
      {text && (
        <LoaderText>
          {text}
        </LoaderText>
      )}
    </LoaderContainer>
  );
};

export default Loader;