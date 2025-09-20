import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel, Grid, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const AddressForm = ({ address: initialAddress, onSubmit, onCancel }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [address, setAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        label: '',
        isDefault: false,
    });

    useEffect(() => {
        if (initialAddress) {
            setAddress({
                fullName: initialAddress.fullName || '',
                street: initialAddress.street || '',
                city: initialAddress.city || '',
                state: initialAddress.state || '',
                zipCode: initialAddress.zipCode || '',
                country: initialAddress.country || '',
                phone: initialAddress.phone || '',
                label: initialAddress.label || '',
                isDefault: initialAddress.isDefault || false,
            });
        } else {
            // Reset and pre-fill with user's name if available
            setAddress({
                fullName: user?.username || '',
                street: '', city: '', state: '', zipCode: '', country: '', phone: '', label: '', isDefault: false,
            });
        }
    }, [initialAddress, user]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(address);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                {initialAddress ? 'Edit Address' : 'Add New Address'}
            </Typography>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <TextField label="Full Name" name="fullName" value={address.fullName} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={12}>
                    <TextField label="Street Address" name="street" value={address.street} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="City" name="city" value={address.city} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="State / Province" name="state" value={address.state} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="Zip / Postal Code" name="zipCode" value={address.zipCode} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="Country" name="country" value={address.country} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="Phone Number" name="phone" value={address.phone} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField label="Label (e.g., Home, Work)" name="label" value={address.label} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item size={12}>
                    <FormControlLabel
                        control={<Checkbox checked={address.isDefault} onChange={handleChange} name="isDefault" />}
                        label={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>Set as default address</Typography>}
                    />
                </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button type="submit" variant="contained" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 3 }}>
                    {initialAddress ? 'Update Address' : 'Save Address'}
                </Button>
                <Button type="button" variant="outlined" onClick={onCancel} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 3 }}>
                    Cancel
                </Button>
            </Stack>
        </Box>
    );
};

export default AddressForm;
