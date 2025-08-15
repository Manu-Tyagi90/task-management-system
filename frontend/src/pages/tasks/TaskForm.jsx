import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Skeleton,
} from '@mui/material';
import { Save, Cancel, Add, Flag } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import taskService from '../../services/taskService';
import userService from '../../services/userService';
import FileUpload from '../../components/common/FileUpload';

const STATUS_OPTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
const PRIORITY_OPTS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

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

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // if present => edit
  const { enqueueSnackbar } = useSnackbar();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    assignedTo: '',
    estimatedHours: '',
  });

  // Tags handling
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Files
  const [files, setFiles] = useState([]); // pending (new)
  const [existingFiles, setExistingFiles] = useState([]); // already uploaded

  const fetchAssignableUsers = async () => {
    try {
      const res = await userService.getAssignableUsers();
      setUsers(res.data.users || []);
    } catch {
      // optional
    }
  };

  const fetchTask = async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      const res = await taskService.getTask(id);
      const t = res.data.task;
      setForm({
        title: t.title || '',
        description: t.description || '',
        status: t.status || 'pending',
        priority: t.priority || 'medium',
        dueDate: t.dueDate ? dayjs(t.dueDate) : null,
        assignedTo: t.assignedTo?._id || '',
        estimatedHours: t.estimatedHours || '',
      });
      setTags(t.tags || []);
      setExistingFiles(
        (t.attachments || []).map((att) => ({
          id: att._id,
          name: att.originalName,
          size: att.size,
          status: 'uploaded',
          url: att.url,
          publicId: att.publicId,
        }))
      );
    } catch (err) {
      enqueueSnackbar('Failed to load task', { variant: 'error' });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignableUsers();
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (!tags.includes(val)) setTags((s) => [...s, val]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t) => setTags((s) => s.filter((x) => x !== t));

  const onSave = async () => {
    if (!form.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        assignedTo: form.assignedTo || null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        tags,
      };

      let taskId = id;
      if (isEdit) {
        await taskService.updateTask(id, payload);
      } else {
        const res = await taskService.createTask(payload);
        taskId = res.data.task._id;
      }

      // Upload new files if any
      const newFiles = files.filter((f) => f.status === 'pending');
      if (newFiles.length > 0) {
        try {
          await taskService.uploadFiles(taskId, newFiles);
          enqueueSnackbar('Files uploaded', { variant: 'success' });
        } catch {
          enqueueSnackbar('Some files failed to upload', { variant: 'warning' });
        }
      }

      enqueueSnackbar(isEdit ? 'Task updated' : 'Task created', { variant: 'success' });
      navigate('/tasks');
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save task', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      {/* Grid: Details + Schedule/Assignment */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* Details */}
        <SectionCard id="details" title="Task Details">
          {loading ? (
            <Skeleton variant="rectangular" height={260} />
          ) : (
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                fullWidth
                autoFocus
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                fullWidth
                multiline
                minRows={4}
              />

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                }}
              >
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                  fullWidth
                >
                  {STATUS_OPTS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Priority"
                  value={form.priority}
                  onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
                  fullWidth
                  InputProps={{
                    startAdornment: <Flag fontSize="small" color="action" sx={{ mr: 1 }} />,
                  }}
                >
                  {PRIORITY_OPTS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tags
                </Typography>
                <TextField
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  fullWidth
                  sx={{ mt: 0.5 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {tags.map((t) => (
                    <Chip key={t} size="small" label={t} onDelete={() => handleRemoveTag(t)} sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </SectionCard>

        {/* Schedule & Assignment */}
        <SectionCard id="schedule" title="Schedule & Assignment">
          {loading ? (
            <Skeleton variant="rectangular" height={260} />
          ) : (
            <Stack spacing={2}>
              <DatePicker
                label="Due Date"
                value={form.dueDate}
                onChange={(v) => setForm((s) => ({ ...s, dueDate: v }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                select
                label="Assigned To"
                value={form.assignedTo}
                onChange={(e) => setForm((s) => ({ ...s, assignedTo: e.target.value }))}
                fullWidth
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Estimated Hours"
                type="number"
                inputProps={{ min: 0, step: '0.5' }}
                value={form.estimatedHours}
                onChange={(e) => setForm((s) => ({ ...s, estimatedHours: e.target.value }))}
                fullWidth
              />
            </Stack>
          )}
        </SectionCard>
      </Box>

      {/* Attachments */}
      <Box sx={{ mt: 3 }}>
        <SectionCard id="attachments" title="Attachments (PDF only, max 3)">
          {loading ? (
            <Skeleton variant="rectangular" height={160} />
          ) : (
            <FileUpload
              files={[...existingFiles, ...files]}
              onFilesChange={(newFiles) => {
                const existing = newFiles.filter((f) => f.status === 'uploaded');
                const pending = newFiles.filter((f) => f.status === 'pending');
                setExistingFiles(existing);
                setFiles(pending);
              }}
              maxFiles={3}
            />
          )}
        </SectionCard>
      </Box>

      {/* Actions */}
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={() => navigate(isEdit ? `/tasks/${id}` : '/tasks')}
          disabled={saving}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={onSave}
          disabled={saving}
          sx={{ textTransform: 'none' }}
        >
          {isEdit ? 'Update Task' : 'Create Task'}
        </Button>
      </Stack>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Edit Task' : 'Create Task'}
        </Typography>
        {!isEdit && (
          <Button startIcon={<Add />} variant="outlined" onClick={() => setForm((s) => ({ ...s, title: s.title + ' ' }))} sx={{ textTransform: 'none' }}>
            Quick Test
          </Button>
        )}
      </Stack>
      {content}
    </Container>
  );
}