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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    ${(props) => props.$fullScreen && `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
    `}
  }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    height: ${p => {
      if (!p.$containerHeight) return '80px';
      const value = parseInt(p.$containerHeight);
      return value > 80 ? '80px' : p.$containerHeight;
    }};
    width: ${p => {
      if (!p.$containerWidth) return '80px';
      const value = parseInt(p.$containerWidth);
      return value > 80 ? '80px' : p.$containerWidth;
    }};
  }
  
  @media (max-width: 480px) {
    height: ${p => {
      if (!p.$containerHeight) return '60px';
      const value = parseInt(p.$containerHeight);
      return value > 60 ? '60px' : p.$containerHeight;
    }};
    width: ${p => {
      if (!p.$containerWidth) return '60px';
      const value = parseInt(p.$containerWidth);
      return value > 60 ? '60px' : p.$containerWidth;
    }};
  }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    top: ${p => {
      if (!p.$top) return '18px';
      const value = parseInt(p.$top);
      return value > 18 ? '18px' : p.$top;
    }};
    left: ${p => {
      if (!p.$left) return '24px';
      const value = parseInt(p.$left);
      return value > 24 ? '24px' : p.$left;
    }};
    width: ${p => {
      if (!p.$width) return '30px';
      const value = parseInt(p.$width);
      return value > 30 ? '30px' : p.$width;
    }};
    height: ${p => {
      if (!p.$height) return '42px';
      const value = parseInt(p.$height);
      return value > 42 ? '42px' : p.$height;
    }};
  }
  
  @media (max-width: 480px) {
    top: ${p => {
      if (!p.$top) return '12px';
      const value = parseInt(p.$top);
      return value > 12 ? '12px' : p.$top;
    }};
    left: ${p => {
      if (!p.$left) return '16px';
      const value = parseInt(p.$left);
      return value > 16 ? '16px' : p.$left;
    }};
    width: ${p => {
      if (!p.$width) return '20px';
      const value = parseInt(p.$width);
      return value > 20 ? '20px' : p.$width;
    }};
    height: ${p => {
      if (!p.$height) return '28px';
      const value = parseInt(p.$height);
      return value > 28 ? '28px' : p.$height;
    }};
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    &:before,
    &:after {
      top: ${p => `${(parseInt(p.$height) || 42) * 0.46}px`};
      width: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      height: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
    }
    
    &:before {
      left: ${p => `${(parseInt(p.$width) || 30) * 0.3}px`};
    }
    
    &:after {
      left: ${p => `${(parseInt(p.$width) || 30) * 0.58}px`};
    }
  }
  
  @media (max-width: 480px) {
    &:before,
    &:after {
      top: ${p => `${(parseInt(p.$height) || 28) * 0.46}px`};
      width: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      height: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
    }
    
    &:before {
      left: ${p => `${(parseInt(p.$width) || 20) * 0.3}px`};
    }
    
    &:after {
      left: ${p => `${(parseInt(p.$width) || 20) * 0.58}px`};
    }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    &:before {
      top: ${p => `-${(parseInt(p.$height) || 42) * 0.35}px`};
      height: ${p => `${(parseInt(p.$height) || 42) * 0.07}px`};
    }
    
    &:after {
      top: ${p => `-${(parseInt(p.$height) || 42) * 0.28}px`};
      height: ${p => `${(parseInt(p.$height) || 42) * 0.14}px`};
    }
  }
  
  @media (max-width: 480px) {
    &:before {
      top: ${p => `-${(parseInt(p.$height) || 28) * 0.35}px`};
      height: ${p => `${(parseInt(p.$height) || 28) * 0.07}px`};
    }
    
    &:after {
      top: ${p => `-${(parseInt(p.$height) || 28) * 0.28}px`};
      height: ${p => `${(parseInt(p.$height) || 28) * 0.14}px`};
    }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    &:before {
      bottom: ${p => `-${(parseInt(p.$height) || 42) * 0.35}px`};
      height: ${p => `${(parseInt(p.$height) || 42) * 0.07}px`};
    }
    
    &:after {
      bottom: ${p => `-${(parseInt(p.$height) || 42) * 0.28}px`};
      height: ${p => `${(parseInt(p.$height) || 42) * 0.14}px`};
    }
  }
  
  @media (max-width: 480px) {
    &:before {
      bottom: ${p => `-${(parseInt(p.$height) || 28) * 0.35}px`};
      height: ${p => `${(parseInt(p.$height) || 28) * 0.07}px`};
    }
    
    &:after {
      bottom: ${p => `-${(parseInt(p.$height) || 28) * 0.28}px`};
      height: ${p => `${(parseInt(p.$height) || 28) * 0.14}px`};
    }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    top: ${p => `-${(parseInt(p.$height) || 42) * 0.23}px`};
    left: ${p => `${(parseInt(p.$width) || 30) * 0.06}px`};
    width: ${p => `${(parseInt(p.$width) || 30) * 0.88}px`};
    height: ${p => `${(parseInt(p.$width) || 30) * 0.88}px`};
  }
  
  @media (max-width: 480px) {
    top: ${p => `-${(parseInt(p.$height) || 28) * 0.23}px`};
    left: ${p => `${(parseInt(p.$width) || 20) * 0.06}px`};
    width: ${p => `${(parseInt(p.$width) || 20) * 0.88}px`};
    height: ${p => `${(parseInt(p.$width) || 20) * 0.88}px`};
  }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    top: ${p => `${(parseInt(p.$height) || 42) * 0.46}px`};
    left: ${p => `${(parseInt(p.$width) || 30) * 0.4}px`};
    width: ${p => `${(parseInt(p.$width) || 30) * 0.2}px`};
    height: ${p => `${(parseInt(p.$height) || 42) * 0.085}px`};
    
    &:before,
    &:after {
      left: ${p => `-${(parseInt(p.$width) || 30) * 0.34}px`};
      width: ${p => `${(parseInt(p.$width) || 30) * 0.88}px`};
      height: ${p => `${(parseInt(p.$height) || 42) * 0.4}px`};
    }
    
    &:before {
      top: ${p => `-${(parseInt(p.$height) || 42) * 0.385}px`};
      border-radius: 0 0 ${p => `${(parseInt(p.$width) || 30) * 0.5}px`} ${p => `${(parseInt(p.$width) || 30) * 0.5}px`};
    }
    
    &:after {
      bottom: ${p => `-${(parseInt(p.$height) || 42) * 0.385}px`};
      border-radius: ${p => `${(parseInt(p.$width) || 30) * 0.5}px`} ${p => `${(parseInt(p.$width) || 30) * 0.5}px`} 0 0;
    }
  }
  
  @media (max-width: 480px) {
    top: ${p => `${(parseInt(p.$height) || 28) * 0.46}px`};
    left: ${p => `${(parseInt(p.$width) || 20) * 0.4}px`};
    width: ${p => `${(parseInt(p.$width) || 20) * 0.2}px`};
    height: ${p => `${(parseInt(p.$height) || 28) * 0.085}px`};
    
    &:before,
    &:after {
      left: ${p => `-${(parseInt(p.$width) || 20) * 0.34}px`};
      width: ${p => `${(parseInt(p.$width) || 20) * 0.88}px`};
      height: ${p => `${(parseInt(p.$height) || 28) * 0.4}px`};
    }
    
    &:before {
      top: ${p => `-${(parseInt(p.$height) || 28) * 0.385}px`};
      border-radius: 0 0 ${p => `${(parseInt(p.$width) || 20) * 0.5}px`} ${p => `${(parseInt(p.$width) || 20) * 0.5}px`};
    }
    
    &:after {
      bottom: ${p => `-${(parseInt(p.$height) || 28) * 0.385}px`};
      border-radius: ${p => `${(parseInt(p.$width) || 20) * 0.5}px`} ${p => `${(parseInt(p.$width) || 20) * 0.5}px`} 0 0;
    }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    &:before {
      left: ${p => `${(parseInt(p.$width) || 30) * 0.48}px`};
      width: ${p => `${(parseInt(p.$width) || 30) * 0.06}px`};
    }
    
    &:after {
      top: ${p => `${(parseInt(p.$height) || 42) * 0.515}px`};
      left: ${p => `${(parseInt(p.$width) || 30) * 0.38}px`};
      border-left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`} solid transparent;
      border-right: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`} solid transparent;
      border-bottom: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`} solid #fff;
    }
  }
  
  @media (max-width: 480px) {
    &:before {
      left: ${p => `${(parseInt(p.$width) || 20) * 0.48}px`};
      width: ${p => `${(parseInt(p.$width) || 20) * 0.06}px`};
    }
    
    &:after {
      top: ${p => `${(parseInt(p.$height) || 28) * 0.515}px`};
      left: ${p => `${(parseInt(p.$width) || 20) * 0.38}px`};
      border-left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`} solid transparent;
      border-right: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`} solid transparent;
      border-bottom: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`} solid #fff;
    }
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
    
    // Mobile responsive adjustments
    @media (max-width: 768px) {
      0% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 42) * 0.5}px`};
      }
      50% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 42) * 0.64}px`};
      }
      60% {
        height: ${p => `${(parseInt(p.$height) || 42) * 0.5}px`};
        top: ${p => `${(parseInt(p.$height) || 42) * 0.115}px`};
      }
      85% {
        height: ${p => `${(parseInt(p.$height) || 42) * 0.5}px`};
        top: ${p => `${(parseInt(p.$height) || 42) * 0.115}px`};
      }
      100% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 42) * 0.115}px`};
      }
    }
    
    @media (max-width: 480px) {
      0% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 28) * 0.5}px`};
      }
      50% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 28) * 0.64}px`};
      }
      60% {
        height: ${p => `${(parseInt(p.$height) || 28) * 0.5}px`};
        top: ${p => `${(parseInt(p.$height) || 28) * 0.115}px`};
      }
      85% {
        height: ${p => `${(parseInt(p.$height) || 28) * 0.5}px`};
        top: ${p => `${(parseInt(p.$height) || 28) * 0.115}px`};
      }
      100% {
        height: 0;
        top: ${p => `${(parseInt(p.$height) || 28) * 0.115}px`};
      }
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
  
  // Mobile responsive adjustments
  @media (max-width: 768px) {
    &:before {
      top: ${p => `${(parseInt(p.$height) || 42) * 0.115}px`};
      width: ${p => `${(parseInt(p.$width) || 30) * 0.78}px`};
      border-radius: ${p => `${(parseInt(p.$width) || 30) * 0.06}px`} ${p => `${(parseInt(p.$width) || 30) * 0.06}px`} ${p => `${(parseInt(p.$width) || 30) * 0.58}px`} ${p => `${(parseInt(p.$width) || 30) * 0.58}px`};
    }
    
    &:after {
      border-radius: ${p => `${(parseInt(p.$width) || 30) * 0.58}px`} ${p => `${(parseInt(p.$width) || 30) * 0.58}px`} ${p => `${(parseInt(p.$width) || 30) * 0.06}px`} ${p => `${(parseInt(p.$width) || 30) * 0.06}px`};
    }
  }
  
  @media (max-width: 480px) {
    &:before {
      top: ${p => `${(parseInt(p.$height) || 28) * 0.115}px`};
      width: ${p => `${(parseInt(p.$width) || 20) * 0.78}px`};
      border-radius: ${p => `${(parseInt(p.$width) || 20) * 0.06}px`} ${p => `${(parseInt(p.$width) || 20) * 0.06}px`} ${p => `${(parseInt(p.$width) || 20) * 0.58}px`} ${p => `${(parseInt(p.$width) || 20) * 0.58}px`};
    }
    
    &:after {
      border-radius: ${p => `${(parseInt(p.$width) || 20) * 0.58}px`} ${p => `${(parseInt(p.$width) || 20) * 0.58}px`} ${p => `${(parseInt(p.$width) || 20) * 0.06}px`} ${p => `${(parseInt(p.$width) || 20) * 0.06}px`};
    }
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
    
    // Mobile responsive adjustments
    @media (max-width: 768px) {
      100% {
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
      }
    }
    
    @media (max-width: 480px) {
      100% {
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
      }
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
    
    // Mobile responsive adjustments
    @media (max-width: 768px) {
      0% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 30) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      }
      1% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 30) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      }
      24% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 30) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      }
      25% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.585}px`};
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 30) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      }
      50% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.585}px`};
        height: ${p => `${(parseInt(p.$height) || 42) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 30) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.12}px`};
      }
      90% {
        top: ${p => `${(parseInt(p.$height) || 42) * 0.585}px`};
        height: 0;
        width: ${p => `${(parseInt(p.$width) || 30) * 0.2}px`};
        left: ${p => `${(parseInt(p.$width) || 30) * 0.4}px`};
      }
    }
    
    @media (max-width: 480px) {
      0% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 20) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      }
      1% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 20) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      }
      24% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.64}px`};
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 20) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      }
      25% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.585}px`};
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 20) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      }
      50% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.585}px`};
        height: ${p => `${(parseInt(p.$height) || 28) * 0.24}px`};
        width: ${p => `${(parseInt(p.$width) || 20) * 0.76}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.12}px`};
      }
      90% {
        top: ${p => `${(parseInt(p.$height) || 28) * 0.585}px`};
        height: 0;
        width: ${p => `${(parseInt(p.$width) || 20) * 0.2}px`};
        left: ${p => `${(parseInt(p.$width) || 20) * 0.4}px`};
      }
    }
  }
