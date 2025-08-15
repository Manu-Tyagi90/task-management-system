import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Settings() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">Settings</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Settings page - Coming soon!
        </Typography>
      </Paper>
    </Container>
  );
}

export default Settings;