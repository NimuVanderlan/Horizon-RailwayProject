//the ticket model
const mongoose=require('mongoose');
const ticketSchema=new mongoose.Schema({
	ticketId:{type:Number,required:true,unique:true},
	booking:{type:mongoose.Schema.Types.ObjectId, ref: 'Booking'},
	scheduledRoute:{type: mongoose.Schema.Types.ObjectId, ref:'ScheduledRoute',required: true},
	classType:{type:String, enum:['businessclass','economyclass'],required: true},
	price:{type:Number, required:true},
	seatNum:{type: String},
	qr:{type: String,unique:true},
	valid:{type: Boolean, default:true},
},{timestamps:true});

const Ticket=mongoose.model('Ticket',ticketSchema);
module.exports=Ticket;
