const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// === Middleware ===
const allowedOrigins = [
    "https://rapidphysio.kashiseva108.com/",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use(bodyParser.json());

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Error:', err));

// === API Routes ===
const bookingRoutes = require('./routes/bookings');
const testimonialRoutes = require('./routes/testimonials');
const paymentRoutes = require('./routes/payment'); // 🔁 Your Razorpay payment logic (create & verify)

app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/payment', paymentRoutes); // ✅ Add this line for Razorpay integration

// === Root Route ===
app.get('/', (req, res) => {
    res.send('Rapid Physio Backend is running 🚀');
});

// === Start Server ===
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
