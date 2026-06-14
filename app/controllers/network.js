//Controller part for the network(adding routes,adding sheduledRoutes and stations)
//private access!!!!

const Train = require('../models/train');
const Station = require('../models/station');
const Route = require('../models/route');
const ScheduledRoute = require('../models/scheduledRoute');

//UC - addStation

const addStation = async (req, res) =>{
try{
	//checking required fields......
	if (!req.body.stationId || !req.body.name || !req.body.city) {
            return res.status(400).json({ error: 'Missing required fields' });
	}

	//check if the station is already exists......
	const existsS=await Station.findOne({stationId: req.body.stationId});
	if(existsS){
		return res.status(409).json({ error: 'Station already exists'});
	}
	//creating the new Station
	const newS=new Station({
		stationId: req.body.stationId,
		name: req.body.name,
		city: req.body.city,
		platform: req.body.platform || [],
	});

	const savedS= await newS.save();
	return res.status(201).json(savedS);

}catch (err){
	return res.status(500).json({error: err.message});
}
};

//adding a route
const addRoute = async(req,res)=>{
try{
	//check the required fields.
	if (!req.body.routeId || !req.body.departureStation || !req.body.arrivalStation) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	//check if the entered stations exist
	const depS = await Station.findById(req.body.departureStation);
	const arrS = await Station.findById(req.body.arrivalStation);

	if(!depS || !arrS){
		return res.status(404).json({error: 'Stations do not match'});
	}

	const newR =new Route({
		routeId: req.body.routeId,
		departureStation: req.body.departureStation,
		arrivalStation:req.body.arrivalStation,
		distance: req.body.distance,
	});

	const savedR= await newR.save();
	return res.status(201).json(savedR);
}catch (err){
	return res.status(500).json({error: err.message});
}
};

//adding scheduledRoutes
const addScheduledRoute = async(req,res)=>{
try{
	 if (!req.body.scheduledRouteId || !req.body.route ||!req.body.train || !req.body.departureTime || !req.body.arrivalTime || !req.body.price || !req.body.seats || !req.body.Sch_status) {
		 return res.status(400).json({ error: 'Missing required fields' });
	 }
	// check at least one seat class is provided
        if (!req.body.seats.businessclass && !req.body.seats.economyclass) {
            return res.status(400).json({ error: 'At least one seat class required' });
        }

        
	// check at least one price class is provided
        if (!req.body.price.businessclass && !req.body.price.economyclass) {
            return res.status(400).json({ error: 'At least one price class required' });
        }
	// check if scheduledRoute already exists
	const exists = await ScheduledRoute.findOne({ 
		scheduledRouteId: req.body.scheduledRouteId 
	});
	if (exists) {
		return res.status(409).json({ error: 'Scheduled route already exists' });
	}
	// check if route exists
	const route = await Route.findById(req.body.route);
	if (!route) {
		return res.status(404).json({ error: 'Route not found' });
	}
	// check if train exists
	const train = await Train.findById(req.body.train);
	if (!train) {
		return res.status(404).json({ error: 'Train not found' });
	}
	// check arrival time is after departure time
	if (new Date(req.body.arrivalTime) <= new Date(req.body.departureTime)) {
		return res.status(400).json({ error: 'Arrival time must be after departure time' });
	}
	// create new scheduled route
	const newSR = new ScheduledRoute({
		scheduledRouteId: req.body.scheduledRouteId,
		route: req.body.route,
		train: req.body.train,
		departureTime: req.body.departureTime,
		arrivalTime: req.body.arrivalTime,
		price: {
			businessclass: req.body.price.businessclass || null,
			economyclass: req.body.price.economyclass || null,
		},
		seats: {
			businessclass: req.body.seats.businessclass || null,
			economyclass: req.body.seats.economyclass || null,
		},
		Sch_status:req.body.Sch_status,
	});
	const savedSR =await newSR.save();
	return res.status(201).json({error: err.message});

}catch (err){
	return res.status(500).json({error: err.message});
}
};

module.exports{addStation,addRoute,addScheduledRoute};
