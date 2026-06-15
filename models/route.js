const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    //route should have ID, departure/ arrival station, ditance
	routeId: {type: Number, required: true, unique: true},
    
	departureStation: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true
    },
    
	arrivalStation: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true
    },
    
	distance: {type:Number},

},{timestamps: true});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
