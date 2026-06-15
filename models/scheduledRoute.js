const mongoose = require('mongoose');

const scheduledRouteSchema = new mongoose.Schema({
    
    //must contain a route, a train for that route and
    //a price for that trip depeding on the class chosen
    //and whethere there is a delay
    
    scheduledRouteId: {type: Number, required: true, unique: true},
    
    route: {type: mongoose.Schema.Types.ObjectId, ref: 'Route'},
    
    train: {type: mongoose.Schema.Types.ObjectId, ref: 'Train'},
    
    departureTime: {type: Date, required: true},
    
    arrivalTime: {type: Date, required: true},
    
    price: {
        businessclass: {type: Number, required: true},
        economyclass: {type: Number, required: true},
    },
    
    seats: {
        businessclass: {
            total: {type: Number, required: true},
            available: {type: Number, required: true},
        },
        economyclass: {
            total: {type: Number, required: true },
            available: {type: Number, required: true},
        },
    },
    
    ticketPrice: {type: Number},
    
    status: {type: String, enum: ['onTime', 'delayed', 'cancelled'], required: true, default: 'onTime' },
}, {timestamps: true});

//we need some methodes for getting the diparture + delay and arrival time, and also the duration

scheduledRouteSchema.methods.getEffectiveDepartureTime = function () {
    
    const delayMinutes =
    this.train?.delayMinutes || 0;
    const d = new Date(this.departureTime);
    d.setMinutes(d.getMinutes() + delayMinutes);
    return d;
    
};

scheduledRouteSchema.methods.getEffectiveArrivalTime = function () {
    
    const delayMinutes = this.train?.delayMinutes || 0;
    const d = new Date(this.arrivalTime);
    d.setMinutes(d.getMinutes() + delayMinutes);
    return d;
    
};

scheduledRouteSchema.methods.getDurationMinutes = function () {
    
    //because javascript has time in MILLISECONDS
    return (this.arrivalTime - this.departureTime) / 60000;
};

const ScheduledRoute = mongoose.model('ScheduledRoute', scheduledRouteSchema);
module.exports = ScheduledRoute;
