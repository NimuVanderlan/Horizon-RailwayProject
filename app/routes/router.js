const express = require('express');
const router = express.Router();
const userfile=require ('../controllers/user');

//the routes for each controller function.
router.post('/users/register',userfile.registeruser);
router.post('/users/login',userfile.loginuser);
router.get('/users/:email', userfile.getuser);
router.delete('/users/:email',userfile.deleteuser);
router.put('/users/change-password',userfile.changepassword);


module.exports = router;
