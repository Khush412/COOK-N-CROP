const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            unit: { type: String },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
        },
    ],
    shippingAddress: {
        fullName: { type: String },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String },
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['COD', 'Stripe', 'PayPal'], // Add more as you implement them
        default: 'COD',
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        code: String,
        amount: {
            type: Number,
            default: 0,
        },
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'],
        default: 'Pending',
    },
    statusHistory: [orderStatusHistorySchema],
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    deliveryTimeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', ''],
        default: '',
    },
    orderNotes: {
        type: String,
        maxlength: 200,
        trim: true,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
