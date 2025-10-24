import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Rating = ({ value, onChange, readOnly = false, size = 'inherit', label }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        color: 'secondary.main',
        alignItems: 'center',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {label && (
        <Typography 
          variant="body2" 
          sx={{ 
            mr: 1, 
            fontFamily: theme.typography.fontFamily,
            fontWeight: 'medium'
          }}
        >
          {label}
        </Typography>
      )}
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const starIcon =
          value >= starValue ? (
            <Star fontSize={size} />
          ) : value >= starValue - 0.5 ? (
            <StarHalf fontSize={size} />
          ) : (
            <StarBorder fontSize={size} />
          );

        if (readOnly) {
          return <Box key={starValue} sx={{ display: 'flex', fontFamily: theme.typography.fontFamily }}>{starIcon}</Box>;
        }

        return (
          <Tooltip title={`${starValue} Star${starValue > 1 ? 's' : ''}`} key={starValue}>
            <IconButton
              onClick={() => typeof onChange === 'function' && onChange(starValue)}
              sx={{ p: 0.2, color: 'inherit', fontFamily: theme.typography.fontFamily }}
              aria-label={`Rate ${starValue} star`}
            >{starIcon}</IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default Rating;