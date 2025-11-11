import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, Alert, useTheme, alpha, Stack, Card, CardContent, CardActions, Divider, LinearProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getHarvestCoinsBalance } from '../services/loyaltyService';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import Loader from '../custom_components/Loader';

const HarvestCoinsRedeem = ({ cartTotal, onDiscountApply, reservedCoins, reservedDiscount }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [userTier, setUserTier] = useState('bronze');
  const [harvestCoinsPercentage, setHarvestCoinsPercentage] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return theme.palette.primary.main;
    }
  };

  // Get tier label
  const getTierLabel = (tier) => {
    switch (tier) {
      case 'gold': return 'Gold Member';
      case 'silver': return 'Silver Member';
      case 'bronze': return 'Bronze Member';
      default: return 'Member';
    }
  };

  // Fetch user's Harvest Coins balance and tier
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const result = await getHarvestCoinsBalance();
        if (result.success) {
          setCoinsBalance(result.balance);
          setUserTier(result.tier || 'bronze');
          setHarvestCoinsPercentage(result.harvestCoinsPercentage || 3);
        }
      } catch (err) {
        setError('Failed to fetch Harvest Coins balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  // Calculate maximum coins that can be redeemed (based on 5% discount limit)
  const maxRedeemableCoins = Math.min(
    coinsBalance,
    Math.floor((cartTotal * 0.05) / 100 * 200) // Max 5% of cart value in coins
  );

  // Calculate coins that will be earned on this purchase
  const coinsToBeEarned = Math.floor(cartTotal * (harvestCoinsPercentage / 100));

  // For admins, we don't need the 10 orders enrollment requirement
  // Calculate discount value for given coins
  const calculateDiscount = (coins) => {
    return (coins / 200) * 100;
  };

  const handleRedeem = () => {
    if (maxRedeemableCoins <= 0) {
      setError('No Harvest Coins available for redemption or cart total too low');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const discountValue = calculateDiscount(maxRedeemableCoins);
      // Instead of actually redeeming coins, just reserve them for this session
      onDiscountApply(discountValue, maxRedeemableCoins);
      setSuccess(`Reserved ${maxRedeemableCoins} Harvest Coins for ₹${discountValue} discount!`);
    } catch (err) {
      setError(err.message || 'Failed to reserve Harvest Coins');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        mb: 3,
        borderRadius: 3,
        border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: 0, 
        height: 0,
        borderStyle: 'solid',
        borderWidth: '0 60px 60px 0',
        borderColor: `transparent ${theme.palette.secondary.main} transparent transparent`,
        zIndex: 1
      }} />
      
      <CardContent sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: '800', fontFamily: theme.typography.fontFamily }}>
            Harvest Coins
          </Typography>
          <Chip
            icon={<StarsIcon />}
            label={getTierLabel(userTier)}
            sx={{
              bgcolor: getTierColor(userTier),
              color: userTier === 'gold' ? 'black' : 'white',
              fontWeight: 'bold',
              ml: 'auto',
              height: 28
            }}
          />
        </Box>
        
        <Divider sx={{ my: 2, borderColor: alpha(theme.palette.secondary.main, 0.2) }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Loader size="large" />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, mb: 1 }}>
                  Your Balance
                </Typography>
                <Chip 
                  label={`${coinsBalance} coins`} 
                  color="secondary" 
                  size="medium" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    height: 36,
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, mb: 1 }}>
                  Earning Rate
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700, color: 'secondary.main' }}>
                  {harvestCoinsPercentage}%
                </Typography>
              </Box>
            </Box>
            
            {/* Progress bar for coins to be earned */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 500 }}>
                  Coins on this purchase
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                  {coinsToBeEarned} coins
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, (coinsToBeEarned / 100) * 100)} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.divider, 0.3),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.secondary.main
                  }
                }} 
              />
            </Box>
            
            {reservedCoins > 0 ? (
              <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
                <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, mb: 1, color: 'success.main' }}>
                  <LocalActivityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Coins Reserved
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                  Reserved {reservedCoins} coins for ₹{reservedDiscount} discount
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => onDiscountApply(0, 0)} // Cancel reservation
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    fontSize: '0.8rem'
                  }}
                >
                  Cancel Reservation
                </Button>
              </Box>
            ) : maxRedeemableCoins > 0 ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                  Reserve up to {maxRedeemableCoins} coins for ₹{calculateDiscount(maxRedeemableCoins)} discount
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRedeem}
                  size="large"
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`
                    }
                  }}
                >
                  Reserve {maxRedeemableCoins} Coins
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {coinsBalance > 0 
                    ? 'Cart total is too low to redeem coins (minimum 5% discount required)' 
                    : 'Earn Harvest Coins by making purchases to unlock discounts'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
      
      {(error || success) && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
              {success}
            </Alert>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default HarvestCoinsRedeem;