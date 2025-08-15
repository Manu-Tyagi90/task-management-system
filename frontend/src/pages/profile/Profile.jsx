import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  FormHelperText,
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
  Lock,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import authService from '../../services/authService';
import { loginSuccess } from '../../store/slices/authSlice';

function SectionCard({ title, action, children, id }) {
  return (
    <Paper component="section" aria-labelledby={id} elevation={2} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography id={id} variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {action || null}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}

function Profile() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state) => state.auth.user);

  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    error: '',
  });

  const resetProfile = () => {
    setFormData({ name: user?.name || '', email: user?.email || '' });
    setEditing(false);
  };

  const handleUpdateProfile = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      enqueueSnackbar('Name and email are required', { variant: 'warning' });
      return;
    }
    try {
      setSavingProfile(true);
      const response = await authService.updateProfile(formData);
      // keep tokens; refresh just the user
      dispatch(
        loginSuccess({
          user: response.data.user,
          accessToken: localStorage.getItem('token'),
          refreshToken: localStorage.getItem('refreshToken'),
        })
      );
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      setEditing(false);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update profile', { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    // simple checks; align helper text below fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordData((s) => ({ ...s, error: 'All password fields are required' }));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordData((s) => ({ ...s, error: 'New password must be at least 6 characters' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordData((s) => ({ ...s, error: 'Passwords do not match' }));
      return;
    }

    try {
      setChangingPwd(true);
      await authService.changePassword({ currentPassword, newPassword });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', error: '' });
    } catch (error) {
      setPasswordData((s) => ({
        ...s,
        error: error?.response?.data?.message || 'Failed to change password',
      }));
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Left: Profile summary card */}
        <Grid item xs={12} md={4} display="flex">
          <Paper elevation={2} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, width: '100%' }}>
            <Stack alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'primary.main',
                  fontSize: 40,
                }}
                aria-label="Profile avatar"
              >
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.5} alignItems="center" sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} noWrap maxWidth={280}>
                  {user?.name || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap maxWidth={280}>
                  {user?.email || '-'}
                </Typography>
                <Chip
                  size="small"
                  icon={user?.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                  label={user?.role || 'user'}
                  color={user?.role === 'admin' ? 'error' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              </Stack>

              <Divider sx={{ width: '100%', my: 2 }} />

              <List dense sx={{ width: '100%' }}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Badge fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Role" secondary={user?.role || '-'} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarMonth fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={
                      user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={user?.email || '-'} />
                </ListItem>
              </List>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Account info + Change password (stacked) */}
        <Grid item xs={12} md={8} display="flex" flexDirection="column" gap={3}>
          {/* Account Information */}
          <SectionCard
            id="account-info"
            title="Account Information"
            action={
              !editing ? (
                <IconButton
                  aria-label="Edit profile"
                  onClick={() => setEditing(true)}
                  size="small"
                >
                  <Edit />
                </IconButton>
              ) : null
            }
          >
            {editing ? (
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                  fullWidth
                  autoComplete="name"
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                  fullWidth
                  autoComplete="email"
                />

                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 0.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={resetProfile}
                    disabled={savingProfile}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleUpdateProfile}
                    disabled={savingProfile}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {user?.name || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={600} noWrap>
                      {user?.email || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            )}
          </SectionCard>

          {/* Change Password */}
          <SectionCard id="security" title="Security">
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((s) => ({ ...s, currentPassword: e.target.value, error: '' }))
                }
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Lock fontSize="small" />
                    </ListItemIcon>
                  ),
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((s) => ({ ...s, newPassword: e.target.value, error: '' }))
                  }
                  fullWidth
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((s) => ({ ...s, confirmPassword: e.target.value, error: '' }))
                  }
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>

              {passwordData.error ? (
                <FormHelperText error sx={{ mt: -0.5 }}>
                  {passwordData.error}
                </FormHelperText>
              ) : null}

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={changingPwd}
                  sx={{ textTransform: 'none' }}
                >
                  Change Password
                </Button>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;