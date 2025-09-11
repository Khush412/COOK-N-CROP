import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

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

  const totalPrice = dbOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const order = new Order({
    user: req.user._id,
    orderItems: dbOrderItems,
    shippingAddress,
    paymentMethod: 'N/A', // Payment functionality removed for now
    totalPrice,
  });

  const createdOrder = await order.save();

  // NEW: Update stock count
  const updateStockPromises = createdOrder.orderItems.map(async (item) => {
    return Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty }
    });
  });
  await Promise.all(updateStockPromises);

  res.status(201).json(createdOrder);
});

// You would also have getOrderById, getMyOrders, etc. here
// For brevity, I'm focusing on the payment logic.
export { createOrder };