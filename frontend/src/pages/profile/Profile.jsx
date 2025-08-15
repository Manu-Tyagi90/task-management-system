import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Profile() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">My Profile</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Profile page - Coming soon!
        </Typography>
      </Paper>
    </Container>
  );
}

export default Profile;