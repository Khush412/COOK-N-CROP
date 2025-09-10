import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Message as MessageIcon,
} from "@mui/icons-material";

import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function Community() {
  const theme = useTheme();

  const communityStats = [
    { label: "Food Lovers", value: "2,847", icon: <PeopleIcon />, color: theme.palette.primary.main },
    { label: "Recipes Shared", value: "1,234", icon: <MenuBookIcon />, color: theme.palette.secondary.main },
    { label: "Local Farmers", value: "150+", icon: <LocalFloristIcon />, color: theme.palette.success.main },
    { label: "Discussions", value: "3,456", icon: <MessageIcon />, color: theme.palette.info.main },
  ];

  const recentPosts = [
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "S",
      title: "My secret to the perfect sourdough bread!",
      content: "After many attempts, I've finally perfected my sourdough recipe. The key is using fresh, locally milled flour...",
      tags: ["Baking", "Recipes"],
      time: "2 hours ago",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: "Farmer Mike",
      avatar: "FM",
      title: "This week's harvest: Sweet corn and heirloom tomatoes",
      content: "The weather has been perfect! Come grab some of the sweetest corn you'll ever taste at the marketplace this weekend.",
      tags: ["Harvest", "Local Produce"],
      time: "5 hours ago",
      likes: 18,
      comments: 12,
    },
    {
      id: 3,
      author: "Chef Emily",
      avatar: "CE",
      title: "Quick & Healthy Weeknight Dinner Ideas",
      content: "Struggling with what to cook after a long day? Here are three of my go-to recipes that take less than 30 minutes.",
      tags: ["Quick Meals", "Healthy"],
      time: "1 day ago",
      likes: 31,
      comments: 15,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cook-N-Crop Community
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Connect with food lovers, share recipes, and get tips from local farmers and chefs.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {communityStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                  border: `1px solid ${stat.color}30`,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${stat.color}25`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Community Posts */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
            Recent Community Posts
          </Typography>
          
          <Grid container spacing={3}>
            {recentPosts.map((post) => (
              <Grid item xs={12} md={6} lg={4} key={post.id}>
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        mr: 2,
                        fontWeight: 600,
                      }}
                    >
                      {post.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {post.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {post.time}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                    {post.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.content}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {post.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.primary.main + "20",
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        👍 {post.likes} likes
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        💬 {post.comments} comments
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined">
                      Read More
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
            border: `1px solid ${theme.palette.primary.main}30`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
            Join the Conversation
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, maxWidth: 500, mx: "auto" }}>
            Share your favorite recipes, ask for cooking advice, and connect with other foodies in our growing community.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Join Community
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
