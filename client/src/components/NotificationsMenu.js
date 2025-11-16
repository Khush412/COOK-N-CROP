import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, Button, Divider, styled, alpha, useMediaQuery, useTheme } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '90vw',
    maxWidth: 380,
    maxHeight: 450,
    borderRadius: 16,
    marginTop: theme.spacing(1.5),
    background: alpha(theme.palette.background.paper, 0.85),
    backdropFilter: 'blur(12px)',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 10px, rgba(0,0,0,0.12) 0px 0px 5px',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    [theme.breakpoints.down('sm')]: {
      width: '95vw',
      maxWidth: '95vw',
      maxHeight: '70vh',
      borderRadius: 12,
      marginTop: theme.spacing(1),
    },
  },
}));

// New dedicated component for a single notification item
const NotificationItem = ({ notification, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <MenuItem
      onClick={() => onClick(notification)}
      sx={{
        alignItems: 'flex-start',
        backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
        borderBottom: `1px solid ${theme.palette.divider}`,
        whiteSpace: 'normal',
        py: isMobile ? 1 : 1.5,
        px: isMobile ? 1.5 : 2,
        '&:hover': {
          backgroundColor: notification.isRead ? alpha(theme.palette.action.hover, 0.04) : alpha(theme.palette.primary.main, 0.12),
        },
      }}
    >
      <ListItemAvatar sx={{ minWidth: isMobile ? 40 : 48, mt: 0.5 }}>
        <Avatar 
          src={notification.sender?.profilePic && notification.sender.profilePic.startsWith('http') ? notification.sender.profilePic : notification.sender?.profilePic ? `${process.env.REACT_APP_API_URL}${notification.sender.profilePic}` : undefined}
          sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              component="span"
              dangerouslySetInnerHTML={{ __html: notification.message }}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: notification.isRead ? 400 : 600, 
                pr: 1,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                whiteSpace: 'nowrap', 
                fontSize: isMobile ? '0.6rem' : '0.7rem', 
                ml: 1, 
                mt: '2px' 
              }}
            >
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
    </MenuItem>
  );
};

const NotificationsMenu = ({ anchorEl, open, handleClose, notifications, onMarkRead, onMarkAllRead }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (notification) => {
    handleClose();
    if (!notification.isRead) {
      onMarkRead(notification._id);
    }

    // Safely handle navigation based on notification data
    if (notification.link) {
      navigate(notification.link);
    } else if ((notification.type === 'upvote' || notification.type === 'comment') && notification.post?._id) {
      navigate(`/post/${notification.post._id}`);
    } else if (notification.type === 'follow' && notification.sender?.username) {
      navigate(`/user/${notification.sender.username}`);
    }
    // For other notifications without a link (like a simple broadcast), do nothing on click.
  };

  return (
    <StyledMenu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      disableScrollLock={true}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: isMobile ? 1.5 : 2,
        pb: isMobile ? 1 : 1.5
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          fontWeight="bold" 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            fontSize: isMobile ? '1.1rem' : '1.25rem'
          }}
        >
          Notifications
        </Typography>
        <Button
          size={isMobile ? "small" : "medium"}
          onClick={onMarkAllRead}
          disabled={notifications.every(n => n.isRead)}
          sx={{ 
            fontFamily: theme.typography.fontFamily, 
            borderRadius: '50px',
            fontSize: isMobile ? '0.7rem' : '0.875rem',
            py: isMobile ? 0.5 : 1,
            px: isMobile ? 1 : 2
          }}
        >
          Mark all as read
        </Button>
      </Box>
      <Divider />
      {notifications.length === 0 ? (
        <Box sx={{ p: isMobile ? 3 : 4, textAlign: 'center', color: 'text.secondary' }}>
          <NotificationsOffOutlinedIcon sx={{ fontSize: isMobile ? 36 : 48, mb: 1, color: 'grey.400' }} />
          <Typography 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            You have no notifications.
          </Typography>
        </Box>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onClick={handleClick}
          />
        ))
      )}
    </StyledMenu>
  );
};

export default NotificationsMenu;