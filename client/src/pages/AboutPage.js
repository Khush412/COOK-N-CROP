import React, { useRef } from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, Divider, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, useInView } from 'framer-motion';

// Icons
import {
    MenuBook,
    Storefront,
    LightbulbOutlined,
    Public,
    SpaOutlined,
    PeopleOutline,
    ShoppingCartCheckout,
    Duo,
} from '@mui/icons-material';

// Reusable animation variants for staggering children
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
};

// Component to handle the viewport-triggered animation for a container
const AnimatedContainer = ({ children, sx = {} }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <Box
            ref={ref}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            sx={sx}
        >
            {children}
        </Box>
    );
};

const AboutPage = () => {
    const theme = useTheme();

    const offers = [
        {
            icon: <MenuBook fontSize="large" />,
            title: 'Community Recipes',
            description: 'Share your favorite dishes and discover new ones from a global community of food lovers.',
        },
        {
            icon: <Storefront fontSize="large" />,
            title: 'Fresh Store',
            description: 'Buy handpicked fruits, vegetables, and unique ingredients directly from our trusted network of farmers.',
        },
        {
            icon: <LightbulbOutlined fontSize="large" />,
            title: 'Cooking Inspiration',
            description: 'Get daily tips, tricks, and explore exotic dishes to spark your culinary creativity.',
        },
        {
            icon: <Public fontSize="large" />,
            title: 'Food & Culture',
            description: 'Celebrate diverse flavors from around the world and learn the stories behind the dishes.',
        },
    ];

    const whyChooseUsItems = [
        {
            icon: <SpaOutlined />,
            text: 'Fresh & exotic ingredients',
        },
        {
            icon: <PeopleOutline />,
            text: 'Community-driven recipes',
        },
        {
            icon: <ShoppingCartCheckout />,
            text: 'Seamless shopping & guidance',
        },
        {
            icon: <Duo />,
            text: 'Fun, modern, interactive experience',
        },
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Hero Section */}
            <Box sx={{
                pt: { xs: 12, md: 16 },
                pb: { xs: 8, md: 12 },
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'url(/images/about-hero.jpg)', // A subtle, food-related background image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: theme.palette.mode === 'dark' ? 0.1 : 0.05,
                    transform: 'scale(1.1)',
                    filter: 'blur(2px) grayscale(30%)',
                    zIndex: 0,
                }
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <AnimatedContainer>
                        <Paper
                            elevation={4}
                            sx={{
                                p: { xs: 3, md: 6 },
                                textAlign: 'center',
                                borderRadius: 4,
                                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <motion.div variants={itemVariants}>
                                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily }}>
                                    Our Journey, Your Kitchen
                                </Typography>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '750px', mx: 'auto', fontFamily: theme.typography.fontFamily }}>
                                    Discover the story behind Cook'N'Crop and our passion for bringing people together through food.
                                </Typography>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <Divider sx={{ width: '100px', height: '4px', bgcolor: 'secondary.main', mx: 'auto', mt: 4 }} />
                            </motion.div>
                        </Paper>
                    </AnimatedContainer>
                </Container>
            </Box>

            {/* Our Story Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
                <AnimatedContainer>
                    <Grid container spacing={{ xs: 4, md: 8 }} alignItems="stretch">
                        <Grid size={{ xs: 12, md: 6 }} component={motion.div} variants={itemVariants}>
                            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
                                Our Story
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', mb: 2, fontFamily: theme.typography.fontFamily }}>
                                Cook'N'Crop began with a simple craving: to connect the dots between the vibrant fields of local farmers and the creative hearts of home cooks. We envisioned a place where the joy of cooking wasn't just about the final dish, but about the entire journey—from a seed in the ground to a shared meal at the table.
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                                Today, we are a bustling digital farmers' market and a global kitchen, a community bound by the love for fresh, authentic food.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} component={motion.div} variants={itemVariants}>
                            <Box
                                component="img"
                                src="/images/about-story.jpg" // Placeholder image
                                alt="People cooking together in a bright kitchen"
                                sx={{
                                    width: '100%',
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[8],
                                    aspectRatio: '4/3',
                                    objectFit: 'cover',
                                    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                                    '&:hover': {
                                        transform: 'scale(1.03)',
                                        boxShadow: theme.shadows[16],
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </AnimatedContainer>
            </Container>

            {/* What We Offer Section */}
            <Box sx={{ bgcolor: 'background.paper', py: { xs: 10, md: 14 } }}>
                <Container maxWidth="lg">
                    <AnimatedContainer>
                        <motion.div variants={itemVariants}>
                            <Typography variant="h3" component="h2" textAlign="center" sx={{ fontWeight: 700, mb: 8, fontFamily: theme.typography.fontFamily }}>
                                What We Offer
                            </Typography>
                        </motion.div>
                        <Grid container spacing={4} alignItems="stretch">
                            {offers.map((offer, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index} component={motion.div} variants={itemVariants} sx={{ display: 'flex' }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: { xs: 3, sm: 4 },
                                            textAlign: 'center',
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            borderRadius: 4,
                                            borderColor: 'divider',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: theme.shadows[8],
                                                borderColor: 'primary.main',
                                                '& .MuiAvatar-root': {
                                                    backgroundColor: 'secondary.main',
                                                    color: 'secondary.contrastText',
                                                    boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                                                }
                                            }
                                        }}
                                    >
                                        <Avatar sx={{
                                            bgcolor: 'primary.main',
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 3,
                                            color: 'primary.contrastText',
                                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}>
                                            {offer.icon}
                                        </Avatar>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1.5, fontFamily: theme.typography.fontFamily }}>
                                                {offer.title}
                                            </Typography>
                                            <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                                {offer.description}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </AnimatedContainer>
                </Container>
            </Box>

            {/* Our Mission & Vision Section */}
            <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
                <AnimatedContainer>
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                borderRadius: 5,
                                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
                                Our Mission
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 5, fontFamily: theme.typography.fontFamily }}>
                                "To inspire healthier, happier lives by making cooking fun, fresh, and community-driven."
                            </Typography>
                            <Divider sx={{ width: '80px', mx: 'auto', my: 4 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
                                Our Vision
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', fontFamily: theme.typography.fontFamily }}>
                                "A world where food is not just fuel, but a shared experience of joy."
                            </Typography>
                        </Paper>
                    </motion.div>
                </AnimatedContainer>
            </Container>
        </Box>
    );
};

export default AboutPage;