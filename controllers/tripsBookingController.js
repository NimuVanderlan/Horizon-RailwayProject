const BookingService = require('../services/bookingService');
const PathFindingService = require('../services/pathFindingService');
const ScheduledRoute = require('../models/scheduledRoute');
const Station = require('../models/station');
const Booking = require('../models/booking');
const User = require('../models/user');

const bookingService = new BookingService();


// POST /api/trips/search

const searchTrips = async (req, res) => {
    try {
        const {departureStationId, arrivalStationId, departureAfter, limit} = req.body;

        if (!departureStationId || !arrivalStationId) {
            return res.status(400).json({ error: 'fromStationId and toStationId are required' });
        }

        const [departureStation, arrivalStation] = await Promise.all([
            Station.findById(departureStationId),
            Station.findById(arrivalStationId),
        ]);

        if (!fromStation || !toStation) {
            return res.status(404).json({ error: 'One or both stations not found' });
        }

        const searchFrom = departureAfter ? new Date(departureAfter) : new Date(); // use for following filtering

        //filter by departure time to avoid loading all routes into memory
        const scheduledRoutes = await ScheduledRoute.find({
            departureTime: { $gte: searchFrom },
            status: { $ne: 'cancelled' },
        })
            .populate({
                path: 'route',
                populate: ['departureStation', 'arrivalStation']
            })
            .populate('train');

        const service = new PathFindingService(scheduledRoutes);

        const trips = service.findTopTrips(
            fromStation,
            toStation,
            searchFrom,
            limit ? parseInt(limit) : 5
        );
        return res.status(200).json({trips});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

// POST /api/bookings

const createBooking = async (req, res) => {
    try {
        const { customerId, scheduledRouteIds, paymentMethod } = req.body;

        if (!customerId || !Array.isArray(scheduledRouteIds) || scheduledRouteIds.length === 0) {
            return res.status(400).json({ error: 'customer Id and scheduleRouteIds are needed' });
        }

        const customer = await User.findById(customerId);
        if (!customer) return res.status(404).json({ error: 'customer not found' });
        if (customer.role !== 'customer') return res.status(403).json({ error: 'user is not a customer' });

        const srs = await ScheduledRoute.find({
            _id: { $in: scheduledRouteIds } // result is an array of scheduled route with the IDs we want
        })
            .populate({
                path: 'route',
                populate: ['departureStation', 'arrivalStation'] //adds stations
            })
            .populate('train'); //adds the train

        const totalPrice = srs.reduce((sum, sr) => sum + (sr.ticketPrice || 0), 0); // reduce() loops through the array and accumulate a value

        const longTrip = {
            trips: srs.map(sr => ({scheduledRoute: sr})),
            totalPrice,
            numberOfChanges: Math.max(0, srs.length - 1),
        };

        const booking = await bookingService.bookTrip(
            customer,
            longTrip,
            { paymentMethod }
        );

        return res.status(201).json(booking);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE /api/bookings/:bookingId

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { customerId } = req.body;

        const booking = await bookingService.cancelBooking(bookingId, customerId);
        return res.status(200).json(booking);
    } catch (err) {
        if (err.message === 'Unauthorized') {
            return res.status(403).json({error: err.message});
        }
        if (err.message === 'Booking not found') {
            return res.status(404).json({error: err.message});
        }
        return res.status(500).json({error: err.message});
    }
};


 // GET /api/bookings/customer/:customerId
 
const getCustomerBookings = async (req, res) => {
    try {
        const { customerId } = req.params;

        //also populate scheduledRoutes to include route details
        const bookings = await Booking.find({ customer: customerId })
            .populate('ticket')
            .populate('payment')
            .populate({
                path: 'scheduledRoutes',
                populate: {
                    path: 'route',
                    populate: ['departureStation', 'arrivalStation']
                }
            });

        return res.status(200).json(bookings);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

module.exports = {
    searchTrips,
    createBooking,
    cancelBooking,
    getCustomerBookings
};
