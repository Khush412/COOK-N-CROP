import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SettingsIcon from '@mui/icons-material/Settings';

const VideoPlayer = ({ src, title, thumbnail, onPlay, onPause }) => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        if (onPause) onPause();
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        if (onPlay) onPlay();
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      if (newValue === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  const handleProgressChange = (event, newValue) => {
    if (videoRef.current) {
      const time = (newValue / 100) * duration;
      videoRef.current.currentTime = time;
      setProgress(newValue);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'black',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
      
      {/* Play/Pause overlay */}
      {!isPlaying && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <IconButton
            onClick={handlePlayPause}
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 1),
              },
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 40, color: 'white' }} />
          </IconButton>
        </Box>
      )}

      {/* Controls overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          transition: 'opacity 0.3s',
          opacity: showControls ? 1 : 0,
        }}
      >
        {/* Progress bar */}
        <Slider
          value={progress}
          onChange={handleProgressChange}
          aria-label="Video progress"
          sx={{
            mb: 1,
            '& .MuiSlider-thumb': {
              display: 'none',
            },
            '&:hover .MuiSlider-thumb': {
              display: 'block',
            },
          }}
        />
        
        {/* Control buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconButton onClick={handlePlayPause} size="small">
            {isPlaying ? (
              <PauseIcon sx={{ color: 'white' }} />
            ) : (
              <PlayArrowIcon sx={{ color: 'white' }} />
            )}
          </IconButton>
          
          <Typography variant="caption" sx={{ color: 'white', minWidth: 40 }}>
            {formatTime((progress / 100) * duration)}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton onClick={handleMuteToggle} size="small">
            {isMuted ? (
              <VolumeOffIcon sx={{ color: 'white' }} />
            ) : (
              <VolumeUpIcon sx={{ color: 'white' }} />
            )}
          </IconButton>
          
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            sx={{
              width: 80,
              mr: 1,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
            }}
          />
          
          <IconButton onClick={handleFullscreen} size="small">
            <FullscreenIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;