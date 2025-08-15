import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  InputAdornment,
  Pagination,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Assignment,
  CalendarToday,
  Person,
  Flag,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import taskService from '../../services/taskService';
import { setTasks, setFilters, setPage, setLoading, setError } from '../../store/slices/taskSlice';

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  urgent: 'error',
};

const statusColors = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
};

function Tasks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { tasks, filters, pagination, loading, error } = useSelector((state) => state.tasks);
  const user = useSelector((state) => state.auth.user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.page]);

  const fetchTasks = async () => {
    try {
      dispatch(setLoading(true));
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        search: searchTerm,
      };
      
      const response = await taskService.getTasks(params);
      dispatch(setTasks(response.data));
      dispatch(setError(null));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch tasks'));
      enqueueSnackbar('Failed to fetch tasks', { variant: 'error' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setPage(1));
    fetchTasks();
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handlePageChange = (event, value) => {
    dispatch(setPage(value));
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      enqueueSnackbar('Task deleted successfully', { variant: 'success' });
      fetchTasks();
    } catch (error) {
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
    }
  };

  const getTaskIcon = (priority) => {
    const size = priority === 'urgent' ? 'small' : 'tiny';
    return <Flag fontSize={size} />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tasks/new')}
        >
          New Task
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained">
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Box>
        </form>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>

            <Button
              variant="text"
              onClick={() => {
                dispatch(setFilters({ status: '', priority: '', assignedTo: '' }));
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Task List */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} md={6} lg={4} key={n}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No tasks found
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tasks/new')}
            sx={{ mt: 2 }}
          >
            Create Your First Task
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} md={6} lg={4} key={task._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={task.status.replace('_', ' ')}
                        color={statusColors[task.status]}
                        size="small"
                      />
                      <Chip
                        icon={getTaskIcon(task.priority)}
                        label={task.priority}
                        color={priorityColors[task.priority]}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="h6" component="h2" gutterBottom>
                      {task.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {task.description || 'No description'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                      {task.assignedTo && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {task.assignedTo.name}
                          </Typography>
                        </Box>
                      )}
                      
                      {task.dueDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/tasks/${task._id}`)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    {(user?.role === 'admin' || task.createdBy._id === user?._id) && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/tasks/${task._id}/edit`)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteTask(task._id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default Tasks;