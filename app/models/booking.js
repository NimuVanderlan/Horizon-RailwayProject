//route model for the booking class(connects scheduledRoute + customer)

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
	bookingId: {type: Number, required:true, unique:true},
	customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true},
	scheduledRoute :[{type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledRoute',required: true}],
	bookingDate: {type:Date, default:Date.now},
	bstatus: {type:String,enum:['confirmed','cancelled'],default: 'confirmed'},
	ticket: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ticket',required: true}],
	price: {type:Number},
},{timestamps: true});


const Booking=mongoose.model('Booking',bookingSchema);
module.exports = Booking;
