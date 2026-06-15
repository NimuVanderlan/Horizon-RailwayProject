const Booking = require('../models/booking');
const Ticket = require('../models/ticket');
const Payment = require('../models/payment');
const Train = require('../models/train');
const User = require('../models/user');

class BookingService {

    async bookTrip(customer, longTrip, paymentData) {
        const tickets = []; //store created tickets
        const scheduledRouteIds = []; // store booking ID's for this trip

        for (const segment of longTrip.trips) { //loop through every direct trip in the long trip
            const sr = segment.scheduledRoute;

            const train = await Train.findById(sr.train._id || sr.train);

            if (!train || train.availableSeats <= 0) {
                throw new Error('No available seats');
            }

            train.availableSeats -= 1; // reserve a seat
            await train.save();


            const ticket = new Ticket({
                
                ticketId: await this._nextId(Ticket, 'ticketId'),
                booking: null,
                scheduledRoute: sr._id,
                class: 'economyClass',
                price: sr.ticketPrice || 0,
                seatNum: `Seat-${train.capacity - train.availableSeats}`,
                qr,
                valid: true,
            });

            await ticket.save(); // save to DB
            tickets.push(ticket);
            scheduledRouteIds.push(sr._id);
        }

        const payment = await Payment.create({
            
            paymentId: await this._nextId(Payment, 'paymentId'),
            amount: longTrip.totalPrice,
            paymentMethod: paymentData.paymentMethod || 'Credit Card',
            paymentStatus: 'COMPLETED',
        });

        const booking = await Booking.create({ // create a booking
            bookingId: await this._nextId(Booking, 'bookingId'),
            customer: customer._id,
            scheduledRoutes: scheduledRouteIds,
            trip: scheduledRouteIds,
            price: longTrip.totalPrice,
            payment: payment._id,
            ticket: tickets.map(t => t._id), // link all the tickets
            
        });

        await Ticket.updateMany( // update the booking field of tickets now that they belong to a booking
            { _id: { $in: tickets.map(t => t._id) } },
            { $set: { booking: booking._id } }
        );

        await User.findByIdAndUpdate(customer._id, { // update booking filed of user now that he has a booking
            $push: { bookings: booking._id },
            $inc: { loyaltyPoints: 10 },
        });

        return booking;
    }

    async cancelBooking(bookingId, customerId) {
        const booking = await Booking.findOne({ bookingId }).populate('ticket');

        if (!booking) throw new Error('Booking not found');
        if (booking.customer.toString() !== customerId.toString()) {
            throw new Error('Unauthorized');
        }

        booking.status = 'cancelled';
        await booking.save();

        //invalidate all tickets because of cancellation
        await Ticket.updateMany(
            { _id: { $in: booking.ticket.map(t => t._id) } },
            { $set: { valid: false } }
        );

        //restore number of seats on each train for cancelled tickets
        for (const ticket of booking.ticket) {
            const sr = await require('../models/scheduledRoute').findById(ticket.scheduledRoute).populate('train');
            if (sr && sr.train) {
                await Train.findByIdAndUpdate(sr.train._id, { $inc: { availableSeats: 1 } });
            }
        }

        return booking;
    }

    async _nextId(Model, field) {
        const last = await Model.findOne({}).sort({ [field]: -1 }).select(field);
        return last ? last[field] + 1 : 1;
    }
}

module.exports = BookingService;
