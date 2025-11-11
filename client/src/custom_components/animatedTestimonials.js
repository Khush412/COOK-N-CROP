import React from 'react';
import { Box, Paper, Avatar, Typography, useTheme } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

// Simple utility function to join class names (replacing the cn function)
const cn = (...classes) => classes.filter(Boolean).join(' ');

const AnimatedCanopy = ({
  children,
  vertical = false,
  repeat = 4,
  pauseOnHover = false,
  reverse = false,
  className,
  applyMask = true,
  speed = '25s',
  ...props
}) => (
  <Box
    {...props}
    className={cn(
      "group relative flex h-full w-full overflow-hidden p-2 [--gap:12px] [gap:var(--gap)]",
      vertical ? "flex-col" : "flex-row",
      className
    )}
    sx={{
      '--gap': '12px',
      gap: 'var(--gap)',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      padding: '8px',
      position: 'relative',
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
    }}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <Box
        key={`item-${index}`}
        className={cn("flex shrink-0 [gap:var(--gap)]", {
          "group-hover:[animation-play-state:paused]": pauseOnHover,
          "[animation-direction:reverse]": reverse,
        })}
        sx={{
          display: 'flex',
          flexShrink: 0,
          gap: 'var(--gap)',
          animation: !vertical 
            ? `canopy-horizontal ${speed} linear infinite ${reverse ? 'reverse' : 'normal'}` 
            : `canopy-vertical ${speed} linear infinite ${reverse ? 'reverse' : 'normal'}`,
        }}
      >
        {children}
      </Box>
    ))}

    {applyMask && (
      <Box
        className={cn(
          "pointer-events-none absolute inset-0 z-10 h-full w-full from-white/50 from-5% via-transparent via-50% to-white/50 to-95% dark:from-gray-800/50 dark:via-transparent dark:to-gray-800/50",
          vertical ? "bg-gradient-to-b" : "bg-gradient-to-r"
        )}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          height: '100%',
          width: '100%',
          background: vertical 
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.5) 5%, transparent 50%, rgba(255,255,255,0.5) 95%)'
            : 'linear-gradient(to right, rgba(255,255,255,0.5) 5%, transparent 50%, rgba(255,255,255,0.5) 95%)',
          pointerEvents: 'none',
        }}
      />
    )}
  </Box>
);

const TestimonialCard = ({ testimonial, className }) => {
  const theme = useTheme();
  
  return (
    <Paper
      className={cn(
        "group mx-2 flex h-32 w-80 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-transparent p-3 transition-all hover:border-blue-400 hover:shadow-[0_0_10px_#60a5fa] dark:hover:border-blue-400",
        className
      )}
      sx={{
        height: '180px',
        width: '300px',
        flexShrink: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid transparent',
        padding: '16px',
        margin: '0 10px',
        transition: 'all 0.3s ease',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[4],
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: theme.palette.secondary.main,
          boxShadow: `0 0 12px ${theme.palette.secondary.main}`,
          transform: 'translateY(-3px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: 1.5 }}>
        <Avatar 
          src={testimonial.avatar} 
          alt={testimonial.author} 
          sx={{ 
            width: '48px', 
            height: '48px', 
            objectFit: 'cover',
            border: `2px solid ${theme.palette.divider}`
          }} 
        />
        <Box sx={{ flex: 1 }}>
          <Typography 
            sx={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: theme.palette.text.primary,
              mb: 0.2
            }}
          >
            {testimonial.author}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: '0.85rem', 
              color: theme.palette.text.secondary 
            }}
          >
            {testimonial.role}
          </Typography>
        </Box>
      </Box>

      <Typography 
        sx={{ 
          fontSize: '0.95rem', 
          color: theme.palette.text.primary,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
          position: 'relative',
          pl: 1.5,
          lineHeight: 1.4,
          '&:before': {
            content: '"\\201C"',
            position: 'absolute',
            left: -6,
            top: -8,
            fontSize: '2rem',
            color: theme.palette.secondary.main,
            opacity: 0.5,
            fontFamily: 'serif',
          }
        }}
      >
        {testimonial.quote}
      </Typography>
    </Paper>
  );
};

export const AnimatedTestimonials = ({ data, className, cardClassName }) => {
  // Split data into three unique sets to avoid repetition
  const rowCount = 3;
  const itemsPerRow = Math.ceil(data.length / rowCount);
  
  // Create three arrays with different slices of the data
  const row1 = data.slice(0, itemsPerRow);
  const row2 = data.slice(itemsPerRow, itemsPerRow * 2);
  const row3 = data.slice(itemsPerRow * 2, itemsPerRow * 3);
  
  // If we don't have enough data for three unique rows, duplicate some items
  if (row2.length === 0) {
    row2.push(...data.slice(0, Math.min(itemsPerRow, data.length)));
  }
  if (row3.length === 0) {
    row3.push(...data.slice(0, Math.min(itemsPerRow, data.length)));
  }
  
  return (
    <Box className={cn("w-full overflow-x-hidden py-4", className)} sx={{ width: '100%', overflowX: 'hidden', py: 4 }}>
      <AnimatedCanopy
        key={`canopy-0`}
        reverse={false}
        pauseOnHover={true}
        applyMask={false}
        repeat={3}
        speed="35s"
        sx={{ mb: 2 }}
      >
        {row1.map((testimonial) => (
          <TestimonialCard
            key={`${testimonial.author}-0`}
            testimonial={testimonial}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
      
      <AnimatedCanopy
        key={`canopy-1`}
        reverse={true}
        pauseOnHover={true}
        applyMask={false}
        repeat={3}
        speed="35s"
        sx={{ mb: 2 }}
      >
        {row2.map((testimonial) => (
          <TestimonialCard
            key={`${testimonial.author}-1`}
            testimonial={testimonial}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
      
      <AnimatedCanopy
        key={`canopy-2`}
        reverse={false}
        pauseOnHover={true}
        applyMask={false}
        repeat={3}
        speed="25s"
      >
        {row3.map((testimonial) => (
          <TestimonialCard
            key={`${testimonial.author}-2`}
            testimonial={testimonial}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
    </Box>
  );
};

// Add CSS keyframes for animations
const styles = `
  @keyframes canopy-horizontal {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  
  @keyframes canopy-vertical {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
  }
  
  .animate-canopy-horizontal {
    animation: canopy-horizontal var(--duration) linear infinite;
  }
  
  .animate-canopy-vertical {
    animation: canopy-vertical var(--duration) linear infinite;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);