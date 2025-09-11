import React from 'react';
import { Box } from '@mui/material';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';

const Rating = ({ value, onChange, readOnly = false }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= value) {
      stars.push(<Star key={i} onClick={() => !readOnly && typeof onChange === 'function' && onChange(i)} />);
    } else if (i === Math.ceil(value) && !Number.isInteger(value)) {
      stars.push(<StarHalf key={i} />);
    } else {
      stars.push(<StarBorder key={i} onClick={() => !readOnly && typeof onChange === 'function' && onChange(i)} />);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        color: 'secondary.main',
        cursor: readOnly ? 'default' : 'pointer',
      }}
    >
      {stars}
    </Box>
  );
};

export default Rating;