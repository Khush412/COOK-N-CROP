const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, async (req, res) => {
    const { street, city, state, zipCode, country, label, isDefault } = req.body;

    try {
        const address = new Address({
            user: req.user.id,
            street,
            city,
            state,
            zipCode,
            country,
            label,
            isDefault,
        });

        const createdAddress = await address.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { street, city, state, zipCode, country, label, isDefault } = req.body;

    try {
        let address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Make sure user owns address
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this address' });
        }

        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zipCode = zipCode || address.zipCode;
        address.country = country || address.country;
        address.label = label || address.label;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Make sure user owns address
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this address' });
        }

        await address.deleteOne();
        res.json({ message: 'Address removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
