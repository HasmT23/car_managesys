import { Source_Code_Pro } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from '../src/theme'; // Adjust this import path if necessary

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
})

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main className={sourceCodePro.className}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default MyApp