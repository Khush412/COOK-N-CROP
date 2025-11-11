import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

const Loader = ({ size = 'medium', color, text }) => {
  const theme = useTheme();
  const loaderColor = color || theme.palette.primary.main;

  // Size configuration
  const sizeConfig = {
    small: { 
      container: { width: '80px', height: '80px' },
      hourglass: { width: '30px', height: '42px', top: '19px', left: '25px' }
    },
    medium: { 
      container: { width: '130px', height: '130px' },
      hourglass: { width: '50px', height: '70px', top: '30px', left: '40px' }
    },
    large: { 
      container: { width: '180px', height: '180px' },
      hourglass: { width: '70px', height: '98px', top: '41px', left: '55px' }
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <StyledWrapper 
      sizeConfig={config} 
      loaderColor={loaderColor}
      className="responsive-hourglass-loader"
    >
      <div className="hourglassBackground">
        <div className="hourglassContainer">
          <div className="hourglassCurves" />
          <div className="hourglassCapTop" />
          <div className="hourglassGlassTop" />
          <div className="hourglassSand" />
          <div className="hourglassSandStream" />
          <div className="hourglassCapBottom" />
          <div className="hourglassGlass" />
        </div>
      </div>
      {text && (
        <div className="loader-text">
          {text}
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .hourglassBackground {
    position: relative;
    background-color: ${({ loaderColor }) => loaderColor};
    height: ${({ sizeConfig }) => sizeConfig.container.height};
    width: ${({ sizeConfig }) => sizeConfig.container.width};
    border-radius: 50%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hourglassContainer {
    position: absolute;
    top: ${({ sizeConfig }) => sizeConfig.hourglass.top};
    left: ${({ sizeConfig }) => sizeConfig.hourglass.left};
    width: ${({ sizeConfig }) => sizeConfig.hourglass.width};
    height: ${({ sizeConfig }) => sizeConfig.hourglass.height};
    animation: hourglassRotate 2s ease-in 0s infinite;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .hourglassContainer div,
  .hourglassContainer div:before,
  .hourglassContainer div:after {
    transform-style: preserve-3d;
  }

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

  .hourglassCapTop {
    top: 0;
  }

  .hourglassCapTop:before {
    top: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.35}px;
  }

  .hourglassCapTop:after {
    top: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.28}px;
  }

  .hourglassCapBottom {
    bottom: 0;
  }

  .hourglassCapBottom:before {
    bottom: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.35}px;
  }

  .hourglassCapBottom:after {
    bottom: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.28}px;
  }

  .hourglassGlassTop {
    transform: rotateX(90deg);
    position: absolute;
    top: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.23}px;
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px;
    border-radius: 50%;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.88}px;
    height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.88}px;
    background-color: rgba(255, 255, 255, 0.7);
  }

  .hourglassGlass {
    perspective: 100px;
    position: absolute;
    top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.46}px;
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.4}px;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.2}px;
    height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.085}px;
    background-color: rgba(255, 255, 255, 0.5);
    opacity: 0.5;
  }

  .hourglassGlass:before,
  .hourglassGlass:after {
    content: '';
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    left: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.34}px;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.88}px;
    height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.4}px;
  }

  .hourglassGlass:before {
    top: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.385}px;
    border-radius: 0 0 ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.5}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.5}px;
  }

  .hourglassGlass:after {
    bottom: -${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.385}px;
    border-radius: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.5}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.5}px 0 0;
  }

  .hourglassCurves:before,
  .hourglassCurves:after {
    content: '';
    display: block;
    position: absolute;
    top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.46}px;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: hideCurves 2s ease-in 0s infinite;
  }

  .hourglassCurves:before {
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.3}px;
  }

  .hourglassCurves:after {
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.58}px;
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

  .hourglassSandStream:before {
    content: '';
    display: block;
    position: absolute;
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.48}px;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px;
    background-color: white;
    animation: sandStream1 2s ease-in 0s infinite;
  }

  .hourglassSandStream:after {
    content: '';
    display: block;
    position: absolute;
    top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.515}px;
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.38}px;
    border-left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px solid transparent;
    border-right: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px solid transparent;
    border-bottom: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px solid #fff;
    animation: sandStream2 2s ease-in 0s infinite;
  }

  @keyframes sandStream1 {
    0% {
      height: 0;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.5}px;
    }
    50% {
      height: 0;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.64}px;
    }
    60% {
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.5}px;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.115}px;
    }
    85% {
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.5}px;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.115}px;
    }
    100% {
      height: 0;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.115}px;
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

  .hourglassSand:before,
  .hourglassSand:after {
    content: '';
    display: block;
    position: absolute;
    left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    background-color: white;
    perspective: 500px;
  }

  .hourglassSand:before {
    top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.115}px;
    width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.78}px;
    border-radius: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.58}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.58}px;
    animation: sandFillup 2s ease-in 0s infinite;
  }

  .hourglassSand:after {
    border-radius: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.58}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.58}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.06}px;
    animation: sandDeplete 2s ease-in 0s infinite;
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
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
    }
  }

  @keyframes sandDeplete {
    0% {
      opacity: 0;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.64}px;
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.76}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    }
    1% {
      opacity: 1;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.64}px;
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.76}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    }
    24% {
      opacity: 1;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.64}px;
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.76}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    }
    25% {
      opacity: 1;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.585}px;
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.76}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    }
    50% {
      opacity: 1;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.585}px;
      height: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.24}px;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.76}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.12}px;
    }
    90% {
      opacity: 1;
      top: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.height) * 0.585}px;
      height: 0;
      width: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.2}px;
      left: ${({ sizeConfig }) => parseInt(sizeConfig.hourglass.width) * 0.4}px;
    }
  }

  .loader-text {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.palette.text.primary};
    text-align: center;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .hourglassBackground {
      height: ${({ sizeConfig }) => `calc(${sizeConfig.container.height} * 0.8)`};
      width: ${({ sizeConfig }) => `calc(${sizeConfig.container.width} * 0.8)`};
    }
    
    .hourglassContainer {
      top: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.top} * 0.8)`};
      left: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.left} * 0.8)`};
      width: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.width} * 0.8)`};
      height: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.height} * 0.8)`};
    }
  }

  @media (max-width: 480px) {
    .hourglassBackground {
      height: ${({ sizeConfig }) => `calc(${sizeConfig.container.height} * 0.6)`};
      width: ${({ sizeConfig }) => `calc(${sizeConfig.container.width} * 0.6)`};
    }
    
    .hourglassContainer {
      top: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.top} * 0.6)`};
      left: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.left} * 0.6)`};
      width: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.width} * 0.6)`};
      height: ${({ sizeConfig }) => `calc(${sizeConfig.hourglass.height} * 0.6)`};
    }
    
    .loader-text {
      font-size: 12px;
      margin-top: 12px;
    }
  }
`;

export default Loader;