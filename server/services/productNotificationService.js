const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send price drop notifications to users who have shown interest in a product
const sendPriceDropNotifications = async (productId, oldPrice, newPrice) => {
  try {
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found for price drop notification');
      return;
    }

    // Calculate price drop percentage
    const priceDropPercentage = ((oldPrice - newPrice) / oldPrice) * 100;
    
    // Only send notifications for significant price drops (more than 10%)
    if (priceDropPercentage < 10) {
      return;
    }

    // Find users who have shown interest in this product
    // This could be users who have:
    // 1. Added the product to their wishlist
    // 2. Viewed the product recently
    // 3. Purchased the product before
    
    // For now, we'll find users who have the product in their wishlist
    const usersWithProductInWishlist = await User.find({ 
      wishlist: productId 
    });

    // Create notifications for each user
    const notifications = usersWithProductInWishlist.map(user => ({
      type: 'priceDrop',
      recipient: user._id,
      sender: user._id, // System-generated notification
      product: productId,
      message: `Great news! ${product.name} is now ${priceDropPercentage.toFixed(0)}% cheaper at ₹${newPrice.toFixed(2)}`,
      link: `/product/${productId}`,
    }));

    // Insert all notifications at once for better performance
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Sent ${notifications.length} price drop notifications for product ${product.name}`);
    }
  } catch (error) {
    console.error('Error sending price drop notifications:', error);
  }
};

// Send restock notifications to users who have shown interest in a product
const sendRestockNotifications = async (productId, previousStock, newStock) => {
  try {
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found for restock notification');
      return;
    }

    // Only send notifications if the product was previously out of stock
    if (previousStock > 0) {
      return;
    }

    // Find users who have shown interest in this product
    // This could be users who have:
    // 1. Added the product to their wishlist
    // 2. Viewed the product recently
    // 3. Had the product in their cart when it went out of stock
    
    // For now, we'll find users who have the product in their wishlist
    const usersWithProductInWishlist = await User.find({ 
      wishlist: productId 
    });

    // Create notifications for each user
    const notifications = usersWithProductInWishlist.map(user => ({
      type: 'restock',
      recipient: user._id,
      sender: user._id, // System-generated notification
      product: productId,
      message: `${product.name} is back in stock! Grab it while supplies last.`,
      link: `/product/${productId}`,
    }));

    // Insert all notifications at once for better performance
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Sent ${notifications.length} restock notifications for product ${product.name}`);
    }
  } catch (error) {
    console.error('Error sending restock notifications:', error);
  }
};

// Check for price drops and restocks periodically
const checkForProductUpdates = async () => {
  try {
    // In a real implementation, this would check for actual price changes
    // For now, we'll just log that the check is happening
    console.log('Checking for product updates...');
  } catch (error) {
    console.error('Error checking for product updates:', error);
  }
};

module.exports = {
  sendPriceDropNotifications,
  sendRestockNotifications,
  checkForProductUpdates,
};