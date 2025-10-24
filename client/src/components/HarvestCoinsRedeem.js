import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, CircularProgress, Alert, useTheme, alpha } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getHarvestCoinsBalance, redeemHarvestCoins } from '../services/loyaltyService';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const HarvestCoinsRedeem = ({ cartTotal, onDiscountApply }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Fetch user's Harvest Coins balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const result = await getHarvestCoinsBalance();
        if (result.success) {
          setCoinsBalance(result.balance);
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

  // For admins, we don't need the 10 orders enrollment requirement
  // Calculate discount value for given coins
  const calculateDiscount = (coins) => {
    return (coins / 200) * 100;
  };

  const handleRedeem = async () => {
    if (maxRedeemableCoins <= 0) {
      setError('No Harvest Coins available for redemption or cart total too low');
      return;
    }

    try {
      setRedeeming(true);
      setError('');
      setSuccess('');
      
      const result = await redeemHarvestCoins(maxRedeemableCoins, cartTotal);
      if (result.success) {
        const discountValue = calculateDiscount(maxRedeemableCoins);
        onDiscountApply(discountValue, maxRedeemableCoins);
        setSuccess(`Successfully redeemed ${maxRedeemableCoins} Harvest Coins for ₹${discountValue} discount!`);
        setCoinsBalance(result.coinsRemaining);
      } else {
        setError(result.error || 'Failed to redeem Harvest Coins');
      }
    } catch (err) {
      setError(err.message || 'Failed to redeem Harvest Coins');
    } finally {
      setRedeeming(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ 
      p: 3, 
      borderRadius: 3, 
      bgcolor: alpha(theme.palette.secondary.main, 0.05),
      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
      mb: 3
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EmojiEventsIcon sx={{ color: 'secondary.main', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
          Harvest Coins
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mr: 1 }}>
              Balance:
            </Typography>
            <Chip 
              label={`${coinsBalance} coins`} 
              color="secondary" 
              size="small" 
              sx={{ fontWeight: 'bold' }} 
            />
          </Box>
          
          {maxRedeemableCoins > 0 ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                Redeem up to {maxRedeemableCoins} coins for ₹{calculateDiscount(maxRedeemableCoins)} discount
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRedeem}
                disabled={redeeming}
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark
                  }
                }}
              >
                {redeeming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Redeem ${maxRedeemableCoins} Coins`}
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {coinsBalance > 0 
                ? 'Cart total is too low to redeem coins (minimum 5% discount required)' 
                : 'Earn Harvest Coins by making purchases to unlock discounts'}
            </Typography>
          )}
        </>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default HarvestCoinsRedeem;