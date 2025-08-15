import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  Chip,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Schedule,
  Cancel,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import taskService from '../../services/taskService';

/**
 * SectionCard
 * Uniform section container with header + action area and consistent padding.
 * Ensures each section stretches to full height of its grid cell.
 */
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography id={id} variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {action || null}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}

/**
 * StatCard
 * Compact stat tile; height: 100% so all four align perfectly in a row.
 */
function StatCard({ icon, label, value, color = 'primary' }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: (t) => t.palette[color].main,
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            minHeight: 40,
          }}
          aria-hidden
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe getters for nested stats
  const safe = (obj = {}, key, def = 0) => (obj?.[key] ?? def);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await taskService.getTaskStats();
        if (!mounted) return;
        setStats({
          totalTasks: res?.data?.totalTasks ?? 0,
          tasksByStatus: {
            pending: safe(res?.data?.tasksByStatus, 'pending', 0),
            in_progress: safe(res?.data?.tasksByStatus, 'in_progress', 0),
            completed: safe(res?.data?.tasksByStatus, 'completed', 0),
            cancelled: safe(res?.data?.tasksByStatus, 'cancelled', 0),
          },
          tasksByPriority: {
            low: safe(res?.data?.tasksByPriority, 'low', 0),
            medium: safe(res?.data?.tasksByPriority, 'medium', 0),
            high: safe(res?.data?.tasksByPriority, 'high', 0),
            urgent: safe(res?.data?.tasksByPriority, 'urgent', 0),
          },
          overdueTasks: res?.data?.overdueTasks ?? 0,
          completedThisWeek: res?.data?.completedThisWeek ?? 0,
        });
      } catch (err) {
        enqueueSnackbar('Failed to load dashboard stats', { variant: 'error' });
        setStats({
          totalTasks: 0,
          tasksByStatus: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
          tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
          overdueTasks: 0,
          completedThisWeek: 0,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, [enqueueSnackbar]);

  const total = stats?.totalTasks || 0;
  const pct = (count) => {
    if (!total || total <= 0) return 0;
    const v = Math.round((count / total) * 100);
    return Number.isFinite(v) ? v : 0;
    // note: fallback to 0% if bad data
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
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
            onClick={() => navigate('/tasks')}
            sx={{ textTransform: 'none' }}
          >
            View Tasks
          </Button>
        </Stack>
      </Stack>

      {/* Top Stats (CSS Grid for perfect “justified” layout) */}
      <Box
        sx={{
          display: 'grid',
          gap: 3, // equals spacing={3}
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          mb: 1,
        }}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2, height: 88 }}>
              <Skeleton variant="rectangular" height="100%" />
            </Paper>
          ))
        ) : (
          <>
            <StatCard
              icon={<Assignment fontSize="small" />}
              label="Total Tasks"
              value={stats.totalTasks}
              color="primary"
            />
            <StatCard
              icon={<AssignmentTurnedIn fontSize="small" />}
              label="Completed"
              value={stats.tasksByStatus.completed}
              color="success"
            />
            <StatCard
              icon={<Schedule fontSize="small" />}
              label="In Progress"
              value={stats.tasksByStatus.in_progress}
              color="warning"
            />
            <StatCard
              icon={<Cancel fontSize="small" />}
              label="Overdue"
              value={stats.overdueTasks}
              color="error"
            />
          </>
        )}
      </Box>

      {/* Lower Grid: two halves (Priority + Quick Actions) and Recent Activity full width */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* Priority Distribution */}
        <SectionCard id="priority" title="Priority Distribution">
          {loading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={28} />
              ))}
            </Stack>
          ) : total === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tasks yet. Create your first task to see distribution.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {[
                { label: 'Urgent', key: 'urgent', color: 'error' },
                { label: 'High', key: 'high', color: 'warning' },
                { label: 'Medium', key: 'medium', color: 'info' },
                { label: 'Low', key: 'low', color: 'success' },
              ].map(({ label, key, color }) => (
                <Box key={key}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.tasksByPriority[key]} ({pct(stats.tasksByPriority[key])}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct(stats.tasksByPriority[key])}
                    color={color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard id="quick-actions" title="Quick Actions">
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              alignItems: 'stretch',
              flex: 1,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/tasks/new')}
              sx={{ textTransform: 'none', py: 1.2 }}
            >
              Create New Task
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => navigate('/tasks')}
              sx={{ textTransform: 'none', py: 1.2 }}
            >
              Browse Tasks
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => window.location.reload()}
              sx={{ textTransform: 'none', py: 1.2 }}
            >
              Refresh Stats
            </Button>
            <Chip
              icon={<TrendingUp />}
              label={`${stats?.completedThisWeek || 0} completed this week`}
              color="success"
              variant="outlined"
              sx={{ width: '100%', borderRadius: 2, justifyContent: 'center', py: 1.2 }}
            />
          </Box>
        </SectionCard>
      </Box>

      {/* Recent Activity (full width) */}
      <Box sx={{ mt: 3 }}>
        <SectionCard id="recent-activity" title="Recent Activity">
          {loading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={36} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Your recent task updates will appear here (e.g., status changes, new comments,
              assignments). Hook this up to your activity feed when you’re ready.
            </Typography>
          )}
        </SectionCard>
      </Box>
    </Container>
  );
}