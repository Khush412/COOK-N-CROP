import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Typography, Box, Divider, Button, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const NotificationItem = ({ notification, handleClose, onMarkRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkRead(notification._id);
    handleClose();
    navigate(`/post/${notification.post._id}`);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'reply':
        return <ReplyIcon color="primary" />;
      case 'post_upvote':
      case 'comment_upvote':
        return <ThumbUpIcon color="secondary" />;
      default:
        return null;
    }
  };

  const getText = () => {
    switch (notification.type) {
      case 'reply':
        return (
          <>
            <strong>{notification.sender.username}</strong> replied to your comment on "
            {notification.post.title}"
          </>
        );
      case 'post_upvote':
        return (
          <>
            <strong>{notification.sender.username}</strong> liked your post "
            {notification.post.title}"
          </>
        );
      case 'comment_upvote':
        return (
          <>
            <strong>{notification.sender.username}</strong> liked your comment on "
            {notification.post.title}"
          </>
        );
      default:
        return 'New notification';
    }
  };

  return (
    <MenuItem
      onClick={handleClick}
      sx={{
        whiteSpace: 'normal',
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        alignItems: 'flex-start',
        py: 1.5,
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>{getIcon()}</ListItemIcon>
      <ListItemText
        primary={<Typography variant="body2">{getText()}</Typography>}
        secondary={
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </Typography>
        }
      />
    </MenuItem>
  );
};

const NotificationsMenu = ({ anchorEl, open, handleClose, notifications, onMarkRead, onMarkAllRead }) => {
  const theme = useTheme();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      disableScrollLock={true}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
          mt: 1.5,
          overflow: 'auto',
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(12px)",
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 10px, rgba(0,0,0,0.12) 0px 0px 5px",
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div">
          Notifications
        </Typography>
        {notifications.length > 0 && (
          <Button size="small" onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            handleClose={handleClose}
            onMarkRead={onMarkRead}
          />
        ))
      ) : (
        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          You have no new notifications.
        </Typography>
      )}
    </Menu>
  );
};

export default NotificationsMenu;