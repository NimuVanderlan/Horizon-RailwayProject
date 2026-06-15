const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainId: {type: Number, required: true, unique: true},
    
    //is this freccia rossa or regional?
    model: {type: String, required: true},
    
    capacity: {type: Number, required: true},
    
    availableSeats: {type: Number, required: true},
    
    //this could be removed maybe
    status: {type: String, enum: ['operational', 'maintenance'], required: true},
    
    delayMinutes: { type: Number, default: 0},
    
    //where the train is right now
    homeStation: {type: mongoose.Schema.Types.ObjectId, ref: 'Station'},
});

module.exports = mongoose.model('Train', trainSchema);
