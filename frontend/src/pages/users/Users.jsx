import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Users() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">User Management</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          User management page - Coming soon!
        </Typography>
      </Paper>
    </Container>
  );
}

export default Users;