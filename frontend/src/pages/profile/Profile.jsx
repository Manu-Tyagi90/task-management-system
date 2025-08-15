import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Chip,
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  CalendarMonth,
  AdminPanelSettings,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import authService from '../../services/authService';
import { loginSuccess } from '../../store/slices/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state) => state.auth.user);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async () => {
    try {
      const response = await authService.updateProfile(formData);
      dispatch(loginSuccess({ 
        user: response.data.user,
        accessToken: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken')
      }));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      setEditing(false);
    } catch (error) {
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to change password', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Chip
              icon={user?.role === 'admin' ? <AdminPanelSettings /> : <Person />}
              label={user?.role}
              color={user?.role === 'admin' ? 'error' : 'default'}
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>

        {/* Account Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Account Information</Typography>
              {!editing && (
                <IconButton onClick={() => setEditing(true)}>
                  <Edit />
                </IconButton>
              )}
            </Box>

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: user?.name || '', email: user?.email || '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            ) : (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Name" secondary={user?.name} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={user?.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText primary="Role" secondary={user?.role} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            )}
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                type="password"
                label="Current Password"
                fullWidth
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
              <TextField
                type="password"
                label="New Password"
                fullWidth
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <TextField
                type="password"
                label="Confirm New Password"
                fullWidth
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;