const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Habits API
export const habitsAPI = {
  getAll: async () => {
    return apiRequest('/habits');
  },

  getById: async (id) => {
    return apiRequest(`/habits/${id}`);
  },

  getByCategory: async (category) => {
    return apiRequest(`/habits/category/${category}`);
  },

  getCategories: async () => {
    return apiRequest('/habits/categories');
  },

  search: async (query) => {
    return apiRequest(`/habits/search?q=${encodeURIComponent(query)}`);
  },

  getPopular: async () => {
    return apiRequest('/habits/popular');
  },
};

// Habit Logs API
export const habitLogsAPI = {
  create: async (logData) => {
    return apiRequest('/habit-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  getUserLogs: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/habit-logs?${params.toString()}`);
  },

  getLogsForDate: async (date) => {
    return apiRequest(`/habit-logs/date/${date}`);
  },

  getLogsForHabit: async (habitId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/habit-logs/habit/${habitId}?${params.toString()}`);
  },
};

// Dashboard API
export const dashboardAPI = {
  getUserDashboard: async () => {
    return apiRequest('/dashboard');
  },
};

// Achievements API
export const achievementsAPI = {
  getAll: async () => {
    return apiRequest('/achievements');
  },

  getUserAchievements: async () => {
    return apiRequest('/achievements/user');
  },
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    return apiRequest('/admin/users');
  },
  
  updateUserStatus: async (id, status) => {
    return apiRequest(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  updateUserRole: async (id, role) => {
    return apiRequest(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  getHabits: async () => {
    return apiRequest('/admin/habits');
  },
  
  createHabit: async (habitData) => {
    return apiRequest('/admin/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  },

  updateHabit: async (id, habitData) => {
    return apiRequest(`/admin/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  },
  
  deleteHabit: async (id) => {
    return apiRequest(`/admin/habits/${id}`, {
      method: 'DELETE',
    });
  },

  createAchievement: async (data) => {
    return apiRequest('/admin/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAchievements: async () => {
    return apiRequest('/admin/achievements');
  },

  deleteAchievement: async (id) => {
    return apiRequest(`/admin/achievements/${id}`, {
      method: 'DELETE',
    });
  },

  getUserLogs: async (userId) => {
    return apiRequest(`/admin/users/${userId}/logs`);
  },

  deleteUserLog: async (logId) => {
    return apiRequest(`/admin/logs/${logId}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/admin/stats');
  }
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return 'Session expired. Please log in again.';
  }
  
  return error.message || 'An unexpected error occurred';
};