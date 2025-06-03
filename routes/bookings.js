const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.post('/create', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ message: 'Booking stored successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error storing booking', error: err });
    }
});

module.exports = router;
