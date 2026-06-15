const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    //this might be not neccessary if we dont implement this
    
    paymentId: {type: Number, required: true, unique: true},
    
    amount: {type: Number, required: true},
    
    paymentMethod: {type: String, required: true },
    
    paymentStatus: {
        type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING'
    },
}, {timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
