const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 15;

const getProducts = () => {
  try {
    const items = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsedItems = items ? JSON.parse(items) : [];
    // Filter out any invalid products (null, undefined, or without _id)
    return parsedItems.filter(item => item && item._id);
  } catch (error) {
    console.error('Error getting recently viewed products:', error);
    return [];
  }
};

const addProduct = (product) => {
  if (!product || !product._id) return;

  try {
    let items = getProducts();
    // Remove the product if it already exists to move it to the front
    items = items.filter(item => item._id !== product._id);

    // Add the new product to the beginning of the array
    items.unshift(product);

    // Limit the number of items
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error adding recently viewed product:', error);
  }
};

const recentlyViewedService = { getProducts, addProduct };

export default recentlyViewedService;