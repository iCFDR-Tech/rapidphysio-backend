// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// dotenv.config();
// const app = express();
// const port = process.env.PORT || 5000;

// const allowedOrigins = [
//     "https://rapidphysio.samskara.org.in", // production
//     "http://localhost:3000"                 // development
// ];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     }
// }));

// app.use(bodyParser.json());

// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log('MongoDB Connected'))
//     .catch((err) => console.error('MongoDB Error:', err));

// // API routes
// const bookingRoutes = require('./routes/bookings');
// app.use('/api/bookings', bookingRoutes);

// const testimonialRoutes = require('./routes/testimonials');
// app.use('/api/testimonials', testimonialRoutes);

// // ✅ Root route to prevent "Cannot GET /" error
// app.get('/', (req, res) => {
//     res.send('Rapid Physio Backend is running 🚀');
// });

// app.listen(port, () => console.log(`Server running on port ${port}`));


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CORS config
const allowedOrigins = [
    "https://rapidphysio.samskara.org.in", // production
    "http://localhost:3000"                 // development
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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Error:', err));

// === Razorpay Order Route ===
app.post('/api/razorpay/order', async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
    }

    try {
        const options = {
            amount: amount * 100, // amount in paise
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ Razorpay Order Error:', error);
        res.status(500).json({ message: 'Failed to create Razorpay order', error });
    }
});

// === API Routes ===
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

const testimonialRoutes = require('./routes/testimonials');
app.use('/api/testimonials', testimonialRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Rapid Physio Backend is running 🚀');
});

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
