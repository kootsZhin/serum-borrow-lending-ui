import { Box, Typography, TextField, Stack, Button, Switch, Grid } from '@mui/material';

export function WithdrawPanel(props: { index: number, value: number }) {
    const { value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`action-tabpanel-${index}`}
            aria-labelledby={`action-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography>Withdraw: Token</Typography>
                        <TextField id="outlined-basic" label="Value" variant="outlined" />
                        <Grid container>
                            <Grid item spacing={3}>
                                <Typography>Borrow funds</Typography>
                            </Grid>
                            <Grid item spacing={6}>
                                <Switch />
                            </Grid>
                        </Grid>
                        <Button variant="contained">Withdraw</Button>
                    </Stack>
                </Box>
            )
            }
        </div >
    );
}