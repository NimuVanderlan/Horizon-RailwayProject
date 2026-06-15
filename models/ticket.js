const mongoose=require('mongoose');
const ticketSchema=new mongoose.Schema({
	ticketId: {type:Number,required:true,unique:true},
    
	booking: {type:mongoose.Schema.Types.ObjectId, ref: 'Booking',required: true},
    
	scheduledRoute: {type: mongoose.Schema.Types.ObjectId, ref:'ScheduledRoute',required: true},
    
	class: {type:String, enum:['businessClass','economyClass'],required: true},
    
	price: {type:Number, required:true},
	
    seatNum: {type: String},
    
    //not necessary qr code
	qr: {type: String,unique:true},
    
    //validity of the ticket (we may remove)
	valid:{type: Boolean, default:true},
    }, {timestamps:true}); // used to see when ticket is created

const Ticket=mongoose.model('Ticket',ticketSchema);
module.exports=Ticket;
