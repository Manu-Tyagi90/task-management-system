import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Flag,
  CalendarToday,
  Person,
  Schedule,
  Comment as CommentIcon,
  MoreVert,
  AttachFile,
  Send,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import taskService from '../../services/taskService';

dayjs.extend(relativeTime);

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

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state) => state.auth.user);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTask(id);
      setTask(response.data.task);
    } catch (error) {
      enqueueSnackbar('Failed to fetch task', { variant: 'error' });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(id);
      enqueueSnackbar('Task deleted successfully', { variant: 'success' });
      navigate('/tasks');
    } catch (error) {
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await taskService.addComment(id, commentText);
      setTask(response.data.task);
      setCommentText('');
      enqueueSnackbar('Comment added successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) return;

    try {
      const response = await taskService.updateComment(id, editingComment, editCommentText);
      setTask(response.data.task);
      setEditingComment(null);
      setEditCommentText('');
      enqueueSnackbar('Comment updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update comment', { variant: 'error' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await taskService.deleteComment(id, commentId);
      setTask(response.data.task);
      enqueueSnackbar('Comment deleted successfully', { variant: 'success' });
      setCommentMenuAnchor(null);
    } catch (error) {
      enqueueSnackbar('Failed to delete comment', { variant: 'error' });
    }
  };

  const canModifyTask = () => {
    return user?.role === 'admin' || task?.createdBy?._id === user?._id || task?.assignedTo?._id === user?._id;
  };

  const canModifyComment = (comment) => {
    return user?.role === 'admin' || comment.author._id === user?._id;
  };

  const formatDate = (date) => {
    return dayjs(date).format('MMM DD, YYYY');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Task not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/tasks')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Task Details
        </Typography>
        {canModifyTask() && (
          <>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Task Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={task.status.replace('_', ' ')}
                  color={statusColors[task.status]}
                  size="small"
                />
                <Chip
                  icon={<Flag />}
                  label={task.priority}
                  color={priorityColors[task.priority]}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="h5" gutterBottom>
                {task.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.description || 'No description provided'}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {task.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments ({task.attachments.length})
                </Typography>
                <List dense>
                  {task.attachments.map((attachment) => (
                    <ListItem key={attachment._id}>
                      <ListItemAvatar>
                        <Avatar>
                          <AttachFile />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attachment.originalName}
                        secondary={`${(attachment.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Comments ({task.comments?.length || 0})
            </Typography>

            {/* Comment Input */}
            <Box component="form" onSubmit={handleAddComment} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submittingComment}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<Send />}
                  disabled={!commentText.trim() || submittingComment}
                >
                  {submittingComment ? <CircularProgress size={20} /> : 'Post Comment'}
                </Button>
              </Box>
            </Box>

            {/* Comments List */}
            <List>
              {task.comments?.map((comment) => (
                <ListItem
                  key={comment._id}
                  alignItems="flex-start"
                  sx={{
                    mb: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {comment.author?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.author?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(comment.createdAt).fromNow()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      editingComment === comment._id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" onClick={handleUpdateComment}>
                              Save
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                        >
                          {comment.text}
                        </Typography>
                      )
                    }
                  />
                  {canModifyComment(comment) && !editingComment && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        setCommentMenuAnchor(e.currentTarget);
                        setSelectedComment(comment);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>

            <Menu
              anchorEl={commentMenuAnchor}
              open={Boolean(commentMenuAnchor)}
              onClose={() => setCommentMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setEditingComment(selectedComment._id);
                  setEditCommentText(selectedComment.text);
                  setCommentMenuAnchor(null);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => handleDeleteComment(selectedComment._id)}
                sx={{ color: 'error.main' }}
              >
                Delete
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Created By */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {task.createdBy?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      {task.createdBy?.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Assigned To */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {task.assignedTo ? (
                      <>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {task.assignedTo.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {task.assignedTo.name}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Due Date */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Due Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 20 }} />
                    <Typography variant="body2">
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </Typography>
                  </Box>
                </Box>

                {/* Estimated Hours */}
                {task.estimatedHours && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Estimated Hours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Schedule sx={{ fontSize: 20 }} />
                      <Typography variant="body2">
                        {task.estimatedHours} hours
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Created At */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(task.createdAt)}
                  </Typography>
                </Box>

                {/* Updated At */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {dayjs(task.updatedAt).fromNow()}
                  </Typography>
                </Box>

                {/* Completed At */}
                {task.completedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(task.completedAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TaskDetail;