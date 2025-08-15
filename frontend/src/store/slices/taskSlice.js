import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  currentTask: null,
  filters: {
    status: '',
    priority: '',
    assignedTo: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload.tasks;
      state.pagination = action.payload.pagination;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  setCurrentTask,
  addTask,
  updateTask,
  deleteTask,
  setFilters,
  setPage,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;