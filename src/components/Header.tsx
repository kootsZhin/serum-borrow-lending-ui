import { AppBar, Typography, Toolbar, Button } from '@mui/material'
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

const Header = () => {
    return (
        <header>
            <AppBar className='pb-10' position="relative">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Solana Lending
                    </Typography>
                    <WalletMultiButton />
                </Toolbar>
            </AppBar>
        </header>
    )
}

export default Header;