//Route model-Represents the paths going to be covered in the system

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
	routeId: {type: Number, required: true, unique: true},
	departureStation: {type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true},
	arrivalStation: {type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true},
	distance: {type:Number},

},{timestamps: true});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
