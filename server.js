const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: "https://rapidphysio.samskara.org.in"
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Error:', err));

// Existing routes
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

// ✅ New testimonial routes
const testimonialRoutes = require('./routes/testimonials');
app.use('/api/testimonials', testimonialRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
