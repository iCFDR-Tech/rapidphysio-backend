const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^\d{10}$/ },
    date: { type: String, required: true },
    time: { type: String, required: true },
    city: { type: String, required: true },
    therapyType: { type: String, required: true },
    therapyMode: { type: String, required: true },
    paymentId: { type: String, required: true },
    bookingRef: { type: String, unique: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Confirmed',
    },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
