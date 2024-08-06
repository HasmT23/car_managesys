"use client"; // Add this line to ensure the file is treated as a client component

import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: '"Source Code Pro", monospace',
    allVariants: {
      fontFamily: '"Source Code Pro", monospace',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * {
          font-family: "Source Code Pro", monospace !important;
        }
      `,
    },
  },
});

export { darkTheme };