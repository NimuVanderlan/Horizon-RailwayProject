//train model
//
const mongoose=require('mongoose');

const trainSchema= new mongoose.Schema({
	trainId: {type: Number, required: true, unique: true },
	model: {type: String, required: true},
	capacity: {type: Number,required: true},
	availableSeats: {type: Number, required: true},
	status: {type: String, enum:['operational','maintenance'], required: true},
});

const Train =mongoose.model('Train', trainSchema);
module.exports = Train;
