const express = require('express');
const router = express.Router();
const userfile=require ('../controllers/user');
const trainfile=require('../controllers/train');
const networkfile= require('../controllers/network');
const bookingfile = require('../controllers/booking');

//the routes for each user controller function.
router.post('/users/register',userfile.registeruser);
router.post('/users/login',userfile.loginuser);
router.get('/users/:email', userfile.getuser);
router.delete('/users/:email',userfile.deleteuser);
router.put('/users/change-password',userfile.changepassword);

//train routes.....
router.post('/trains/add',trainfile.addTrain);
router.get('/trains/search',trainfile.searchTrains);

//network routes
router.post('/network/station/add',networkfile.addStation);
router.post('/network/route/add',networkfile.addRoute);
router.post('/network/scheduledRoute/add',networkfile.addScheduledRoute);

//booking route
router.post('/bookings/create', bookingfile.createBooking);
router.put('/bookings/cancel/:bookingId', bookingfile.cancelBooking);
router.get('/bookings/:customerId', bookingfile.viewBooking);
router.get('/bookings/ticket/:ticketId', bookingfile.getTicket);

module.exports = router;