`;

const LoaderText = styled.div`
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.palette.text.primary};
  text-align: center;
  
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    margin-top: 8px;
    font-size: 10px;
  }
`;

const Loader = ({ size = 'medium', color, text, fullScreen = false }) => {
  const theme = useTheme();
  const loaderColor = color || theme.palette.primary.main;

  // Size configuration with proper fallbacks and mobile adjustments
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

  // Mobile responsive size adjustments
  const mobileSizeConfig = {
    tiny: { 
      container: { width: '30px', height: '30px' },
      hourglass: { width: '12px', height: '16px', top: '7px', left: '9px' }
    },
    small: { 
      container: { width: '40px', height: '40px' },
      hourglass: { width: '18px', height: '24px', top: '9px', left: '12px' }
    },
    medium: { 
      container: { width: '60px', height: '60px' },
      hourglass: { width: '28px', height: '38px', top: '12px', left: '16px' }
    },
    large: { 
      container: { width: '80px', height: '80px' },
      hourglass: { width: '40px', height: '54px', top: '18px', left: '22px' }
    },
    xlarge: { 
      container: { width: '100px', height: '100px' },
      hourglass: { width: '50px', height: '68px', top: '22px', left: '25px' }
    }
  };

  // Extra small mobile adjustments
  const xsSizeConfig = {
    tiny: { 
      container: { width: '20px', height: '20px' },
      hourglass: { width: '8px', height: '10px', top: '5px', left: '6px' }
    },
    small: { 
      container: { width: '30px', height: '30px' },
      hourglass: { width: '12px', height: '16px', top: '7px', left: '9px' }
    },
    medium: { 
      container: { width: '40px', height: '40px' },
      hourglass: { width: '20px', height: '26px', top: '8px', left: '10px' }
    },
    large: { 
      container: { width: '50px', height: '50px' },
      hourglass: { width: '26px', height: '34px', top: '10px', left: '12px' }
    },
    xlarge: { 
      container: { width: '60px', height: '60px' },
      hourglass: { width: '32px', height: '42px', top: '12px', left: '14px' }
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const mobileConfig = mobileSizeConfig[size] || mobileSizeConfig.medium;
  const xsConfig = xsSizeConfig[size] || xsSizeConfig.medium;

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