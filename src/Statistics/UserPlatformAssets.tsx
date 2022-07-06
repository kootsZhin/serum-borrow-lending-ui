import { Card, Grid, Typography } from '@mui/material'
import { useState, useEffect } from 'react';

function getDeposited() {
    return 0;
}

function getBorrowed() {
    return 0;
}

const UserPlatformAssets = () => {
    const [deposited, setDeposited] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [loanHealth, setLoanHealth] = useState(100);

    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My platform assets
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Deposited:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Borrowed:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Loan Health:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        ${deposited}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        ${borrowed}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        {loanHealth}%
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}

export default UserPlatformAssets;