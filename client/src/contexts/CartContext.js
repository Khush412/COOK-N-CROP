import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import productService from '../services/productService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const cartData = await productService.getCart();
      setCart(cartData);
    } catch (err) {
      setError('Failed to load cart.');
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity) => {
    const updatedCart = await productService.addToCart(productId, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    const updatedCart = await productService.updateCartItemQuantity(productId, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  const removeCartItem = async (productId) => {
    const updatedCart = await productService.removeCartItem(productId);
    setCart(updatedCart);
    return updatedCart;
  };

  const clearCart = async () => {
    const updatedCart = await productService.clearCart();
    setCart(updatedCart);
    return updatedCart;
  };

  const addMultipleToCart = async (items) => {
    const updatedCart = await productService.addMultipleToCart(items);
    setCart(updatedCart);
    return updatedCart;
  };

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    addMultipleToCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};