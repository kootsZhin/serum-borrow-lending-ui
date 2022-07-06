import { Box, Typography, TextField, Stack, Button } from '@mui/material';

export function DepositPanel(props: { index: number, market: string, value: number }) {
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
                        <Button variant="contained">Deposit</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}