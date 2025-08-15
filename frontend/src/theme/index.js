import { createTheme } from '@mui/material/styles';

// Light theme colors
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#e33371',
    dark: '#9a0036',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  success: {
    main: '#2e7d32',
  },
  warning: {
    main: '#ed6c02',
  },
  error: {
    main: '#d32f2f',
  },
};

// Dark theme colors
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
  },
  secondary: {
    main: '#f48fb1',
    light: '#ffc1e3',
    dark: '#bf5f82',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  success: {
    main: '#66bb6a',
  },
  warning: {
    main: '#ffa726',
  },
  error: {
    main: '#f44336',
  },
};

export const getTheme = (mode = 'light') => {
  return createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0 2px 12px rgba(0,0,0,0.08)' 
              : '0 2px 12px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};