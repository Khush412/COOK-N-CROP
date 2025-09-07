import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';

const AddressForm = ({ address: initialAddress, onSubmit, onCancel }) => {
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        label: '',
        isDefault: false,
    });

    useEffect(() => {
        if (initialAddress) {
            setAddress(initialAddress);
        }
    }, [initialAddress]);

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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                {initialAddress ? 'Edit Address' : 'Add New Address'}
            </Typography>
            <TextField
                label="Street"
                name="street"
                value={address.street}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="City"
                name="city"
                value={address.city}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="State"
                name="state"
                value={address.state}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Zip Code"
                name="zipCode"
                value={address.zipCode}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Country"
                name="country"
                value={address.country}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Label (e.g., Home, Work)"
                name="label"
                value={address.label}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={address.isDefault}
                        onChange={handleChange}
                        name="isDefault"
                    />
                }
                label="Set as default address"
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                    {initialAddress ? 'Update Address' : 'Add Address'}
                </Button>
                <Button type="button" variant="outlined" onClick={onCancel}>
                    Cancel
                </Button>
            </Box>
        </Box>
    );
};

export default AddressForm;
