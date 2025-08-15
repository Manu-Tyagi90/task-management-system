import api from './api';

const taskService = {
  getTasks: async (params) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTaskStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  addComment: async (taskId, text) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { text });
    return response.data;
  },

  updateComment: async (taskId, commentId, text) => {
    const response = await api.put(`/tasks/${taskId}/comments/${commentId}`, { text });
    return response.data;
  },

  deleteComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },
};

export default taskService;