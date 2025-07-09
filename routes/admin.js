const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Booking = require('../models/Booking');
const Testimonial = require('../models/Testimonial');
const { auth, authorizeRoles } = require('../auth');
require('dotenv').config();

// 🔐 Admin Login with JWT
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        return res.json({ success: true, token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

// 📋 Get all bookings
router.get('/bookings', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// ❌ Delete single booking
router.delete('/bookings/:id', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete booking' });
    }
});

// ❌ Delete all bookings
router.delete('/bookings', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        await Booking.deleteMany();
        res.json({ message: 'All bookings deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete all bookings' });
    }
});

// 📋 Get all feedbacks
router.get('/feedbacks', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        const feedbacks = await Testimonial.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedbacks' });
    }
});

// ❌ Delete single feedback
router.delete('/feedbacks/:id', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete feedback' });
    }
});

// ❌ Delete all feedbacks
router.delete('/feedbacks', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        await Testimonial.deleteMany();
        res.json({ message: 'All feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete all feedbacks' });
    }
});

module.exports = router;
