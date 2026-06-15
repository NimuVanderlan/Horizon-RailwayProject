const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // in booking we need a scheduleRoute to book and a status of the booking and the actual ticket
    bookingId: {type: Number, required: true, unique: true },
    
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //costumer is just  a user
    
    scheduledRoutes: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledRoute', required: true
    }],
    
    bookingDate: {type: Date, default: Date.now },
    status: {type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    price: {type: Number, required: true },
    
    ticket: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true
    }],
    
    payment: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'},
    }, {timestamps: true});

module.exports = mongoose.model('Booking', bookingSchema);
