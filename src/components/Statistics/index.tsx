import { Grid } from '@mui/material'
import PoolOverview from './PoolOverview'
import UserPlatformAssets from './UserPlatformAssets'

const Statistics = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <PoolOverview />
            </Grid>
            <Grid item xs={6}>
                <UserPlatformAssets />
            </Grid>
        </Grid>
    )
}

export default Statistics