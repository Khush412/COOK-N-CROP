import React from "react";
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
// Hero section image path
const HERO_IMG = "/images/hero.png";




// Features array with 6 features and icons
const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        width="48"
        height="48"
      >
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    title: "Shop Farm-Fresh Produce",
    description: "Browse our marketplace for the freshest fruits, vegetables, and exotic ingredients, all sourced locally.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        width="48"
        height="48"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: "Discover New Recipes",
    description: "Get inspired with a vast collection of recipes shared by our community, complete with ratings and tips.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        width="48"
        height="48"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    title: "Share Your Creations",
    description: "Upload your own recipes, share cooking tips, and showcase your culinary skills to fellow food enthusiasts.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        width="48"
        height="48"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"/>
      </svg>
    ),
    title: "Meal Planning Made Easy",
    description: "Organize your week with our intuitive meal planner and generate shopping lists in one click.",
  },
  {
    icon: (<svg
   xmlns="http://www.w3.org/2000/svg"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   viewBox="0 0 24 24"
   width="48"
   height="48"
>
<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
<circle cx="12" cy="7" r="4"/>
</svg>
),
    title: "Expert Cooking Tips",
    description: "Learn from the best with articles and tutorials from experienced chefs and nutritionists.",
  },
  {
    icon: (<svg
   xmlns="http://www.w3.org/2000/svg"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   viewBox="0 0 24 24"
   width="48"
   height="48"
>
<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
<circle cx="9" cy="7" r="4"/>
<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
</svg>
),
    title: "Join the Foodie Community",
    description: "Engage in discussions, join cooking challenges, and connect with others who share your passion for food.",
  },
];


// Texture URL from Transparent Textures
const TEXTURE_URL = "https://www.transparenttextures.com/patterns/paper-fibers.png";


export default function LandingPage() {
  const theme = useTheme();


  return (
    <Box
      sx={{
        fontFamily: theme.typography.fontFamily,
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage: `url(${TEXTURE_URL})`,
        backgroundRepeat: "repeat",
        backgroundBlendMode: "overlay",
        color: "text.primary",
        px: 2,
      }}
    >
      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{
          fontFamily: theme.typography.fontFamily,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          py: 12,
          px: 3,
        }}
      >
        <Box sx={{ fontFamily: theme.typography.fontFamily, flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: 24, md: 32 }, textTransform: "uppercase", fontFamily: theme.typography.fontFamily }}
          >
            Fresh Ingredients, Inspiring Recipes
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontFamily: theme.typography.fontFamily, mb: 5, maxWidth: 540 }}
          >
            Discover the best local produce and connect with a community of food lovers. Your journey to delicious and healthy meals starts here.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/register"
            sx={{
              fontFamily: theme.typography.fontFamily,
              px: 6,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            Get Started
          </Button>
        </Box>
        <Box sx={{ fontFamily: theme.typography.fontFamily, flex: 1, pl: { md: 6 }, textAlign: "center" }}>
          <Box
            component="img"
            src={HERO_IMG}
            alt="A vibrant display of fresh vegetables and fruits"
            sx={{ fontFamily: theme.typography.fontFamily, width: "65%", borderRadius: 3, boxShadow: 4, maxWidth: 420 }}
            draggable={false}
          />
        </Box>
      </Container>


      {/* Features Section */}
      <Container maxWidth="lg" sx={{ fontFamily: theme.typography.fontFamily, pb: 10, px: 3 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center" textAlign="center">
          {FEATURES.map(({ icon, title, description }, idx) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={idx}
              sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <Paper
                elevation={5}
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  px: 4,
                  py: 7,
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 8,
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <Box sx={{ fontFamily: theme.typography.fontFamily, mb: 3, color: "primary.main" }}>{icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ textTransform: "uppercase", fontFamily: theme.typography.fontFamily }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, maxWidth: 320 }}>
                  {description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>


      {/* How It Works Section */}
      <Container maxWidth="md" sx={{ fontFamily: theme.typography.fontFamily, py: 10 }}>
        <Typography variant="h4" fontWeight="bold" mb={8} textAlign="center" sx={{ textTransform: "uppercase" }}>
          Start Your Culinary Adventure
        </Typography>
        <Grid container spacing={6} justifyContent="center" textAlign="center">
          {[
            {
              icon: <StorefrontIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />,
              title: "Explore the Market",
              desc: "Fill your cart with fresh, high-quality produce from local farmers and trusted vendors.",
            },
            {
              icon: <EmojiObjectsIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />,
              title: "Find Your Inspiration",
              desc: "Browse thousands of recipes or use our search to find the perfect dish for any occasion.",
            },
            {
              icon: <GroupAddIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />,
              title: "Cook & Share",
              desc: "Follow easy step-by-step instructions, cook a delicious meal, and share your experience with the community.",
            },
          ].map(({ icon, title, desc }, idx) => (
            <Grid size={{ xs: 12, sm: 4 }} key={idx}>
              <Paper
                elevation={4}
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  p: 6,
                  borderRadius: 4,
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-10px)" },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {icon}
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ textTransform: "uppercase" }}>
                  {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, maxWidth: 280 }}>
                  {desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>


      {/* Extra Engagement Section */}
      <Container maxWidth="md" sx={{ fontFamily: theme.typography.fontFamily, py: 10, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" mb={4} sx={{ textTransform: "uppercase" }}>
          From Our Kitchen to Yours
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 6 }}>
          Learn how to perfectly roast seasonal vegetables and unlock their amazing flavors. A must-try recipe for any home cook!
        </Typography>
        <Button variant="outlined" href="/blog" size="large" sx={{ px: 6, py: 1.5, textTransform: "uppercase" }}>
          Explore Recipes
        </Button>
      </Container>


      {/* Email Signup Section */}
      <Container maxWidth="sm" sx={{ fontFamily: theme.typography.fontFamily, py: 8 }}>
        <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center" sx={{ textTransform: "uppercase" }}>
          Join Our Newsletter
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks for subscribing to our food community!");
          }}
          sx={{ display: "flex", gap: 2, justifyContent: "center" }}
        >
          <TextField
            type="email"
            required
            label="Your Email for Delicious Updates"
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
            }}
          />
          <Button type="submit" variant="contained" size="large" sx={{ px: 5, textTransform: "uppercase" }}>
            Subscribe
          </Button>
        </Box>
      </Container>
    </Box>
  );
}