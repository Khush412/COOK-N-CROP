import express from 'express';
import {
  createOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticated routes
router.route('/')
  .post(protect, createOrder);

export default router;