const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// POST a testimonial
router.post('/', async (req, res) => {
    try {
        const { name, email, feedback, rating } = req.body;
        console.log(req.body);

        if (!name || !email || !feedback || !rating) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const testimonial = new Testimonial({ name, email, feedback, rating });
        await testimonial.save();
        res.status(201).json(testimonial);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
