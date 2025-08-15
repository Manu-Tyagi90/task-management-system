import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
  Skeleton,
  Pagination,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  Person,
  CalendarToday,
  Flag,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import taskService from '../../services/taskService';
import {
  setTasks,
  setFilters,
  setPage,
  setLoading,
  setError,
} from '../../store/slices/taskSlice';
import { useSnackbar } from 'notistack';

/* ---------- Helpers (consistent with Dashboard/Profile) ---------- */
function SectionCard({ title, action, children, id }) {
  return (
    <Paper
      component="section"
      aria-labelledby={id}
      elevation={2}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {(title || action) && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            {title ? (
              <Typography id={id} variant="h6" fontWeight={600}>
                {title}
              </Typography>
            ) : <span />}
            {action || null}
          </Stack>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}

/* Status/priority color maps (MUI Chip colors) */
const STATUS_COLOR = {
  pending: 'default',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
};
const PRIORITY_COLOR = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  urgent: 'error',
};

function TaskTile({ task, onView, onEdit, onDelete }) {
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header chips */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Chip
          size="small"
          label={task.status?.replace('_', ' ') || 'pending'}
          color={STATUS_COLOR[task.status] || 'default'}
        />
        <Chip
          size="small"
          variant="outlined"
          icon={<Flag fontSize="small" />}
          label={task.priority || 'medium'}
          color={PRIORITY_COLOR[task.priority] || 'default'}
        />
      </Stack>

      {/* Title */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }} noWrap>
        {task.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: 40, // keep rows leveled if one description is short
        }}
      >
        {task.description || 'No description provided'}
      </Typography>

      {/* Meta (assignee + due date) */}
      <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
        {task.assignedTo && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Person fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {task.assignedTo?.name || 'Unassigned'}
            </Typography>
          </Stack>
        )}

        {task.dueDate && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1 }}>
        <Tooltip title="View">
          <IconButton size="small" onClick={onView}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

/* ---------- Main Tasks Page ---------- */
export default function Tasks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { tasks, filters, pagination, loading, error } = useSelector((s) => s.tasks);
  const user = useSelector((s) => s.auth.user);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = pagination?.pages || 1;
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      search,
    }),
    [filters, search]
  );

  useEffect(() => {
    fetchTasks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFilters, page]);

  const fetchTasks = async (pageNum = 1) => {
    try {
      dispatch(setLoading(true));
      const params = {
        page: pageNum,
        limit,
        ...filters,
        search,
      };
      const res = await taskService.getTasks(params);
      dispatch(setTasks(res.data)); // assumes API returns { tasks, pagination }
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || 'Failed to fetch tasks'));
      enqueueSnackbar('Failed to fetch tasks', { variant: 'error' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setPage(1));
    fetchTasks(1);
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      enqueueSnackbar('Task deleted successfully', { variant: 'success' });
      fetchTasks(page);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to delete task', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Tasks
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tasks/new')}
            sx={{ textTransform: 'none' }}
          >
            New Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={() => fetchTasks(page)}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Filters + Search */}
      <SectionCard
        id="filters"
        title="Filter & Search"
        action={
            <Button
              size="small"
              startIcon={<FilterList />}
              onClick={() => setShowFilters((v) => !v)}
              sx={{ textTransform: 'none' }}
              variant={showFilters ? 'contained' : 'outlined'}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
        }
      >
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: showFilters ? '2fr 1fr 1fr 1fr' : '2fr 1fr' },
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search tasks (title/description)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Always-visible filter: Status */}
          <TextField
            select
            label="Status"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          {/* Toggleable filters */}
          {showFilters && (
            <>
              <TextField
                select
                label="Priority"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>

              <TextField
                label="Assigned To (User ID)"
                value={filters.assignedTo || ''}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                fullWidth
              />
            </>
          )}

          {/* Search submit button stretches aligned end when grid breaks */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
          <Box sx={{ textAlign: { xs: 'left', sm: 'left', md: 'right' } }}>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              Search
            </Button>
            <Button
              variant="text"
              sx={{ ml: 1, textTransform: 'none' }}
              onClick={() => {
                setSearch('');
                dispatch(setFilters({ status: '', priority: '', assignedTo: '' }));
                dispatch(setPage(1));
                fetchTasks(1);
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </SectionCard>

      {/* Tasks Grid */}
      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          alignItems: 'stretch',
        }}
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Paper key={i} elevation={2} sx={{ p: 2, borderRadius: 2, height: 180 }}>
              <Skeleton variant="rectangular" height="100%" />
            </Paper>
          ))
        ) : error ? (
          <SectionCard id="error" title="Error">
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </SectionCard>
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskTile
              key={task._id}
              task={task}
              onView={() => navigate(`/tasks/${task._id}`)}
              onEdit={() => navigate(`/tasks/${task._id}/edit`)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))
        ) : (
          <SectionCard
            id="empty-state"
            title=""
            action={null}
          >
            <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
              <Assignment sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography variant="h6">No tasks found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting filters or create a new task.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/tasks/new')}
                sx={{ textTransform: 'none', mt: 1 }}
              >
                Create Your First Task
              </Button>
            </Stack>
          </SectionCard>
        )}
      </Box>

      {/* Pagination */}
      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, value) => {
            dispatch(setPage(value));
            fetchTasks(value);
          }}
          color="primary"
          siblingCount={1}
          boundaryCount={1}
        />
      </Stack>
    </Container>
  );
}