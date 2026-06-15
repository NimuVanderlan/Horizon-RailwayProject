const mongoose = require('mongoose');
const stationSchema = new mongoose.Schema({
    
	stationId: {type: Number, required: true, unique: true},
    
	name: {type: String, required: true},
    
	city: {type: String, required: true},
    
	platform: [{
            platformNum: {type: Number,required: true},
        //to see if the platform is not occupied
			available: { type: Boolean, default: true},
		}]
});

const Station = mongoose.model('Station', stationSchema);
module.exports = Station;
