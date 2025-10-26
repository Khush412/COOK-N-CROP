import React, { createContext, useContext, useState } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonProducts, setComparisonProducts] = useState([]);

  const addToComparison = (product) => {
    setComparisonProducts(prev => {
      // Check if product is already in comparison
      if (prev.some(p => p._id === product._id)) {
        return prev;
      }
      // Limit to 4 products for comparison
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId) => {
    setComparisonProducts(prev => prev.filter(p => p._id !== productId));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
  };

  const isProductInComparison = (productId) => {
    return comparisonProducts.some(p => p._id === productId);
  };

  const value = {
    comparisonProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isProductInComparison
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};