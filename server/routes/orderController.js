import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { awardHarvestCoins } from '../controllers/loyaltyController.js';
import Coupon from '../models/Coupon.js'; // New: Import Coupon model

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, couponCode, deliveryTimeSlot, orderNotes, harvestCoinsUsed, harvestCoinsDiscount } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // IMPORTANT: Recalculate prices on the server to prevent client-side manipulation.
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x.product) },
  });

  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = itemsFromDB.find(
      (item) => item._id.toString() === itemFromClient.product
    );
    if (!matchingItemFromDB) {
      res.status(404);
      throw new Error(`Product not found: ${itemFromClient.product}`);
    }
    // NEW: Check stock
    if (matchingItemFromDB.countInStock < itemFromClient.qty) {
        res.status(400);
        throw new Error(`Not enough stock for ${matchingItemFromDB.name}. Only ${matchingItemFromDB.countInStock} left.`);
    }
    return {
      name: matchingItemFromDB.name,
      qty: itemFromClient.qty,
      image: matchingItemFromDB.image,
      price: matchingItemFromDB.price,
      product: itemFromClient.product,
    };
  });

  const subtotal = dbOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Calculate delivery charge (₹40 for orders less than ₹200, free for ₹200 or more)
  const deliveryCharge = subtotal < 200 ? 40 : 0;
  
  let totalPrice = subtotal + deliveryCharge;
  
  // Apply Harvest Coins discount
  if (harvestCoinsDiscount && harvestCoinsDiscount > 0) {
    totalPrice -= harvestCoinsDiscount;
  }
  
  // Apply coupon discount if provided
  let discount = { code: '', amount: 0 };
  if (couponCode) {
    try {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true,
        expiryDate: { $gte: new Date() }
      });
      
      if (coupon) {
        if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
          throw new Error(`Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`);
        }
        
        if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
          throw new Error('Coupon usage limit exceeded');
        }
        
        const discountAmount = coupon.discountType === 'percentage' 
          ? (subtotal * coupon.discountValue) / 100 
          : coupon.discountValue;
          
        discount = {
          code: coupon.code,
          amount: discountAmount
        };
        
        totalPrice -= discountAmount;
        
        // Update coupon usage count
        coupon.usedCount += 1;
        await coupon.save();
      }
    } catch (couponError) {
      console.error('Coupon error:', couponError.message);
      // Don't fail the order if coupon is invalid, just proceed without it
    }
  }

  // Ensure total price doesn't go below zero
  totalPrice = Math.max(0, totalPrice);

  const order = new Order({
    user: req.user._id,
    orderItems: dbOrderItems,
    shippingAddress,
    paymentMethod: 'N/A', // Payment functionality removed for now
    subtotal: subtotal,
    deliveryCharge: deliveryCharge,
    discount: discount,
    totalPrice: totalPrice,
    deliveryTimeSlot: deliveryTimeSlot || '',
    orderNotes: orderNotes || '',
    harvestCoinsUsed: harvestCoinsUsed || 0,
    harvestCoinsDiscount: harvestCoinsDiscount || 0,
    harvestCoinsEarned: Math.floor(totalPrice * 0.02), // 2% of total order value after all discounts
  });

  const createdOrder = await order.save();

  // NEW: Update stock count
  const updateStockPromises = createdOrder.orderItems.map(async (item) => {
    return Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty }
    });
  });
  await Promise.all(updateStockPromises);

  // Award Harvest Coins to the user (admins can also earn points)
  const loyaltyResult = await awardHarvestCoins(req.user._id, totalPrice);
  if (!loyaltyResult.success) {
    console.error('Failed to award Harvest Coins:', loyaltyResult.error);
  }

  // Send order confirmation email
  const itemRows = createdOrder.orderItems.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eaeaea;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: center;">${item.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
    </tr>
  `).join('');

  const summaryRows = [];
  
  // Add delivery charge if applicable
  if (createdOrder.deliveryCharge > 0) {
    summaryRows.push(`
      <tr>
        <td colspan="3" style="text-align: right; padding: 5px 0;">Delivery Charge:</td>
        <td style="text-align: right; padding: 5px 0;">₹${createdOrder.deliveryCharge.toFixed(2)}</td>
      </tr>
    `);
  }
  
  // Add Harvest Coins discount if applicable
  if (createdOrder.harvestCoinsDiscount > 0) {
    summaryRows.push(`
      <tr>
        <td colspan="3" style="text-align: right; padding: 5px 0; color: #28a745;">Harvest Coins Discount:</td>
        <td style="text-align: right; padding: 5px 0; color: #28a745;">-₹${createdOrder.harvestCoinsDiscount.toFixed(2)}</td>
      </tr>
    `);
  }
  
  // Add coupon discount if applicable
  if (createdOrder.discount?.amount > 0) {
    summaryRows.push(`
      <tr>
        <td colspan="3" style="text-align: right; padding: 5px 0; color: #28a745;">Discount (${createdOrder.discount.code}):</td>
        <td style="text-align: right; padding: 5px 0; color: #28a745;">-₹${createdOrder.discount.amount.toFixed(2)}</td>
      </tr>
    `);
  }
  
  const message = `
    <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #800000; color: white; padding: 20px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-family: 'Cinzel', serif;">Thank You For Your Order!</h1>
        </div>
        <div style="padding: 30px 40px; color: #333; line-height: 1.6;">
          <h2 style="color: #333333; font-weight: 600;">Hi ${req.user.username},</h2>
          <p>We've received your order #${createdOrder._id.toString().slice(-6)} and are getting it ready. Here's a summary of your purchase:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: left;">Item</th>
                <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: center;">Quantity</th>
                <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: right;">Price</th>
                <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <table style="width: 100%; margin-top: 20px;">
            <tbody>
              <tr>
                <td colspan="3" style="text-align: right; padding: 5px 0;">Subtotal:</td>
                <td style="text-align: right; padding: 5px 0;">₹${createdOrder.subtotal.toFixed(2)}</td>
              </tr>
              ${summaryRows.join('')}
              <tr>
                <td colspan="3" style="text-align: right; padding: 10px 0; font-weight: bold; border-top: 2px solid #333;">Grand Total:</td>
                <td style="text-align: right; padding: 10px 0; font-weight: bold; border-top: 2px solid #333;">₹${createdOrder.totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.CLIENT_URL}/order/${createdOrder._id}" style="background-color: #e8eb14; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid #d7d911;">View Your Order</a>
          </div>
        </div>
        <div style="background-color: #fafafa; color: #777; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmation #${createdOrder._id.toString().slice(-6)}`,
      html: message,
    });
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError.message);
  }

  res.status(201).json(createdOrder);
});

// You would also have getOrderById, getMyOrders, etc. here
// For brevity, I'm focusing on the payment logic.
export { createOrder };