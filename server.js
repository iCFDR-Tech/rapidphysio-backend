const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

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

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Error:', err));

// API routes
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

const testimonialRoutes = require('./routes/testimonials');
app.use('/api/testimonials', testimonialRoutes);

// ✅ Root route to prevent "Cannot GET /" error
app.get('/', (req, res) => {
    res.send('Rapid Physio Backend is running 🚀');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
