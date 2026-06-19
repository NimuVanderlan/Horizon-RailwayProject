const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({

name: { type: String, required:true },
surname: { type: String, required: true},
dateOfBirth: { type: Date, required: true },
email: { type: String, required: true, unique: true },
phoneNumber: { type: String, required: true },  
address: { type: String, required: false },
password: { type: String,required: true },
role: { type: String, enum: ['customer', 'Railway admin', 'ticketInspector'], required: true }, 
loyaltyPoints: { type: Number, default: 0 },
bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],

});

const User = mongoose.model('User', userSchema);
module.exports = User;
