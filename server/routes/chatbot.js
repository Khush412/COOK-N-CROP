const express = require('express');
const router = express.Router();
const { getChatbotResponse, getJsonAiResponse } = require('../services/aiService');
const Product = require('../models/Product');
const Post = require('../models/Post');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Address = require('../models/Address');
const { optionalAuth } = require('../middleware/auth');

const findProduct = async (productName) => {
  // Use text search for better matching, including plurals
  const products = await Product.find(
    { $text: { $search: productName } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(1);

  return products.length > 0 ? products[0] : null;
};

// @desc    Handle a chatbot query
// @route   POST /api/chatbot/query
// @access  Public
router.post('/query', optionalAuth, async (req, res) => {
  const { query, history } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'Query is required.' });
  }

  try {
    // --- Step 1: Intent Recognition using AI ---
    const tools = [
      { name: 'search_general', description: 'Search for products, recipes, or general information.' },
      { name: 'add_to_cart', description: 'Add one or more items to the shopping cart. Extracts item name and quantity.' },
      { name: 'remove_from_cart', description: 'Remove an item from the shopping cart. Extracts item name.' },
      { name: 'view_cart', description: 'Show the contents of the shopping cart.' },
      { name: 'clear_cart', description: 'Remove all items from the shopping cart.' },
      { name: 'get_order_status', description: 'Check the status of the most recent order.' },
      { name: 'recommend_recipe', description: 'Recommends recipes based on a list of ingredients the user has.' },
      { name: 'add_to_wishlist', description: "Add a product to the user's wishlist. Extracts 'productName'." },
      { name: 'view_wishlist', description: "Shows the user's current wishlist." },
      { name: 'save_post', description: "Save a post or recipe to the user's saved list. Extracts 'postTitle'." },
      { name: 'view_saved_posts', description: "Shows the user's saved posts and recipes." },
      { name: 'get_top_content', description: "Find top-rated, most discussed, or newest posts/recipes. Extracts 'metric' ('top', 'discussed', 'new')." },
      { name: 'get_top_products', description: "Finds the top-rated products in the store." },
      { name: 'chit_chat', description: 'Responds to simple greetings or general conversation that doesn\'t fit other tools.' },
      { name: 'check_stock', description: "Checks if a product is in stock. Extracts 'productName'." },
      { name: 'get_user_stats', description: "Retrieves the logged-in user's statistics like total orders and spending." },
      { name: 'view_addresses', description: "Shows the user's saved shipping addresses." },
      { name: 'set_default_address', description: "Sets one of the user's saved addresses as the default. Extracts 'addressLabel'." },
    ];

    const intentPrompt = `
      Given the user's query and conversation history, determine the user's intent and extract parameters.
      Choose one of the following tools: ${tools.map(t => t.name).join(', ')}.
      - For 'add_to_cart', extract 'productName' and 'quantity' (default to 1 if not specified).
      - For 'remove_from_cart', extract 'productName'.
      - For 'recommend_recipe', if the user mentions ingredients they have (e.g., "I have chicken and rice"), extract an array of strings called 'ingredients'.
      - For 'add_to_wishlist', extract 'productName'.
      - For 'view_wishlist', no parameters are needed.
      - For 'save_post', extract 'postTitle'.
      - For 'view_saved_posts', no parameters are needed.
      - For 'get_top_content', extract 'metric' which can be 'top', 'discussed', or 'new'.
      - For 'get_top_products', no parameters are needed.
      - For 'chit_chat', if the query is a simple greeting like "hello" or "how are you", use this tool.
      - For 'view_addresses', no parameters are needed.
      - For 'set_default_address', extract the 'addressLabel' (e.g., "Home", "Work").
      - For all other tools, no parameters are needed.
      - If the intent is unclear, default to 'search_general'.

      History: ${JSON.stringify(history)}
      User Query: "${query}"

      Respond with a JSON object like: {"tool": "tool_name", "parameters": {"param_name": "param_value"}}
    `;

    const intentResponse = await getJsonAiResponse(intentPrompt);
    const { tool, parameters } = intentResponse;

    let actionResult = {};
    let cartUpdated = false;

    // --- Step 2: Execute the determined action (Tool Use) ---
    switch (tool) {
      case 'chit_chat':
        const chatPrompt = `
          You are CropMate, a friendly and helpful AI assistant for a farm-to-table website called Cook-N-Crop. The user is making small talk or asking a general question. Engage in a brief, friendly, and on-brand conversational response. If they ask who you are, introduce yourself.
          User's query: "${query}"
          Your response:
        `;
        const chatResponse = await getChatbotResponse(chatPrompt);
        actionResult = { success: true, message: chatResponse };
        break;

      case 'check_stock':
        const productForStock = await findProduct(parameters.productName);
        if (!productForStock) {
          actionResult = { success: false, message: `I couldn't find a product called "${parameters.productName}" to check its stock.` };
        } else {
          if (productForStock.countInStock > 10) {
            actionResult = { success: true, message: `Yes, we have plenty of ${productForStock.name} in stock!` };
          } else if (productForStock.countInStock > 0) {
            actionResult = { success: true, message: `Yes, but we're running low on ${productForStock.name}! Only ${productForStock.countInStock} left in stock.` };
          } else {
            actionResult = { success: true, message: `Sorry, ${productForStock.name} is currently out of stock.` };
          }
        }
        break;

      case 'get_user_stats':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to see your stats." };
        } else {
          const userStats = await User.findById(req.user.id).select('activity');
          actionResult = { success: true, message: `So far, you've placed ${userStats.activity.totalOrders} orders with us, spending a total of $${userStats.activity.totalSpent.toFixed(2)}. We appreciate your business!` };
        }
        break;

      case 'add_to_cart':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to manage your cart." };
        } else {
          const product = await findProduct(parameters.productName);
          if (!product) {
            actionResult = { success: false, message: `I couldn't find a product called "${parameters.productName}".` };
          } else if (product.countInStock < parameters.quantity) {
            actionResult = { success: false, message: `Sorry, we only have ${product.countInStock} of ${product.name} in stock.` };
          } else {
            let cart = await Cart.findOne({ user: req.user.id }) || new Cart({ user: req.user.id, items: [] });
            const itemIndex = cart.items.findIndex(item => item.product.toString() === product._id.toString());
            if (itemIndex > -1) cart.items[itemIndex].quantity += parameters.quantity;
            else cart.items.push({ product: product._id, quantity: parameters.quantity });
            await cart.save();
            cartUpdated = true;
            actionResult = { success: true, message: `Added ${parameters.quantity}x ${product.name} to your cart.`, product };
          }
        }
        break;

      case 'remove_from_cart':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to manage your cart." };
        } else {
          const product = await findProduct(parameters.productName);
          if (!product) {
            actionResult = { success: false, message: `I couldn't find "${parameters.productName}" to remove.` };
          } else {
            let cart = await Cart.findOne({ user: req.user.id });
            const itemIndex = cart ? cart.items.findIndex(item => item.product.toString() === product._id.toString()) : -1;
            if (itemIndex > -1) {
              cart.items.splice(itemIndex, 1);
              await cart.save();
              cartUpdated = true;
              actionResult = { success: true, message: `Removed ${product.name} from your cart.` };
            } else {
              actionResult = { success: false, message: `It looks like ${product.name} wasn't in your cart.` };
            }
          }
        }
        break;

      case 'clear_cart':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to manage your cart." };
        } else {
          let cart = await Cart.findOne({ user: req.user.id });
          if (cart && cart.items.length > 0) {
            cart.items = [];
            await cart.save();
            cartUpdated = true;
            actionResult = { success: true, message: "I've cleared your cart." };
          } else {
            actionResult = { success: false, message: "Your cart is already empty." };
          }
        }
        break;

      case 'view_cart':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to view your cart." };
        } else {
          const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price');
          if (!cart || cart.items.length === 0) {
            actionResult = { success: true, message: "Your cart is currently empty." };
          } else {
            let cartSummary = "Here's what's in your cart:\n";
            let subtotal = 0;
            cart.items.forEach(item => {
              cartSummary += `- ${item.quantity}x ${item.product.name} at $${item.product.price.toFixed(2)} each.\n`;
              subtotal += item.quantity * item.product.price;
            });
            cartSummary += `\nSubtotal: $${subtotal.toFixed(2)}. You can go to your cart to checkout.`;
            actionResult = { success: true, message: cartSummary };
          }
        }
        break;

      case 'get_order_status':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to check your order status." };
        } else {
          const latestOrder = await Order.findOne({ user: req.user.id }).sort({ createdAt: -1 }).lean();
          if (latestOrder) {
            actionResult = { success: true, message: `Your latest order, Order #${latestOrder._id.toString().slice(-6)}, was placed on ${latestOrder.createdAt.toDateString()} and its status is currently: **${latestOrder.status}**.` };
          } else {
            actionResult = { success: false, message: "It looks like you haven't placed any orders yet." };
          }
        }
        break;

      case 'recommend_recipe':
        if (!parameters.ingredients || parameters.ingredients.length === 0) {
          actionResult = { success: false, message: "Please tell me what ingredients you have so I can recommend a recipe!" };
        } else {
          const ingredientRegexes = parameters.ingredients.map(ing => new RegExp(ing, 'i'));
          const recipes = await Post.find({
            isRecipe: true,
            'recipeDetails.ingredients': { $all: ingredientRegexes }
          }).limit(3).lean();

          if (recipes.length > 0) {
            let recipePrompt = "You are CropMate. A user asked for recipe recommendations based on ingredients. Based on the following context, give a friendly response and list the recipes you found. Format recipe names as Markdown links like `Recipe Title`.\n\n";
            recipePrompt += "RECIPES FOUND:\n";
            recipes.forEach(r => {
              recipePrompt += `- Recipe: ${r.title}, Link: /post/${r._id}\n`;
            });
            recipePrompt += `\nUser's ingredients: ${parameters.ingredients.join(', ')}\n\nYour response:`;
            const recipeResponse = await getChatbotResponse(recipePrompt);
            actionResult = { success: true, message: recipeResponse };
          } else {
            actionResult = {
              success: false, message: `I couldn't find any recipes with all of these ingredients: ${parameters.ingredients.join(', ')}. Why not try searching for one of them individually?`
            };
          }
        }
        break;

      case 'view_wishlist':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to view your wishlist." };
        } else {
          const userWithWishlist = await User.findById(req.user.id).populate('wishlist');
          if (!userWithWishlist.wishlist || userWithWishlist.wishlist.length === 0) {
            actionResult = { success: true, message: "Your wishlist is empty. You can add products to it from their page!" };
          } else {
            actionResult = { success: true, message: "Here's what's in your wishlist:", products: userWithWishlist.wishlist };
          }
        }
        break;

      case 'add_to_wishlist':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to have a wishlist." };
        } else {
          const product = await findProduct(parameters.productName);
          if (!product) {
            actionResult = { success: false, message: `I couldn't find a product called "${parameters.productName}".` };
          } else {
            const user = await User.findById(req.user.id);
            if (user.wishlist.includes(product._id)) {
              actionResult = { success: true, message: `${product.name} is already in your wishlist.` };
            } else {
              user.wishlist.push(product._id);
              await user.save();
              actionResult = { success: true, message: `I've added ${product.name} to your wishlist.` };
            }
          }
        }
        break;

      case 'view_saved_posts':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to view your saved posts." };
        } else {
          const userWithSavedPosts = await User.findById(req.user.id).populate('savedPosts');
          if (!userWithSavedPosts.savedPosts || userWithSavedPosts.savedPosts.length === 0) {
            actionResult = { success: true, message: "You haven't saved any posts yet." };
          } else {
            actionResult = { success: true, message: "Here are your saved posts:", posts: userWithSavedPosts.savedPosts };
          }
        }
        break;

      case 'save_post':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to save posts." };
        } else {
          const posts = await Post.find(
            { $text: { $search: parameters.postTitle } },
            { score: { $meta: 'textScore' } }
          ).sort({ score: { $meta: 'textScore' } }).limit(1);
          const post = posts.length > 0 ? posts[0] : null;

          if (!post) {
            actionResult = { success: false, message: `I couldn't find a post titled "${parameters.postTitle}".` };
          } else {
            const user = await User.findById(req.user.id);
            if (user.savedPosts.includes(post._id)) {
              actionResult = { success: true, message: `You've already saved the post "${post.title}".` };
            } else {
              user.savedPosts.push(post._id);
              await user.save();
              actionResult = { success: true, message: `I've saved "${post.title}" to your collection.` };
            }
          }
        }
        break;

      case 'get_top_content':
        const metric = parameters.metric || 'new';
        const pipeline = [];
        if (metric === 'top') {
          pipeline.push({ $addFields: { sortScore: { $size: { $ifNull: ['$upvotes', []] } } } }, { $sort: { sortScore: -1, createdAt: -1 } });
        } else if (metric === 'discussed') {
          pipeline.push({ $addFields: { sortScore: { $size: { $ifNull: ['$comments', []] } } } }, { $sort: { sortScore: -1, createdAt: -1 } });
        } else {
          pipeline.push({ $sort: { createdAt: -1 } });
        }
        pipeline.push({ $limit: 3 });
        const topPosts = await Post.aggregate(pipeline);
        actionResult = { success: true, message: "Here are some top posts.", posts: topPosts, metric };
        break;

      case 'get_top_products':
        const topProducts = await Product.find({ numReviews: { $gt: 0 } })
          .sort({ rating: -1 })
          .limit(3)
          .lean();
        if (topProducts.length === 0) {
          actionResult = { success: false, message: "I couldn't find any top-rated products right now." };
        } else {
          actionResult = { success: true, message: "Here are some of our top-rated products.", products: topProducts };
        }
        break;

      case 'view_addresses':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to view your addresses." };
        } else {
          const addresses = await Address.find({ user: req.user.id });
          if (addresses.length === 0) {
            actionResult = { success: true, message: "You haven't saved any addresses yet. You can add one from your profile page." };
          } else {
            let addressList = "Here are your saved addresses:\n";
            addresses.forEach(addr => {
              addressList += `- **${addr.label || 'Address'}**: ${addr.street}, ${addr.city}${addr.isDefault ? ' (Default)' : ''}\n`;
            });
            actionResult = { success: true, message: addressList };
          }
        }
        break;

      case 'set_default_address':
        if (!req.user) {
          actionResult = { success: false, message: "You need to log in to manage your addresses." };
        } else if (!parameters.addressLabel) {
          actionResult = { success: false, message: "Please tell me which address to set as default, for example: 'Set my Home address as default'." };
        } else {
          const addressToSet = await Address.findOne({ user: req.user.id, label: { $regex: parameters.addressLabel, $options: 'i' } });
          if (!addressToSet) {
            actionResult = { success: false, message: `I couldn't find an address with the label "${parameters.addressLabel}".` };
          } else if (addressToSet.isDefault) {
            actionResult = { success: true, message: `Your "${addressToSet.label}" address is already the default.` };
          } else {
            await Address.updateMany({ user: req.user.id, isDefault: true }, { isDefault: false });
            addressToSet.isDefault = true;
            await addressToSet.save();
            actionResult = { success: true, message: `Okay, I've set your "${addressToSet.label}" address as the default for future orders.` };
          }
        }
        break;

      default: // search_general
        const products = await Product.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(3).lean();
        const posts = await Post.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(3).lean();

        let searchContext = "You are CropMate, Cook-N-Crop's AI. Answer the user's question based ONLY on the context. If the context is empty, say 'I'm not sure about that, but you can browse our products or recipes!'. Format product/recipe names as Markdown links like Product Name.\n\n";
        if (products.length > 0) {
          searchContext += "PRODUCTS FOUND:\n";
          products.forEach(p => { searchContext += `- Product: ${p.name}, Price: $${p.price}, Link: /product/${p._id}\n`; });
        }
        if (posts.length > 0) {
          searchContext += "POSTS/RECIPES FOUND:\n";
          posts.forEach(p => { searchContext += `- Post: ${p.title}, Link: /post/${p._id}\n`; });
        }
        const searchPrompt = `${searchContext}\nUser Query: "${query}"\n\nAnswer:`;
        const searchResponse = await getChatbotResponse(searchPrompt);
        actionResult = { success: true, message: searchResponse };
        break;
    }

    // --- Step 3: Formulate Final Response ---
    // If the action was a simple success/fail message, we can make it more conversational.
    // For search, the response is already conversational.
    if (tool === 'get_top_content' && actionResult.success && actionResult.posts.length > 0) {
      let topContext = `You are CropMate. A user asked for the top content. Based on the following context, give a friendly response and list the content you found. Format names as Markdown links like Post Title.\n\n`;
      topContext += `TOP CONTENT FOUND (sorted by ${actionResult.metric}):\n`;
      actionResult.posts.forEach(p => {
        topContext += `- Post: ${p.title}, Link: /post/${p._id}\n`;
      });
      const topResponse = await getChatbotResponse(topContext);
      return res.json({ reply: topResponse });
    }

    if (tool === 'view_saved_posts' && actionResult.success && actionResult.posts?.length > 0) {
      let savedContext = `You are CropMate. A user asked for their saved posts. Based on the following context, give a friendly response and list the posts you found. Format names as Markdown links.\n\n`;
      savedContext += `SAVED POSTS FOUND:\n`;
      actionResult.posts.forEach(p => {
        savedContext += `- Post: ${p.title}, Link: /post/${p._id}\n`;
      });
      const savedResponse = await getChatbotResponse(savedContext);
      return res.json({ reply: savedResponse });
    }

    if ((tool === 'get_top_products' || tool === 'view_wishlist') && actionResult.success && actionResult.products.length > 0) {
      let listContext = `You are CropMate. A user asked to see content. Based on the following context, give a friendly response and list the content you found. Format names as Markdown links like Product Name.\n\n`;
      listContext += `PRODUCTS FOUND:\n`;
      actionResult.products.forEach(p => {
        listContext += `- Product: ${p.name}, Link: /product/${p._id}\n`;
      });
      const listResponse = await getChatbotResponse(listContext);
      return res.json({ reply: listResponse });
    }

    const toolsRequiringFinalResponse = ['add_to_cart', 'remove_from_cart', 'clear_cart', 'add_to_wishlist', 'save_post'];
    if (toolsRequiringFinalResponse.includes(tool)) {
      let finalResponsePrompt = `
        You are CropMate, Cook-N-Crop's AI assistant. Based on the user's query and the action just performed, formulate a friendly, conversational response.
        - The user is ${req.user ? req.user.username : 'a guest'}.
        - User's query was: "${query}"
        - The action you decided to take was: "${tool}"
        - The result of the action was: "${actionResult.message}"
      `;

      if (actionResult.product) {
        finalResponsePrompt += `
          - The product involved was: ${actionResult.product.name}
          - When mentioning this product, you MUST format it as a Markdown link like this: ${actionResult.product.name}
        `;
      } else {
        finalResponsePrompt += `
          - When mentioning a product or recipe, format it as a Markdown link like Product Name.
        `;
      }

      finalResponsePrompt += `
        Generate a response now.
      `;
      const finalReply = await getChatbotResponse(finalResponsePrompt);
      return res.json({ reply: finalReply, cartUpdated });
    }

    // For other tools, the message is already well-formatted.
    res.json({ reply: actionResult.message, cartUpdated });

  } catch (error) {
    console.error('Chatbot query error:', error);
    // Check for specific, user-friendly errors thrown from the AI service
    if (error.message.includes('overloaded') || error.message.includes('Failed to get a structured response')) {
      return res.json({ reply: error.message });
    } else if (error.message.includes('JSON')) {
      return res.json({ reply: "I'm having a little trouble thinking straight right now. Could you try rephrasing?" });
    } else {
      // For other unexpected errors, send a generic server error response
      return res.status(500).json({ message: 'Server error processing chatbot query.' });
    }
  }
});

module.exports = router;
