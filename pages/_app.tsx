import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppBar, Typography, IconButton, Toolbar, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Solana Lending
          </Typography>
          <Button color="inherit">Connect Wallet</Button>
        </Toolbar>
      </AppBar>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
