import { Grid } from '@mui/material'
import UserWalletAssets from './UserWalletAssets'
import UserPlatformAssets from './UserPlatformAssets'

const Statistics = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <UserWalletAssets />
            </Grid>
            <Grid item xs={6}>
                <UserPlatformAssets />
            </Grid>
        </Grid>
    )
}

export default Statistics