const Booking = require('../models/booking');
const Ticket = require('../models/ticket');
const ScheduledRoute = require('../models/scheduledRoute');
const Route = require('../models/route');

const mostBookedReport = async(req,res) => {
	try{
		const count_sR={};
		const tickets = await Ticket.find({valid: true});
		for(const t of tickets){
			const id =t.scheduledRoute.toString();
			count_sR =(count_sR[id] || 0) +1;
		}

		//making the list(highest first)
		const sortlist = Object.entries(count_sR)
			.sort((a,b)=> b[1]-a[1])
			.map(([routeId,count])=>({scheduledRoute: routeId,bookings:count}));
		return res.status(200).json(sortlist);
	}catch (err){
		return res.status(500).json({error: err.message});
	}
};

//Report of the  longest Routes
const longestRreport = async(req,res) => {
	try{
		const routes = await Route.find()
			.sort({distance: -1})
			.populate('departureStation arrivalStation');
		return res.status(200).json(routes);
	}catch(err){
		return res.status(500).json({error: err.message});
	}
};
module.exports={mostBookedReport,longestRreport};
