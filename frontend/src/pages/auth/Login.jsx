import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Email, Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import authService from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 characters').required('Password is required'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      dispatch(loginStart());
      const res = await authService.login(data.email.trim(), data.password);
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      dispatch(loginSuccess(res.data));
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, width: '100%', maxWidth: 480 }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access your account to manage tasks
            </Typography>
          </Box>

          <Divider sx={{ width: '100%' }} />

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            <Stack spacing={2} alignItems="center">
              <TextField
                label="Email"
                fullWidth
                autoComplete="email"
                autoFocus
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit button centered */}
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  textTransform: 'none',
                  width: { xs: '100%', sm: 260 },
                }}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ width: '100%' }} />

          <Typography variant="body2" color="text.secondary">
            Don’t have an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Create one
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}