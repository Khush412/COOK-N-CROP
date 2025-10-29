const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendPriceDropNotifications, sendRestockNotifications } = require('../services/productNotificationService'); // New import

// @desc    Get all unique tags
// @route   GET /api/products/tags
// @access  Public
router.get('/tags', async (req, res) => {
  try {
    // Get all unique tags from products
    const tags = await Product.distinct('tags');
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check if this is a request for all products (for CircularGallery)
    const getAll = req.query.getAll === 'true';
    
    // If getAll is true, fetch all products without pagination
    if (getAll) {
      const {
        search = '',
        category = 'All',
        sort = 'default',
        minRating,
        stockFilter = 'all',
        minPrice,
        maxPrice,
        brands,
        tags
      } = req.query;

      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      // Rating filter
      if (minRating && Number(minRating) > 0) {
        query.rating = { $gte: Number(minRating) };
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) {
          query.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
          query.price.$lte = Number(maxPrice);
        }
      }

      // Brand filter (assuming brands is a comma-separated string)
      if (brands) {
        const brandArray = Array.isArray(brands) ? brands : brands.split(',').map(b => b.trim());
        query.brand = { $in: brandArray };
      }

      // Tags filter (assuming tags is a comma-separated string)
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        query.tags = { $in: tagArray };
      }

      // Stock filter
      if (stockFilter === 'inStock') {
        query.countInStock = { $gt: 0 };
      } else if (stockFilter === 'onSale') {
        query.salePrice = { $exists: true, $ne: null };
        query.$expr = { $lt: ['$salePrice', '$price'] };
      }

      let sortOption = {};
      switch (sort) {
        case 'priceAsc':
          sortOption = { price: 1 };
          break;
        case 'priceDesc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'nameAsc':
          sortOption = { name: 1 };
          break;
        case 'nameDesc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const finalSort = { isFeatured: -1, ...sortOption };

      const products = await Product.find(query).sort(finalSort);
      return res.json(products);
    }

    // Regular paginated request
    const pageSize = Number(req.query.limit) || 12; // Use limit parameter if provided, otherwise default to 12
    const page = Number(req.query.page) || 1;
    const {
      search = '',
      category = 'All',
      sort = 'default',
      minRating,
      stockFilter = 'all',
      minPrice,
      maxPrice,
      brands,
      tags
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Rating filter
    if (minRating && Number(minRating) > 0) {
      query.rating = { $gte: Number(minRating) };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Brand filter (assuming brands is a comma-separated string)
    if (brands) {
      const brandArray = Array.isArray(brands) ? brands : brands.split(',').map(b => b.trim());
      query.brand = { $in: brandArray };
    }

    // Tags filter (assuming tags is a comma-separated string)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    // Stock filter
    if (stockFilter === 'inStock') {
      query.countInStock = { $gt: 0 };
    } else if (stockFilter === 'onSale') {
      query.salePrice = { $exists: true, $ne: null };
      query.$expr = { $lt: ['$salePrice', '$price'] };
    }

    let sortOption = {};
    switch (sort) {
      case 'priceAsc':
        sortOption = { price: 1 };
        break;
      case 'priceDesc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'nameAsc':
        sortOption = { name: 1 };
        break;
      case 'nameDesc':
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const finalSort = { isFeatured: -1, ...sortOption };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(finalSort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/featured
// @desc    Get all featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    // Limit to 12 featured products for the carousel
    const products = await Product.find({ isFeatured: true }).limit(12);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Search products for autocomplete
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const findQuery = query ? { name: { $regex: query, $options: 'i' } } : {};
    // If there's a query, limit to 10 for autocomplete performance.
    // If no query, don't limit, send all products for initial dropdown.
    const limit = query ? 10 : 0;

    const products = await Product.find(findQuery)
      .limit(limit)
      .select('name images _id'); // Updated to select images instead of image
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
router.get('/low-stock', protect, authorize('admin'), async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const query = { countInStock: { $lte: threshold } };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ countInStock: 1 }) // Show lowest stock first
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), threshold });
  } catch (err) {
    console.error('Get low stock products error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'username profilePic');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @desc    Feature/unfeature a product
// @route   PUT /api/products/:id/feature
// @access  Private/Admin
router.put('/:id/feature', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully.`,
      isFeatured: product.isFeatured
    });
  } catch (error) {
    console.error('Feature product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get related products (customers also bought)
// @route   GET /api/products/:id/related
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find orders containing the current product
    const orders = await Order.find({ 'orderItems.product': productId }).limit(50); // Limit to recent 50 orders for performance

    if (orders.length === 0) {
      return res.json([]);
    }

    // Aggregate co-purchased products
    const relatedProductIds = orders.reduce((acc, order) => {
      // Check if the order has more than one item type
      if (order.orderItems.length > 1) {
        order.orderItems.forEach(item => {
          const currentItemId = item.product.toString();
          // Add other items from the same order to the accumulator
          if (currentItemId !== productId) {
            acc[currentItemId] = (acc[currentItemId] || 0) + 1;
          }
        });
      }
      return acc;
    }, {});

    // Sort by frequency and get top 10
    const sortedRelatedIds = Object.keys(relatedProductIds)
      .sort((a, b) => relatedProductIds[b] - relatedProductIds[a])
      .slice(0, 10);

    const relatedProducts = await Product.find({ _id: { $in: sortedRelatedIds } });
    res.json(relatedProducts);
  } catch (err) {
    console.error('Get related products error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products/:id/reviews
// @desc    Create a new review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has a delivered order with this product
    const orders = await Order.find({
      user: req.user._id,
      'orderItems.product': req.params.id,
      status: 'Delivered'
    });

    if (orders.length === 0) {
      return res.status(400).json({ message: 'You can only review products from a delivered order.' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT api/products/:id/reviews/:reviewId/upvote
// @desc    Upvote/un-upvote a product review
// @access  Private
router.put('/:id/reviews/:reviewId/upvote', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user has already upvoted
    const upvoteIndex = review.upvotes.findIndex(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (upvoteIndex > -1) {
      // Already upvoted, so remove upvote
      review.upvotes.splice(upvoteIndex, 1);
    } else {
      // Not upvoted, so add upvote
      review.upvotes.push(req.user._id);
    }

    await product.save();
    res.json({ upvotes: review.upvotes });
  } catch (error) {
    console.error('Upvote review error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// Updated to handle multiple images
router.post('/', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { 
      name, price, description, category, countInStock, origin, freshness, unit,
      variants, badges, salePrice, brand, tags
    } = req.body;

    // Validate required fields
    if (!name || !price || !description || !category || countInStock === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, price, description, category, countInStock' });
    }

    // Parse variants if it's a JSON string
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (e) {
        console.error('Error parsing variants:', e);
      }
    }

    // Parse badges if it's a JSON string
    let parsedBadges = {};
    if (badges) {
      try {
        parsedBadges = typeof badges === 'string' ? JSON.parse(badges) : badges;
      } catch (e) {
        console.error('Error parsing badges:', e);
      }
    }

    // Parse tags if it's a JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // If it's not JSON, treat as comma-separated string
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    // Handle multiple images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/productImages/${file.filename}`);
    } else {
      // Fallback to default image if no images uploaded
      imagePaths = ['/images/placeholder.png'];
    }

    const product = new Product({
      name,
      price: Number(price),
      description,
      unit: unit || undefined,
      category,
      countInStock: Number(countInStock),
      origin: origin || undefined,
      freshness: freshness || undefined,
      brand: brand || undefined,
      tags: parsedTags || [],
      images: imagePaths, // Updated to use images array
      variants: parsedVariants,
      badges: parsedBadges,
      salePrice: salePrice ? Number(salePrice) : undefined,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
// Updated to handle multiple images
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { 
      name, price, description, category, countInStock, origin, freshness, unit,
      variants, badges, salePrice, brand, tags, removeImages
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Parse variants if it's a JSON string
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (e) {
        console.error('Error parsing variants:', e);
      }
    }

    // Parse badges if it's a JSON string
    let parsedBadges = {};
    if (badges) {
      try {
        parsedBadges = typeof badges === 'string' ? JSON.parse(badges) : badges;
      } catch (e) {
        console.error('Error parsing badges:', e);
      }
    }

    // Parse tags if it's a JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // If it's not JSON, treat as comma-separated string
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    // Parse removeImages if it's a JSON string
    let parsedRemoveImages = [];
    if (removeImages) {
      try {
        parsedRemoveImages = typeof removeImages === 'string' ? JSON.parse(removeImages) : removeImages;
      } catch (e) {
        console.error('Error parsing removeImages:', e);
      }
    }

    // Handle image updates
    let updatedImages = [...product.images]; // Start with existing images
    
    // Remove images if specified
    if (parsedRemoveImages && Array.isArray(parsedRemoveImages)) {
      updatedImages = updatedImages.filter(img => !parsedRemoveImages.includes(img));
      
      // Also delete the actual image files from the server
      const fs = require('fs');
      const path = require('path');
      
      for (const imagePath of parsedRemoveImages) {
        // Only delete images that are in the uploads directory (not the placeholder)
        if (imagePath !== '/images/placeholder.png' && imagePath.includes('/uploads/')) {
          try {
            const fullPath = path.join(__dirname, '..', 'public', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          } catch (err) {
            console.error('Error deleting image file:', err);
          }
        }
      }
    }
    
    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/productImages/${file.filename}`);
      // If the only image is the placeholder, replace it with new images
      // Otherwise, add new images to existing ones
      if (updatedImages.length === 1 && updatedImages[0] === '/images/placeholder.png') {
        updatedImages = newImagePaths;
      } else {
        updatedImages = [...updatedImages, ...newImagePaths];
      }
    }
    
    // Ensure we have at least one image
    if (updatedImages.length === 0) {
      updatedImages = ['/images/placeholder.png'];
    }

    product.name = name || product.name;
    product.price = price ? Number(price) : product.price;
    product.description = description || product.description;
    product.unit = unit || product.unit;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
    product.origin = origin || product.origin;
    product.freshness = freshness || product.freshness;
    product.brand = brand || product.brand;
    product.tags = parsedTags || product.tags;
    product.images = updatedImages; // Updated to use images array
    product.variants = parsedVariants || product.variants;
    product.badges = parsedBadges || product.badges;
    product.salePrice = salePrice ? Number(salePrice) : product.salePrice;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete multiple products
// @route   DELETE /api/products
// @access  Private/Admin
router.delete('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required.' });
    }

    // Note: This doesn't delete the associated images from the server filesystem.
    // A more robust implementation would find the products, get their image paths,
    // delete the files, and then delete the products from the DB.

    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({ message: `${result.deletedCount} products removed successfully.` });
  } catch (error) {
    console.error('Bulk delete product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;