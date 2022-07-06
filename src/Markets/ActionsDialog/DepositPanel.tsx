import { Box, Typography, TextField, Stack, Button } from '@mui/material';

export function DepositPanel(props: { index: number, value: number }) {
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
                        <Typography>Deposit: Token</Typography>
                        <TextField id="outlined-basic" label="Value" variant="outlined" />
                        <Button variant="contained">Deposit</Button>
                    </Stack>
                </Box>
            )
            }
        </div >
    );
}