import api from '../config/axios';

const searchPosts = async ({ search = '', page = 1, sort = 'relevance', limit = 12 }) => {
  try {
    const params = new URLSearchParams({
      search,
      page,
      sort,
      limit,
    });
    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

const postService = {
  searchPosts,
};

export default postService;