import { Dialog, Box, Tabs, Tab } from '@mui/material';
import * as React from 'react';
import { DepositPanel } from './DepositPanel';
import { WithdrawPanel } from './WithdrawPanel';

function a11yProps(index: number) {
    return {
        id: `actions-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export function ActionsDialog(props: { open: boolean, market: string, onClose: () => void }) {
    const { onClose, market, open } = props;

    const handleClose = () => {
        onClose();
    };

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <Dialog onClose={handleClose} open={open}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="fullWidth" value={value} onChange={handleChange}>
                    <Tab label="Deposit" {...a11yProps(0)} />
                    <Tab label="Withdraw" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <DepositPanel value={value} index={0} market={market} />
            <WithdrawPanel value={value} index={1} market={market} />
        </Dialog>
    );
}
