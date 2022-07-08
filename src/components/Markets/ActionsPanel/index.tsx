import { Dialog, Box, Tabs, Tab } from '@mui/material';
import * as React from 'react';
import { DepositPanel } from './DepositPanel';
import { WithdrawPanel } from './WithdrawPanel';
import { RepayPanel } from './RepayPanel';
import { BorrowPanel } from './BorrowPanel';

function a11yProps(index: number) {
    return {
        id: `actions-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export function ActionsPanel(props: { open: boolean, asset: string, onClose: () => void }) {
    const { onClose, asset, open } = props;

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
                    <Tab label="Repay" {...a11yProps(1)} />
                    <Tab label="Withdraw" {...a11yProps(2)} />
                    <Tab label="Borrow" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <DepositPanel value={value} index={0} asset={asset} />
            <RepayPanel value={value} index={1} asset={asset} />
            <WithdrawPanel value={value} index={2} asset={asset} />
            <BorrowPanel value={value} index={3} asset={asset} />
        </Dialog>
    );
}
