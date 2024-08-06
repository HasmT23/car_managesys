"use client"; // Add this line to ensure the file is treated as a client component

import '../public/fonts.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme } from '../src/theme'; // Adjust the path to your theme file

export function RootLayoutClient({ children }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}