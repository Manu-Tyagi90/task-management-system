import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Schedule,
  Cancel,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import taskService from '../../services/taskService';

function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

const fetchStats = async () => {
  try {
    const response = await taskService.getTaskStats();
    setStats(response.data);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    // Set default values on error
    setStats({
      totalTasks: 0,
      tasksByStatus: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
      tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      overdueTasks: 0,
      completedThisWeek: 0
    });
  } finally {
    setLoading(false);
  }
};

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: <Assignment />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Completed',
      value: stats?.tasksByStatus?.completed || 0,
      icon: <AssignmentTurnedIn />,
      color: '#388e3c',
      bgColor: '#e8f5e9',
    },
    {
      title: 'In Progress',
      value: stats?.tasksByStatus?.in_progress || 0,
      icon: <Schedule />,
      color: '#f57c00',
      bgColor: '#fff3e0',
    },
    {
      title: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: <Cancel />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your task management system
        </Typography>
      </Box>

      {/* Stats Grid */}
      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}99 100%)`,
                  border: `1px solid ${card.color}20`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: card.color,
                        color: 'white',
                        display: 'flex',
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/tasks/new')}
                fullWidth
              >
                Create New Task
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => navigate('/tasks')}
                fullWidth
              >
                View All Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Task Priority Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.tasksByPriority && Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                <Box key={priority} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                    {priority}:
                  </Typography>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.totalTasks) * 100 || 0}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={
                        priority === 'urgent' ? 'error' :
                        priority === 'high' ? 'warning' :
                        priority === 'medium' ? 'info' : 'success'
                      }
                    />
                  </Box>
                  <Typography variant="body2">{count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label={`${stats?.completedThisWeek || 0} completed this week`}
                color="success"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your task completion rate and recent updates will appear here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;