import { Grid } from '@mui/material'
import UserWalletAssets from './UserWalletAssets'
import UserPlatformAssets from './UserPlatformAssets'
import UserLoanHealth from './UserLoanHealth'

const Statistics = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <UserWalletAssets />
            </Grid>
            <Grid item xs={4}>
                <UserPlatformAssets />
            </Grid>
            <Grid item xs={4}>
                <UserLoanHealth />
            </Grid>
        </Grid>
    )
}

export default Statistics