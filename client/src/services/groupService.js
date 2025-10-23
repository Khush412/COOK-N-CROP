import api from '../config/axios';

const getAllGroups = async () => {
  try {
    const response = await api.get('/groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups', error);
    throw error;
  }
};

const createGroup = async (groupData) => {
  // groupData should be FormData
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.post('/groups', groupData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating group', error);
    throw error;
  }
};

const updateGroup = async (id, groupData) => {
  // groupData should be FormData
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.put(`/groups/${id}`, groupData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating group', error);
    throw error;
  }
};

const deleteGroup = async (id) => {
  try {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group', error);
    throw error;
  }
};

const getGroupDetails = async (slug) => {
  try {
    const response = await api.get(`/groups/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group details for ${slug}`, error);
    throw error;
  }
};

const getGroupPosts = async (slug, { sort, page, search }) => {
  try {
    const params = new URLSearchParams({ sort, page });
    if (search) params.append('search', search);
    const response = await api.get(`/groups/${slug}/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for group ${slug}`, error);
    throw error;
  }
};

const joinLeaveGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/${groupId}/toggle-membership`);
    return response.data;
  } catch (error) {
    console.error('Error joining/leaving group', error);
    throw error;
  }
};

const getMySubscriptions = async () => {
  try {
    // This endpoint is on the users route, but it's group-related functionality for the UI
    const response = await api.get('/users/me/subscriptions');
    return response.data.data; // The backend returns { success: true, data: [...] }
  } catch (error) {
    console.error('Error fetching user subscriptions', error);
    throw error;
  }
};

const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group members', error);
    throw error;
  }
};

const updateMemberRole = async (groupId, memberId, role) => {
  try {
    const response = await api.put(`/groups/${groupId}/members/${memberId}`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating member role', error);
    throw error;
  }
};

const removeMember = async (groupId, memberId) => {
  try {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing member', error);
    throw error;
  }
};

const getJoinRequests = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/requests`);
    return response.data;
  } catch (error) {
    console.error('Error fetching join requests', error);
    throw error;
  }
};

const handleJoinRequest = async (groupId, userId, action) => {
  try {
    const response = await api.put(`/groups/${groupId}/requests/${userId}`, { action });
    return response.data;
  } catch (error) {
    console.error(`Error handling join request for user ${userId} with action ${action}`, error);
    throw error;
  }
};

const groupService = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupDetails,
  getGroupPosts,
  joinLeaveGroup,
  getMySubscriptions,
  getGroupMembers,
  updateMemberRole,
  removeMember,
  getJoinRequests,
  handleJoinRequest,
};

export default groupService;
