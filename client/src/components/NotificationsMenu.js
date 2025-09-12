import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, Button, Divider, styled, alpha } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 360,
    maxHeight: 400,
    borderRadius: 16,
    marginTop: theme.spacing(1.5),
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(12px)',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 10px, rgba(0,0,0,0.12) 0px 0px 5px',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const NotificationsMenu = ({ anchorEl, open, handleClose, notifications, onMarkRead, onMarkAllRead }) => {
  const navigate = useNavigate();
  const theme = useTheme();

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold">Notifications</Typography>
        <Button size="small" onClick={onMarkAllRead} disabled={notifications.every(n => n.isRead)}>
          Mark all as read
        </Button>
      </Box>
      <Divider />
      {notifications.length === 0 ? (
        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          You have no notifications.
        </Typography>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification._id}
            onClick={() => handleClick(notification)}
            sx={{
              backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
              borderBottom: `1px solid ${theme.palette.divider}`,
              whiteSpace: 'normal',
              py: 1.5,
            }}
          >
            <ListItemAvatar>
              <Avatar src={notification.sender?.profilePic} />
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="body2" component="span" dangerouslySetInnerHTML={{ __html: notification.message }} />}
              secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            />
          </MenuItem>
        ))
      )}
    </StyledMenu>
  );
};

export default NotificationsMenu;