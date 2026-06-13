//The route model for scheduledRoute(The routes where the trains are assigned)

const mongoose = require('mongoose');
const scheduledRouteSchema = new mongoose.Schema({

	scheduledRouteId: {type: Number, required: true, unique: true},
	route: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
	train: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Train' }],
	departureTime: {type: Date, required: true},
	arrivalTime: {type: Date,required: true},
	price: {
		buisnessclass: {type: Number, required: true},
		economyclass: {type: Number,required: true},
	}
	seats:{
		buisnessclass:{
			total: {type:Number,required: true},
			available: {type: Number,required: true},
		},
		economyclass:{
			total: {type: Number,required: true},
			available: {type: Number,required: true},
		}

	},
	status: {type: String,enum:['onTime','delayed','cancelled'],required: true},
}.{timestamps: true});

const ScheduledRoute = mongoose.model('ScheduledRoute',scheduledRouteSchema);
module.exports = ScheduledRoute;
