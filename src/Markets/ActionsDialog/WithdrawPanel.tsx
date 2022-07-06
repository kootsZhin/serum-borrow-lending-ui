import { Box, Typography, TextField, Stack, Button, Switch, Grid } from '@mui/material';

export function WithdrawPanel(props: { index: number, market: string, value: number }) {
    const { value, market, index, ...other } = props;

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
                        <TextField id="outlined-basic" label={`Enter ${market} Value`} variant="outlined" />
                        <Grid container>
                            <Grid item >
                                <Typography>Borrow funds</Typography>
                            </Grid>
                            <Grid item >
                                <Switch />
                            </Grid>
                        </Grid>
                        <Button variant="contained">Withdraw</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}