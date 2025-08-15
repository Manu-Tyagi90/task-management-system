import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
  Chip,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  NotificationsActive,
  Email,
  DesktopWindows,
  Shield,
  Person,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';

/* --------- Reusable Section Card (keeps cards equal height) --------- */
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

export default function Settings() {
  const dispatch = useDispatch();
  const themeMode = useSelector((s) => s.theme.mode);
  const user = useSelector((s) => s.auth.user);

  // Local preferences (mock; wire to API as needed)
  const [emailNotif, setEmailNotif] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleSavePreferences = () => {
    // TODO: call backend to persist notification prefs
    // You can use enqueueSnackbar here if you prefer feedback
    console.log('Saved preferences', {
      emailNotif,
      browserNotif,
      productUpdates,
      securityAlerts,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Settings
      </Typography>

      {/* Responsive grid that keeps cards “justified” and same height */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* Appearance */}
        <SectionCard
          id="appearance"
          title="Appearance"
          action={
            <Chip
              icon={themeMode === 'dark' ? <DarkMode /> : <LightMode />}
              label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              color={themeMode === 'dark' ? 'default' : 'primary'}
              variant="outlined"
            />
          }
        >
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Switch between light and dark themes for a comfortable viewing experience.
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={() => dispatch(toggleTheme())}
                  />
                }
                label={themeMode === 'dark' ? 'Dark mode enabled' : 'Enable dark mode'}
              />
            </FormGroup>

            <Box sx={{ mt: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                Theme applies across the entire app instantly.
              </Typography>
            </Box>
          </Stack>
        </SectionCard>

        {/* Notifications */}
        <SectionCard id="notifications" title="Notifications">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Choose how you’d like to be notified about your tasks.
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">Email notifications</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={browserNotif}
                    onChange={(e) => setBrowserNotif(e.target.checked)}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DesktopWindows fontSize="small" color="action" />
                    <Typography variant="body2">Browser notifications</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productUpdates}
                    onChange={(e) => setProductUpdates(e.target.checked)}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationsActive fontSize="small" color="action" />
                    <Typography variant="body2">Product updates</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Shield fontSize="small" color="action" />
                    <Typography variant="body2">Security alerts</Typography>
                  </Stack>
                }
              />
            </FormGroup>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 'auto' }}>
              <Button variant="contained" onClick={handleSavePreferences} sx={{ textTransform: 'none' }}>
                Save Preferences
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        {/* Account (read-only) */}
        <SectionCard id="account" title="Account">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your account details and status.
            </Typography>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600}>
                {user?.name || '-'}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Email fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600} noWrap>
                {user?.email || '-'}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Shield fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={600}>
                {user?.role || 'user'}
              </Typography>
            </Stack>

            <Box sx={{ mt: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </Typography>
            </Box>
          </Stack>
        </SectionCard>

        {/* Optional: Preferences summary or Advanced section */}
        <SectionCard id="advanced" title="Advanced">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Additional settings can live here—API tokens, integrations, or data export.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 'auto' }}>
              <Chip label="API access: Enabled" size="small" variant="outlined" />
              <Chip label="2FA: Optional" size="small" variant="outlined" />
              <Chip label="Region: Default" size="small" variant="outlined" />
            </Stack>
          </Stack>
        </SectionCard>
      </Box>
    </Container>
  );
}