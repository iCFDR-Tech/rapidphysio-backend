const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// === Middleware ===
const allowedOrigins = [
    "https://rapidphysio.in",
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
    .then(() => console.log(`✅ MongoDB Connected to database: ${mongoose.connection.name}`))
    .catch((err) => console.error('❌ MongoDB Error:', err));


// === Routes ===
// app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.send('Rapid Physio Backend is running 🚀');
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
