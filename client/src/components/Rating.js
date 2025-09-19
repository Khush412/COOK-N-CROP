import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';

const Rating = ({ value, onChange, readOnly = false, size = 'inherit' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        color: 'secondary.main',
      }}
    >
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
          return <Box key={starValue} sx={{ display: 'flex' }}>{starIcon}</Box>;
        }

        return (
          <Tooltip title={`${starValue} Star${starValue > 1 ? 's' : ''}`} key={starValue}>
            <IconButton
              onClick={() => typeof onChange === 'function' && onChange(starValue)}
              sx={{ p: 0.2, color: 'inherit' }}
              aria-label={`Rate ${starValue} star`}
            >{starIcon}</IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default Rating;