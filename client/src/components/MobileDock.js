import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme, useMediaQuery } from '@mui/material';
import { 
  Home as HomeIcon,
  People as CommunityIcon,
  Store as StoreIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import EnhancedGlobalSearch from './EnhancedGlobalSearch';

const MobileDock = () => {
  const navigate = useNavigate();
  const { unreadMessageCount } = useAuth();
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const searchInputRef = useRef(null);
  
  // Calculate cart item count
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Define dock items with 5 icons as requested
  const dockItems = [
    {
      id: 1,
      icon: <HomeIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: '20px' }} />,
      label: 'Home',
      description: 'Go to homepage',
      onClick: () => navigate('/')
    },
    {
      id: 2,
      icon: <CommunityIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: '20px' }} />,
      label: 'Community',
      description: 'Explore community',
      onClick: () => navigate('/community')
    },
    {
      id: 3,
      icon: <SearchIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: '20px' }} />,
      label: 'Search',
      description: 'Search products',
      onClick: () => {
        setIsSearchClosing(false);
        setMobileSearchOpen(true);
      }
    },
    {
      id: 4,
      icon: <StoreIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: '20px' }} />,
      label: 'Store',
      description: 'Visit store',
      onClick: () => navigate('/CropCorner')
    },
    {
      id: 5,
      icon: <CartIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: '20px' }} />,
      label: 'Cart',
      description: 'View cart',
      onClick: () => navigate('/cart'),
      badgeCount: cartItemCount
    }
  ];

  const closeSearch = () => {
    setIsSearchClosing(true);
    setTimeout(() => {
      setMobileSearchOpen(false);
      setIsSearchClosing(false);
    }, 300);
  };

  // Focus the search input when the search opens
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        const inputElement = searchInputRef.current.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }, [mobileSearchOpen]);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: theme.palette.primary.main,
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          boxShadow: theme.shadows[4],
          animation: isSearchClosing ? 'slideOutToTop 0.3s ease-out forwards' : 'slideInFromTop 0.3s ease-out forwards'
        }}>
          <div style={{ flex: 1 }} ref={searchInputRef}>
            <EnhancedGlobalSearch 
              fullWidth 
              onSearchComplete={() => closeSearch()}
            />
          </div>
          <button
            onClick={closeSearch}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: '8px',
              fontSize: '24px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Overlay to close search when clicking outside */}
      {mobileSearchOpen && (
        <div 
          onClick={closeSearch}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1399,
            animation: isSearchClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.3s ease-out forwards'
          }}
        />
      )}

      {/* Main Dock */}
      <div style={{ 
        position: 'fixed', 
        bottom: '12px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        animation: 'fadeIn 0.3s ease-out',
        // Added rounded edges and blur effect
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '8px 16px',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {dockItems.map(item => (
          <div 
            key={item.id}
            onClick={item.onClick}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: theme.shadows[3],
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease-in-out',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
              e.currentTarget.style.boxShadow = theme.shadows[6];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = theme.shadows[3];
            }}
          >
            {item.icon}
            {item.badgeCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.badgeCount > 99 ? '99+' : item.badgeCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToTop {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default MobileDock;