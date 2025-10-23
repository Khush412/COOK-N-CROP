import React, { useState, useRef, useEffect } from 'react';
import { TextField, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import userService from '../services/userService';

const MentionSuggestionBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1000,
  maxHeight: '200px',
  overflow: 'auto',
  width: '300px',
  marginTop: '4px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .mention': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& .hashtag': {
    color: theme.palette.secondary.main,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

/**
 * RichTextInput component with @mention and #hashtag support
 * 
 * @param {Object} props
 * @param {string} props.value - Current text value
 * @param {function} props.onChange - Callback when text changes
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.multiline - Enable multiline mode
 * @param {number} props.rows - Number of rows (if multiline)
 * @param {number} props.maxRows - Maximum rows (if multiline)
 * @param {string} props.label - Input label
 * @param {boolean} props.fullWidth - Full width mode
 */
const RichTextInput = ({
  value = '',
  onChange,
  placeholder = 'Type @ to mention or # for hashtags...',
  multiline = true,
  rows = 4,
  maxRows = 10,
  label = '',
  fullWidth = true,
  ...otherProps
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionType, setSuggestionType] = useState(null); // 'mention' or 'hashtag'
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  // Extract mentions and hashtags for display
  const [extractedData, setExtractedData] = useState({ mentions: [], hashtags: [] });

  useEffect(() => {
    // Extract mentions and hashtags from value
    const mentionRegex = /@([a-zA-Z0-9_]{3,30})\b/g;
    const hashtagRegex = /#([a-zA-Z0-9_]{2,50})\b/g;
    
    const mentions = [];
    const hashtags = [];
    
    let match;
    while ((match = mentionRegex.exec(value)) !== null) {
      mentions.push(match[1]);
    }
    while ((match = hashtagRegex.exec(value)) !== null) {
      hashtags.push(match[1]);
    }
    
    setExtractedData({
      mentions: [...new Set(mentions)],
      hashtags: [...new Set(hashtags)],
    });
  }, [value]);

  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(e);
    setCursorPosition(cursorPos);

    // Check if user is typing @ or #
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    const lastSpaceIndex = Math.max(
      textBeforeCursor.lastIndexOf(' '),
      textBeforeCursor.lastIndexOf('\n')
    );

    // Determine if we're in a mention or hashtag context
    if (lastAtIndex > lastSpaceIndex && lastAtIndex !== -1) {
      // Mention context
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ') && query.length <= 30) {
        setSuggestionType('mention');
        setSearchQuery(query);
        try {
          // Search for users - now returns array directly
          const users = await userService.searchUsers(query);
          console.log('Found users:', users);
          setSuggestions(users);
          setShowSuggestions(users.length > 0);
        } catch (error) {
          console.error('Failed to fetch user suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else if (lastHashIndex > lastSpaceIndex && lastHashIndex !== -1) {
      // Hashtag context
      const query = textBeforeCursor.slice(lastHashIndex + 1);
      if (query.length > 0 && !query.includes(' ') && query.length <= 50) {
        setSuggestionType('hashtag');
        setSearchQuery(query);
        // For hashtags, show trending or recent hashtags (you can fetch from API)
        // For now, we'll just show the typed hashtag as a suggestion
        setSuggestions([{ hashtag: query }]);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    let newValue;
    if (suggestionType === 'mention') {
      // Replace @query with @username
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const beforeMention = textBeforeCursor.slice(0, lastAtIndex);
      newValue = `${beforeMention}@${suggestion.username} ${textAfterCursor}`;
    } else if (suggestionType === 'hashtag') {
      // Replace #query with #hashtag
      const lastHashIndex = textBeforeCursor.lastIndexOf('#');
      const beforeHashtag = textBeforeCursor.slice(0, lastHashIndex);
      newValue = `${beforeHashtag}#${suggestion.hashtag} ${textAfterCursor}`;
    }

    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && showSuggestions) {
      setShowSuggestions(false);
    }
  };

  return (
    <Box position="relative" width={fullWidth ? '100%' : 'auto'}>
      <StyledTextField
        inputRef={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        maxRows={maxRows}
        label={label}
        fullWidth={fullWidth}
        variant="outlined"
        {...otherProps}
      />
      
      {/* Show extracted mentions and hashtags below input */}
      {(extractedData.mentions.length > 0 || extractedData.hashtags.length > 0) && (
        <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
          {extractedData.mentions.map((mention, idx) => (
            <Chip
              key={`mention-${idx}`}
              label={`@${mention}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          {extractedData.hashtags.map((hashtag, idx) => (
            <Chip
              key={`hashtag-${idx}`}
              label={`#${hashtag}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <MentionSuggestionBox>
          <List dense>
            {suggestionType === 'mention' && suggestions.map((user, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(user)}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={
                      user.profilePic && user.profilePic.startsWith('http') 
                        ? user.profilePic 
                        : user.profilePic 
                        ? `${process.env.REACT_APP_API_URL}${user.profilePic}` 
                        : undefined
                    } 
                    alt={user.username}
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`@${user.username}`}
                  secondary={user.bio?.slice(0, 50)}
                />
              </ListItem>
            ))}
            {suggestionType === 'hashtag' && suggestions.map((tag, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(tag)}
              >
                <ListItemText
                  primary={`#${tag.hashtag}`}
                  secondary={tag.count ? `${tag.count} posts` : 'New hashtag'}
                />
              </ListItem>
            ))}
          </List>
        </MentionSuggestionBox>
      )}
    </Box>
  );
};

export default RichTextInput;
