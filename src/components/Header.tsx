import { AppBar, Toolbar, Typography } from '@mui/material';
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

const Header = () => {
    return (
        <header>
            <AppBar className='pb-10' position="relative">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Serum Lending
                    </Typography>
                    <WalletMultiButton />
                </Toolbar>
            </AppBar>
        </header>
    )
}

export default Header;