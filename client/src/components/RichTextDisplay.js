import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledContent = styled(Box)(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '& .mention': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1000,
    pointerEvents: 'auto',
    display: 'inline',
    transition: 'all 0.2s ease',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.palette.primary.dark,
    },
  },
  '& .hashtag': {
    color: theme.palette.secondary.main,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1000,
    pointerEvents: 'auto',
    display: 'inline',
    transition: 'all 0.2s ease',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.palette.secondary.dark,
    },
  },
}));

/**
 * Convert text with @mentions and #hashtags to clickable links
 * @param {string} text - The text to convert
 * @returns {Array} - Array of React elements
 */
const parseTextWithMentionsAndHashtags = (text) => {
  if (!text) return [];

  // Combined regex to match both mentions and hashtags
  const combinedRegex = /(@[a-zA-Z0-9_]{3,30}\b)|(#[a-zA-Z0-9_]{2,50}\b)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the matched mention or hashtag
    if (match[1]) {
      // It's a mention
      const username = match[1].slice(1); // Remove @
      parts.push({
        type: 'mention',
        content: match[1],
        username,
      });
    } else if (match[2]) {
      // It's a hashtag
      const hashtag = match[2].slice(1); // Remove #
      parts.push({
        type: 'hashtag',
        content: match[2],
        hashtag,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

/**
 * RichTextDisplay component - Renders text with clickable mentions and hashtags
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display
 * @param {Object} props.sx - Additional styles
 */
const RichTextDisplay = ({ text, sx = {}, ...otherProps }) => {
  const parts = parseTextWithMentionsAndHashtags(text);

  return (
    <StyledContent sx={sx} {...otherProps}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <Link
              key={index}
              to={`/user/${part.username}`}
              className="mention"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </Link>
          );
        } else if (part.type === 'hashtag') {
          return (
            <Link
              key={index}
              to={`/community?search=%23${part.hashtag}`}
              className="hashtag"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </Link>
          );
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </StyledContent>
  );
};

export default RichTextDisplay;
