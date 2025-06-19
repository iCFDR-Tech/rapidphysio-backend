const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
require('dotenv').config();

// ✅ Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Create Razorpay Order
router.post("/create-order", async (req, res) => {
    const { amount, bookingData } = req.body;

    if (!amount || !bookingData) {
        return res.status(400).json({ message: "Missing payment or booking data" });
    }

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount should be in paise (₹100 = 10000)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                name: bookingData.name || '',
                email: bookingData.email || '',
                phone: bookingData.phone || '',
                date: bookingData.date || '',
                time: bookingData.time || '',
                city: bookingData.city || '',
                therapyType: bookingData.therapyType || ''
            },
        });

        res.status(201).json(order);
    } catch (err) {
        console.error("❌ Razorpay order creation failed:", err);
        res.status(500).json({ message: "Order creation failed", error: err.message });
    }
});


// ✅ 2. Verify Razorpay Payment & Save Booking
router.post('/verify-payment', async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        bookingData
    } = req.body;

    // ⚠️ Validate incoming data
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingData) {
        return res.status(400).json({ message: 'Missing payment or booking data' });
    }

    try {
        // 🔐 Verify Razorpay Signature
        const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signBody)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            console.warn("❌ Signature mismatch");
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // ✅ Signature valid — now store booking
        const booking = new Booking({
            ...bookingData,
            paymentId: razorpay_payment_id,
            status: 'Confirmed',
        });

        const savedBooking = await booking.save();

        return res.status(201).json({
            message: '✅ Payment verified & booking stored!',
            booking: savedBooking,
        });

    } catch (err) {
        console.error('❌ Error verifying/storing booking:', err);
        res.status(500).json({ message: 'Server error during payment verification', error: err });
    }
});

module.exports = router;
