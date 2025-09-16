const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Counter = require("../models/Counter"); 
const sendBookingTicketEmail = require("../utils/mailer");
require("dotenv").config();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------- 1️⃣ Get Razorpay public key -------------------
router.get("/razorpay-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// ------------------- 2️⃣ Create Razorpay Order -------------------
router.post("/create-order", async (req, res) => {
  const { amount, bookingData } = req.body;
  if (!amount || !bookingData) {
    return res.status(400).json({ message: "Missing amount or bookingData" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: bookingData,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Razorpay order creation failed:", err);
    res.status(500).json({ message: "Order creation failed", error: err.message });
  }
});

// ------------------- 3️⃣ Generate Professional Booking Reference -------------------
async function generateBookingRef() {
  const year = new Date().getFullYear();

  // Increment counter in a separate collection
  const counter = await Counter.findOneAndUpdate(
    { name: "booking" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNumber = String(counter.seq).padStart(4, "0");
  return `RAPID-${year}-${seqNumber}`;
}

// ------------------- 4️⃣ Verify Payment & Save Booking -------------------
router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingData) {
    return res.status(400).json({ message: "Missing data for verification" });
  }

  try {
    // 🔐 Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Generate booking reference
    const bookingRef = await generateBookingRef();

    // ✅ Save booking
    const booking = new Booking({
      ...bookingData,
      paymentId: razorpay_payment_id,
      bookingRef,
      status: "Confirmed",
    });
    const savedBooking = await booking.save();


    // ✅ Send PDF ticket via email
    await sendBookingTicketEmail(savedBooking);

    res.status(201).json({
      message: "Payment verified & booking saved",
      booking: savedBooking,
    });
  } catch (err) {
    console.error("❌ Error verifying payment:", err);
    res.status(500).json({
      message: "Payment verification failed",
      error: err.message,
    });
  }
});

module.exports = router;
