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
    
    // Handle both single image and images array for backward compatibility
    const image = matchingItemFromDB.images && matchingItemFromDB.images.length > 0 
        ? matchingItemFromDB.images[0] 
        : matchingItemFromDB.image || '';

    return {
      name: matchingItemFromDB.name,
      qty: itemFromClient.qty,
      image: image, // Use first image or fallback to single image
      images: matchingItemFromDB.images || [], // Include all images
      price: matchingItemFromDB.price,
      product: itemFromClient.product,
    };
  });