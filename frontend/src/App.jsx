import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getTheme } from './theme';

// Import pages (we'll create these next)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  const themeMode = useSelector((state) => state.theme.mode);
  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;