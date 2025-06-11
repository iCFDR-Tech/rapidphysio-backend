// const express = require('express');
// const router = express.Router();
// const Booking = require('../models/Booking');

// router.post('/create', async (req, res) => {
//     try {
//         const booking = new Booking(req.body);
//         await booking.save();
//         res.status(201).json({ message: 'Booking stored successfully!' });
//     } catch (err) {
//         res.status(500).json({ message: 'Error storing booking', error: err });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Booking = require('../models/Booking');
require('dotenv').config();

router.post('/create', async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        bookingData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingData) {
        return res.status(400).json({ message: 'Missing payment or booking data' });
    }

    // Generate expected signature
    const signBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(signBody)
        .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
    }

    try {
        // Save booking if payment is verified
        const booking = new Booking({
            ...bookingData,
            paymentId: razorpay_payment_id,
            status: 'Confirmed' // ✅ Explicitly set status
        });
        await booking.save();

        res.status(201).json({ message: '✅ Payment verified & booking stored!', booking });
    } catch (err) {
        console.error('Error saving booking:', err);
        res.status(500).json({ message: 'Error storing booking', error: err });
    }
});

module.exports = router;


