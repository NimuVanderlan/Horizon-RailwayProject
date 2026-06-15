const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const tripsBookingController = require('../controllers/tripsBookingController');
const trainController = require('../controllers/trainController');

router.post('/users/register', userController.registeruser);
router.post('/users/login', userController.loginuser);
router.get('/users/:email', userController.getuser);
router.delete('/users/:email', userController.deleteuser);
router.put('/users/change-password', userController.changepassword);
router.put('/users/:email/address', userController.updateaddress);


router.post('/trips/search', tripsBookingController.searchTrips);
router.post('/bookings', tripsBookingController.createBooking);
router.delete('/bookings/:bookingId', tripsBookingController.cancelBooking);
router.get('/bookings/customer/:customerId', tripsBookingController.getCustomerBookings);


router.get('/trains', trainController.getTrains);
router.get('/trains/:trainId', trainController.getTrain);
router.post('/trains', trainController.createTrain);
router.put('/trains/:trainId/delay', trainController.setDelay);
router.put('/trains/:trainId/status', trainController.updateStatus);

module.exports = router;
