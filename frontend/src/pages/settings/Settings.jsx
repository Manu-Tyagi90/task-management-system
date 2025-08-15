import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { toggleTheme } from '../../store/slices/themeSlice';

function Settings() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary="Switch between light and dark theme"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={themeMode === 'dark'}
                onChange={handleThemeToggle}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive email updates for task assignments"
            />
            <ListItemSecondaryAction>
              <Switch defaultChecked color="primary" />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Browser Notifications"
              secondary="Show desktop notifications for real-time updates"
            />
            <ListItemSecondaryAction>
              <Switch color="primary" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Account Type"
              secondary={user?.role === 'admin' ? 'Administrator' : 'Standard User'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Account Status"
              secondary="Active"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="API Access"
              secondary="Enabled"
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}

export default Settings;