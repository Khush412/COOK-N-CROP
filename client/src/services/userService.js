import api from '../config/axios';

const getPublicProfile = async (username) => {
  try {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }
};

const toggleSavePost = async (postId) => {
  try {
    const response = await api.put(`/users/me/posts/save/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling save post:', error);
    throw error;
  }
};

const getSavedPosts = async () => {
  try {
    const response = await api.get('/users/me/posts/saved');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error.response?.data || error;
  }
};

const deleteAccount = async (password) => {
  try {
    const response = await api.post('/users/me/delete-account', { password });
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error.response?.data || error;
  }
};

const toggleFollow = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error.response?.data || error;
  }
};

const toggleWishlist = async (productId) => {
  try {
    const response = await api.put(`/users/me/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error.response?.data || error;
  }
};

const getWishlist = async () => {
  try {
    const response = await api.get('/users/me/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error.response?.data || error;
  }
};

const getMyActivity = async () => {
  try {
    const response = await api.get('/users/me/activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching my activity:', error);
    throw error.response?.data || error;
  }
};

const blockUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/block`);
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error.response?.data || error;
  }
};

const getBlockedUsers = async () => {
  try {
    const response = await api.get('/users/me/blocked');
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    throw error.response?.data || error;
  }
};

const getDashboardData = async () => {
  try {
    const response = await api.get('/users/me/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error.response?.data || error;
  }
};

const searchUsers = async (query) => {
  try {
    const response = await api.get(`/search/users?q=${encodeURIComponent(query)}&limit=5`);
    // Backend returns { users: [...] }
    return response.data.users || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// New function for personalized recommendations
const getUserByUsername = async (username) => {
  try {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};

const getRecommendations = async () => {
  try {
    // Since the backend endpoint doesn't exist, we'll generate recommendations based on available data
    // Get all groups to recommend groups the user might be interested in
    const groupsResponse = await api.get('/groups');
    const allGroups = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
    console.log('All groups fetched:', allGroups); // Debug log
    
    // Get trending users (we'll simulate this by getting users who have posted recently)
    const postsResponse = await api.get('/posts?sort=new&limit=20');
    const recentPosts = postsResponse.data && Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts : [];
    console.log('Recent posts fetched:', recentPosts); // Debug log
    
    // Extract unique users from recent posts and try to get follower count from a more reliable source
    const userMap = {};
    recentPosts.forEach(post => {
      if (post.user && post.user._id) {
        userMap[post.user._id] = {
          _id: post.user._id,
          username: post.user.username,
          profilePic: post.user.profilePic,
          followerCount: post.user.followerCount !== undefined ? post.user.followerCount : 0
        };
      }
    });
    
    // Try to get more accurate follower counts by fetching user details
    const userIds = Object.keys(userMap);
    if (userIds.length > 0) {
      // We could fetch user details here, but for now we'll use the data we have
      console.log('User IDs for detailed fetch:', userIds); // Debug log
    }
    
    const recommendedUsers = Object.values(userMap).slice(0, 5); // Limit to 5 users
    console.log('Recommended users:', recommendedUsers); // Debug log
    
    // For groups, let's implement a better recommendation logic
    // We'll sort groups by member count to recommend popular groups
    const recommendedGroups = [...allGroups]
      .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)) // Sort by member count descending
      .slice(0, 5) // Take top 5
      .map(group => ({
        _id: group._id,
        name: group.name,
        slug: group.slug,
        coverImage: group.coverImage,
        memberCount: group.memberCount || 0
      }));
    
    console.log('Recommended groups:', recommendedGroups); // Debug log
    
    return {
      users: recommendedUsers,
      groups: recommendedGroups
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return empty arrays as fallback
    return {
      users: [],
      groups: []
    };
  }
};

const userService = {
  getPublicProfile,
  toggleSavePost,
  getSavedPosts,
  changePassword,
  deleteAccount,
  toggleFollow,
  toggleWishlist,
  getWishlist,
  getMyActivity,
  blockUser,
  getBlockedUsers,
  getDashboardData,
  searchUsers,
  getUserByUsername, // New function
  getRecommendations, // New function
};

export default userService;