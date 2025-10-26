import axios from '../config/axios';

const getPostsByTaggedProduct = async (productId) => {
  try {
    // Fetch posts tagged with a specific product
    const response = await axios.get(`/posts/tagged-product/${productId}`);
    return response.data.posts;
  } catch (error) {
    console.error('Error fetching posts by tagged product:', error);
    throw error;
  }
};

const postService = {
  getPostsByTaggedProduct,
};

export default postService;