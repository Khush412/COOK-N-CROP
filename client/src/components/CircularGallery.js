import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import api from '../config/axios';

const CircularGallery = ({ 
  bend = 3, 
  textColor = "#ffffff", 
  borderRadius = 0.05, 
  scrollSpeed = 2, 
  scrollEase = 0.05 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products/featured');
        // Transform products into gallery items
        const galleryItems = res.data.map(product => ({
          id: product._id,
          image: product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/default-product.jpg`,
          text: product.name,
          price: product.price
        }));
        setItems(galleryItems);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle item click to navigate to product page
  const handleItemClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  }

  // If no items, show a message
  if (items.length === 0) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No products available</div>;
  }

  // For now, we'll render a simple grid as a placeholder
  // In a real implementation, this would be replaced with the actual OGL circular gallery
  return (
    <div style={{ 
      height: '600px', 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        padding: '20px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            style={{
              borderRadius: `${borderRadius * 20}px`,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              boxShadow: theme.shadows[3],
              backgroundColor: theme.palette.background.paper
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              height: '200px',
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <div style={{ padding: '15px', color: textColor }}>
              <h3 style={{ margin: '0 0 10px 0', color: textColor }}>{item.text}</h3>
              {item.price && (
                <p style={{ margin: 0, fontWeight: 'bold', color: theme.palette.primary.main }}>
                  ₹{item.price}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircularGallery;