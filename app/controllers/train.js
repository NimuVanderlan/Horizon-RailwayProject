// controller for the train

const Train = require('../models/train');
const Station = require('../models/station');
const Route = require('../models/route');
const ScheduledRoute = require('../models/scheduledRoute');

//adding trains....

const addTrain = async(req,res)=>{
	try{
		//checking the required fields
		if(!req.body.trainId || !req.body.model || !req.body.capacity || !req.body.availableSeats || !req.body.Tstatus){
			return res.status(400).json({error: 'Missing required fields'});
		}

		//checking if the train alreqady exists
		const exists= await Train.findOne({trainId: req.body.trainId});
		if(exists){
			return res.status(409).json({error: 'Train already exists'});
		}

		//creating the new train....
		const newT=new Train({
			trainId: req.body.trainId,
			model: req.body.model,
			capacity: req.body.capacity,
			availableSeats: req.body.availableSeats,
			Tstatus: req.body.Tstatus || 'operational',
		});

		const savedT= await newT.save();
		return res.status(201).json(savedT);
	}catch(err){
		return res.status(500).json({error:err.message});
	}
};

//UC- Search Trains
const searchTrains = async(req, res)=>{
	try{
		//check the required fields
		if(!req.query.departureCity || !req.query.arrivalCity || !req.query.date){
			return res.status(400).json({ error: 'Provide the fields'})
		}
		const depStation = await Station.findOne({
			city :req.query.departureCity
		});
		const arStation = await Station.findOne({
			city: req.query.arrivalCity
		});

		if(!depStation || !arStation){
			return res.status(404).json({error: 'Invalid Cities'});
		}

		//findout if the route is available
		 const route = await Route.find({
           	 departureStation: depStation._id,
            	 arrivalStation: arStation._id,
        	 });

        	if (route.length === 0) {
            		return res.status(404).json({ error: 'No routes found between these cities' });
        	}

		//Check the schduled rides.....
		const searchDate = new Date(req.query.date);
		const nextDay = new Date(searchDate);
		nextDay.setDate(nextDay.getDate() + 1);
		
		const scheduledRoutes = await ScheduledRoute.find({
		route: { $in: route.map(r => r._id) },
		departureTime: { $gte: searchDate, $lt: nextDay },
            	Sch_status: 'onTime',
		}).populate('train').populate({
		path: 'route',
            	populate: {
                path: 'departureStation arrivalStation'
		}
		});

		if (scheduledRoutes.length === 0) {
			return res.status(404).json({ error: 'No trains available on this date' });
		}

		return res.status(200).json(scheduledRoutes);

	}catch(err){
	return res.status(500).json({ error: err.message});
	}
};

module.exports = {searchTrains,addTrain};
