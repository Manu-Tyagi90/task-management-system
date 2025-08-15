import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Flag,
  CalendarToday,
  Person,
  Schedule,
  AttachFile,
  Download,
  Send,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import taskService from '../../services/taskService';

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
            ) : (
              <span />
            )}
            {action || null}
          </Stack>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTask(id);
      setTask(res.data.task);
    } catch (err) {
      enqueueSnackbar('Failed to load task', { variant: 'error' });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canModifyTask = useMemo(() => {
    // server enforces; here just enabling buttons when present
    return !!task;
  }, [task]);

  const handleDeleteTask = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      enqueueSnackbar('Task deleted', { variant: 'success' });
      navigate('/tasks');
    } catch (err) {
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await taskService.addComment(id, commentText.trim());
      setTask(res.data.task);
      setCommentText('');
      enqueueSnackbar('Comment added', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) return;
    try {
      const res = await taskService.updateComment(id, editingCommentId, editCommentText.trim());
      setTask(res.data.task);
      setEditingCommentId(null);
      setEditCommentText('');
      enqueueSnackbar('Comment updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to update comment', { variant: 'error' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await taskService.deleteComment(id, commentId);
      setTask(res.data.task);
      enqueueSnackbar('Comment deleted', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete comment', { variant: 'error' });
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const res = await taskService.deleteFile(id, fileId);
      setTask(res.data.task);
      enqueueSnackbar('File deleted', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete file', { variant: 'error' });
    }
  };

  const handleDownloadFile = (att) => {
    const url = att.url?.replace('/upload/', '/upload/fl_attachment/');
    const link = document.createElement('a');
    link.href = url || att.url;
    const name = att.originalName?.toLowerCase().endsWith('.pdf') ? att.originalName : `${att.originalName || 'document'}.pdf`;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const format = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/tasks')} sx={{ textTransform: 'none' }}>
            Back
          </Button>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/tasks/${id}/edit`)} sx={{ textTransform: 'none' }} disabled={!task}>
            Edit
          </Button>
          <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleDeleteTask} sx={{ textTransform: 'none' }} disabled={!task}>
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* Grid layout */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* Left column: Overview + Attachments + Comments */}
        <Stack spacing={3}>
          {/* Overview */}
          <SectionCard id="overview" title="Task Overview">
            {loading || !task ? (
              <Skeleton variant="rectangular" height={180} />
            ) : (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
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

                <Typography variant="h5" fontWeight={700} noWrap>
                  {task.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.description || 'No description provided'}
                </Typography>

                {task.tags && task.tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {task.tags.map((t) => (
                      <Chip key={t} size="small" label={t} sx={{ mb: 1 }} />
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </SectionCard>

          {/* Attachments */}
          <SectionCard id="attachments" title="Attachments">
            {loading || !task ? (
              <Skeleton variant="rectangular" height={120} />
            ) : task.attachments?.length ? (
              <List dense sx={{ m: 0 }}>
                {task.attachments.map((att) => (
                  <ListItem
                    key={att._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Download">
                          <IconButton size="small" color="primary" onClick={() => handleDownloadFile(att)}>
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteFile(att._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <AttachFile />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap title={att.originalName}>
                          {att.originalName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" component="span">
                          {(att.size / 1024).toFixed(1)} KB • Uploaded {new Date(att.uploadedAt).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No attachments.
              </Typography>
            )}
          </SectionCard>

          {/* Comments */}
          <SectionCard id="comments" title="Comments">
            {loading || !task ? (
              <Skeleton variant="rectangular" height={180} />
            ) : (
              <>
                <Box component="form" onSubmit={handleAddComment} sx={{ mb: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="Add a comment…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={submittingComment ? <CircularProgress size={18} color="inherit" /> : <Send />}
                      disabled={submittingComment || !commentText.trim()}
                      sx={{ textTransform: 'none' }}
                    >
                      Post
                    </Button>
                  </Stack>
                </Box>

                <List dense sx={{ m: 0 }}>
                  {task.comments?.length ? (
                    task.comments.map((c) => (
                      <ListItem
                        key={c._id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          alignItems: 'flex-start',
                        }}
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            {editingCommentId === c._id ? null : (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => { setEditingCommentId(c._id); setEditCommentText(c.text); }}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteComment(c._id)}>
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {(c.author?.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2">{c.author?.name || 'User'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(c.createdAt).toLocaleString()}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            editingCommentId === c._id ? (
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                />
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button variant="text" onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}>
                                    Cancel
                                  </Button>
                                  <Button variant="contained" onClick={handleUpdateComment}>
                                    Save
                                  </Button>
                                </Stack>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary" component="span" sx={{ mt: 0.5, display: 'block', whiteSpace: 'pre-wrap' }}>
                                {c.text}
                              </Typography>
                            )
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No comments yet.
                    </Typography>
                  )}
                </List>
              </>
            )}
          </SectionCard>
        </Stack>

        {/* Right column: Info */}
        <SectionCard id="info" title="Task Info">
          {loading || !task ? (
            <Skeleton variant="rectangular" height={260} />
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created By
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Avatar sx={{ width: 28, height: 28 }}>
                    {(task.createdBy?.name || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">{task.createdBy?.name || '-'}</Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Assigned To
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  {task.assignedTo ? (
                    <>
                      <Avatar sx={{ width: 28, height: 28 }}>
                        {(task.assignedTo?.name || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{task.assignedTo?.name}</Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">{format(task.dueDate)}</Typography>
                </Stack>
              </Box>

              {!!task.estimatedHours && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Hours
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">{task.estimatedHours}</Typography>
                  </Stack>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">{format(task.createdAt)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">{new Date(task.updatedAt).toLocaleString()}</Typography>
              </Box>

              {task.completedAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="body2">{format(task.completedAt)}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </SectionCard>
      </Box>
    </Container>
  );
}