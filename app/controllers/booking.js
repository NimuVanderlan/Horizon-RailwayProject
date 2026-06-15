//Controller for the booking class

const Booking = require('../models/booking');
const Ticket =require('../models/ticket');
const ScheduledRoute = require('../models/scheduledRoute');
const User = require('../models/user');

//Creating a new Booking - accessible for customers.....

const createBooking =async(req,res) => {
	try{
		//checking all the required fields
		if(!req.body.customerId || !req.body.scheduledRouteId || !req.body.ticket || req.body.ticket.length===0){
			return res.status(400).json({ error: 'missing required fields'});
		}

		//find the entered customer
		const customer = await User.findById(req.body.customerId);
		if(!customer){
			return res.status(404).json({ error: 'customer not found'});
		}
		
		//find the scheduledRoute
		const scheduledRoute = await ScheduledRoute.findById(req.body.scheduledRouteId);
		if(!scheduledRoute){
			return res.status(404).json({ error: 'Scheduled route not found'});
		}

		//the booking has to be made by atleast one hour prior to the departure
		const now= new Date();
		const dep=new Date(scheduledRoute.departureTime);
		const timediff=dep-now;
		const oneHour = 60*60*1000;

		if(timediff<oneHour){
			return res.status(400).json({
				error: 'Booking has to be made atleast 1 hour before the departure'
			});
		}

		//calculate the total
		let total=0;
		const ticketList=[];

		for(const ticketInfo of req.body.ticket){
			//check if the class type is valid
			if(!ticketInfo.classType){
				return res.status(400).json({error: 'Class '});
			}
			// check chosen class is available on this route
			if (ticketInfo.classType === 'businessclass' && !scheduledRoute.seats.businessclass) {
				return res.status(400).json({ error: 'Business class not available' });
			}
			if (ticketInfo.classType === 'economyclass' && !scheduledRoute.seats.economyclass) {
				return res.status(400).json({ error: 'Economy class not available' });
			}

			//check if seats are available
			const seats= scheduledRoute.seats[ticketInfo.classType];
			if(seats.available <= 0){
				return res.status(400).json({
					error: 'No available seats in ${ticketInfo.classType}'
				});
			}

			//get price for each chosen class
			const pricePaid= scheduledRoute.price [ticketInfo.classType];
			total += pricePaid;

			//decrease available seat count
			scheduledRoute.seats[ticketInfo.classType].available -= 1;

			//create ticket
			const newTicket= new Ticket({
				ticketId: Date.now() + Math.random(),
				scheduledRoute: scheduledRoute._id,
				classType: ticketInfo.classType,
				price: pricePaid,
				seatNum: ticketInfo.seatNum || 'auto',
				qr: 'QR-' + Date.now() + '-' + Math.random(),
				valid: true,
			});

			const savedT = await newTicket.save();
			ticketList.push(savedT._id);
		}

		//save updated the seat avilability
		await scheduledRoute.save();

		//create the booking
		const newBooking= new Booking({
			bookingId: Date.now(),
			customer:customer._id,
			scheduledRoute: [scheduledRoute._id],
			ticket: ticketList,
			price:total,
			bstatus: 'confirmed',
		});

		const savedBooking = await newBooking.save();

		//match the tickets with thw booking
		await Ticket.updateMany(
			{_id: {$in: ticketList}},
			{booking: savedBooking._id}
		);
		
		//add booking to customer's bookings list
		await User.findByIdAndUpdate(
			customer._id,
			{$push: {bookings: savedBooking._id}}
		);

		return res.status(201).json(savedBooking);

	}catch (err){
		return res.status(500).json({error: err.message});
	}
};

//controller fro the cancel booking

const cancelBooking = async(req, res)=>{
	try{
		// find booking
		const booking = await Booking.findById(req.params.bookingId).populate('ticket');
		if (!booking) {
			return res.status(404).json({ error: 'Booking not found' });
		}
		// check booking is not already cancelled
		 if (booking.bstatus === 'cancelled') {
			 return res.status(400).json({ error: 'Booking already cancelled' });
		 }
		// find scheduled route to check departure time
		 const scheduledRoute = await ScheduledRoute.findById(
			 booking.scheduledRoute[0]
		 );
		
		//make sure the cancellation is being done at least 1 hour before dep
		const now=new Date();
		const dep=new Date(scheduledRoute.departureTime);
		const timeDiff =dep-now;
		const oneHour = 60*60*1000;

		if(timeDiff < oneHour){
			return res.status(400).json({
				error: 'Cncellaton must be done at least 1 hour prior to the departure'
			});
		}

		//make the cancelled seat available again;
		for(const ticket of booking.ticket){
			scheduledRoute.seats[ticket.classType].available += 1;
			ticket.valid= false;//invalidate the ticket....
			await ticket.save();
		}
		await scheduledRoute.save();

		//update booking status....
		booking.bstatus= 'cancelled';
		await booking.save();

		return res.status(200).json({message: 'Booking cancelled successfully'});
	}catch(err){
		return res.status(500).json({error: err.message});
	}
};

//controller func for the UC- View Bookings
const viewBooking = async(req,res) => {
	try{
		const customer= await User.findById(req.params.customerId);
		if(!customer){
			return res.status(404).json({error: 'Customer not found'});
		}
		//find all the bookings for a particular customer
		const bookings=await Booking.find({ customer: req.params.customerId}).populate('ticket')
		.populate('scheduledRoute');
		return res.status(200).json(bookings);
	}catch(err){
		return res.status(500).json({error: err.message});
	}
};

//controller for the case 'get a specific ticket'

const getTicket =async(req,res) => {
	try{
		const ticket= await Ticket.findById(req.params.ticketId)
			.populate({
				path:'scheduledRoute',
				populate:{
					path: 'route train',
					populate:{
						path: 'departureStation arrivalStation'
					}
				}
			});
		if(!ticket){
			return res.status(404).json(ticket);
		}
		return res.status(200).json(ticket);

	}catch (err){
		return res.status(500).json({error:err.message});
	}
};
module.exports = {createBooking, cancelBooking, viewBooking, getTicket};

