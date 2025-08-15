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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Email, Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import authService from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const schema = yup.object({
  name: yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'At least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/, 'Use letters and numbers')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
  terms: yup.boolean().oneOf([true], 'Please accept the terms'),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      const res = await authService.register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      dispatch(loginSuccess(res.data));
      enqueueSnackbar('Account created!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us and start tracking your tasks
            </Typography>
          </Box>

          <Divider sx={{ width: '100%' }} />

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            <Stack spacing={2} alignItems="center">
              <TextField
                label="Full Name"
                fullWidth
                autoComplete="name"
                autoFocus
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email"
                fullWidth
                autoComplete="email"
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
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
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
                        onClick={() => setShowPwd((v) => !v)}
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                fullWidth
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        edge="end"
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Centered Terms row */}
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <FormControlLabel
                  control={<Checkbox {...register('terms')} />}
                  label={
                    <Typography variant="body2" color={errors.terms ? 'error' : 'text.secondary'}>
                      I agree to the Terms and Conditions
                    </Typography>
                  }
                />
              </Box>
              {errors.terms && (
                <Typography variant="caption" color="error" textAlign="center" sx={{ mt: -1 }}>
                  {errors.terms.message}
                </Typography>
              )}

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
                {submitting ? 'Creating…' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ width: '100%' }} />

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}