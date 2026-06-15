const mongoose = require('mongoose');
const addressSchema = require('./address');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    
    email: {type: String, required: true, unique: true},
    
    phoneNumber: {type: String, required: true},

    address: {type: addressSchema, required: false},
    
    password: {type: String, required: true},
    
    role: {type: String, enum: ['customer', 'admin', 'networkManager', 'ticketInspector', 'freightOperator'], required: true},
    
    //for now we implement only english
    language: {type: String, default: 'EN'},
    
    loyaltyPoints: {type: Number, default: 0},
    
    bookings: [{type: mongoose.Schema.Types.ObjectId, ref: 'Booking'}],
    
    //unneccesary for our system tho
    inspectorId: {type: Number},
});

const User = mongoose.model('User', userSchema);
module.exports = User;
