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

  // Add these methods to the existing taskService object

uploadFiles: async (taskId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('documents', file.file || file);
  });

  const response = await api.post(`/tasks/${taskId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      // You can use this to show upload progress
      console.log('Upload progress:', percentCompleted);
    },
  });
  return response.data;
},

deleteFile: async (taskId, fileId) => {
  const response = await api.delete(`/tasks/${taskId}/files/${fileId}`);
  return response.data;
},

downloadFile: async (taskId, fileId, fileName) => {
  const response = await api.get(`/tasks/${taskId}/files/${fileId}/download`, {
    responseType: 'blob',
  });
  
  // Create a download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
},
};



export default taskService;