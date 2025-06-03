const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    city: String,
    therapyType: String,
    time: String,
    paymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
