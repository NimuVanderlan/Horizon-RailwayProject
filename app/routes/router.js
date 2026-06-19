const express = require('express');
const router = express.Router();
const userfile=require ('../controllers/user');
const trainfile=require('../controllers/train');
const networkfile= require('../controllers/network');
const bookingfile = require('../controllers/booking');
const reportfile = require ('../controllers/report');
const{checkadmin}= require('../controllers/auth');

//the routes for each user controller function.
router.post('/users/register',userfile.registeruser);
router.post('/users/login',userfile.loginuser);
router.get('/users/:email', userfile.getuser);
router.delete('/users/:email',userfile.deleteuser);
router.put('/users/change-password',userfile.changepassword);
router.put('/users/profile/:userId',userfile.updateprofile);

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

//report generator route
router.get('/reports/mostBookedReport',checkadmin,reportfile.mostBookedReport);
router.get('/reports/longestRreport',checkadmin,reportfile.longestRreport);



module.exports = router;
