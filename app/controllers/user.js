const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//checking required fields
const registeruser=async(req,res)=> {
try{	
	if(!req.body.name || !req.body.email || !req.body.password || !req.body.role){
	return res.status(400).json({ error: 'Missing required fields '});
	}


//check if the email already exists
const existingUser = await User.findOne({ email: req.body.email });
if (existingUser){
	return res.status(409).json({ error: 'email already exists!' });
}

//Hash the password to store
const hashedPass=await bcrypt.hash(req.body.password, 10);

//Create the new user
const newUser = new User({
	name: req.body.name,
	surname: req.body.surname,
	dateOfBirth: req.body.dateOfBirth,
	email: req.body.email,
	phoneNumber: req.body.phoneNumber,
	address: req.body.address,
	password: hashedPass,
	role: req.body.role,
});

//Save in the db
const saveduser=await newUser.save();
return res.status(201).json(saveduser);
} catch(err){
	return res.status(500).json({ error: err.message });
}
};

//UC=user login
const loginuser= async(req,res)=>{
try{
	//required fields checking
	if(!req.body.email || !req.body.password){
		return res.status(400).json({ error: 'email and password  required'});
	}
	//Find users by email
	const user=await User.findOne({email: req.body.email});
	if(!user){
		return res.status(404).json({ error: 'user not found'});
	}
	//check the validity of the entered password with the stored hash one
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if(!validPassword){
		return res.status(401).json({ error:'Invalid password'});
	}

	//Generate JWT token
	const token = jwt.sign(
		{userId: user._id, role: user.role},
		process.env.TOKEN_KEY,
		{expiresIn: '24h'}
	);

	return res.status(200).json({ token: token, userId: user._id, role: user.role});
}catch (err){
	return res.status(500).json({error: err.message});
}
};

// UC= viewprofile
const getuser=async(req,res)=>{
try{
	const user=await User.findOne({ email: req.params.email });
	if(!user){
		return res.status(404).json({ error: 'User not found'});
	}
	return res.status(200).json(user);
}catch(err){
	return res.status(500).json({ error: 'User not found'});
}
};

//UC=deleteAccount
const deleteuser = async(req,res) =>{
try{
	const user=await User.findOneAndDelete({ email:req.params.email});
	if(!user){
		return res.status(404).json({ error: 'User not found'});
	}
	return res.status(200).json({message: 'User deleted successfully' });
}catch(err){
	return res.status(500).json({ error: err.message });
}
};

//UC=changePassword
const changepassword = async (req,res)=>{
	try{
	//checking the required fields
	if(!req.body.email || !req.body.oldPass || !req.body.newPass){
		return res.status(400).json({ error: 'Missing required field'});
	}
	
	// Find user
	const user = await User.findOne({ email: req.body.email });
	if(!user){
		return res.status(404).json({ error: 'user not found' });
	}	
	
	//OLd password verification
	const valid = await bcrypt.compare(req.body.oldPass,user.password);
	if(!valid){
		return res.status(401).json({ error: 'Old password is incorrect'});
	}
	//hashing the new password
	user.password=await bcrypt.hash(req.body.newPass, 10);
	await user.save();
	return res.status(201).json({ message: 'Password changed successfully'});
	}catch (err){
		return res.status(500).json({ error: err.message });
	}
};
//use case of updating profiles
const updateprofile = async(req, res) =>{
	try{
		//rejecting unauthorized update atempts
		if(req.body.role){
			return res.status(403).json({ error: 'Role can not be changed'});
		}
		if(req.body.password){
			return res.status(403).json({error: 'Use the change password section'});
		}if(req.body.email){
			return res.status(403).json({error: 'Email cannot be changed'});
		}
		//find the particular user
		const user = await User.findById(req.params.userId);
		if(!user){
			return res.status(404).json({ error: 'User not found'});
		}
		if (req.body.name) user.name = req.body.name;
		if (req.body.surname) user.surname = req.body.surname;
		if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
		if (req.body.address) user.address = req.body.address;
		if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
	
		const updated = await user.save();
		return res.status(200).json(updated);
	}catch (err){
		return res.status(500).json({ error: err.message});
	}
};

const logout = async(req,res) => {
	try{
		const user = await User.findById(req.params.userId);
		if(!user){
			return res.status(404).json({ error: 'User not found'});
		}
		user.loggedIn = false;
		await user.save();
		return res.status(200).json({message: 'Logged out successfully'});
	}catch(err){
		return res.status(500).json({error: err.message});
	}
};
module.exports = {registeruser, loginuser, getuser, deleteuser, changepassword , updateprofile,logout };
