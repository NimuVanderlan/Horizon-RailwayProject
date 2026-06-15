const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registeruser = async (req, res) => {
    try {
        const { name, surname, dateOfBirth, email, phoneNumber, password, role, language, address } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        
        const Roles = ['customer', 'ticketInspector', 'freightOperator'];
        if (!Roles.includes(role)) {
            return res.status(403).json({ error: 'Invalid role' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'user already exists' });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            surname,
            dateOfBirth,
            email,
            phoneNumber,
            password: hashedPass,
            role,
            language,
            address,
        });

        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'user not found' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.TOKEN_KEY,
            { expiresIn: '24h' }
        );

        return res.status(200).json({token});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const getuser = async (req, res) => {
    try {
        //fix in case email contains @
        const email = decodeURIComponent(req.params.email);
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const deleteuser = async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const user = await User.findOneAndDelete({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({message: 'User deleted successfully'});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const changepassword = async (req, res) => {
    try {
        const {email, oldPass, newPass} = req.body;

        if (!email || !oldPass || !newPass) {
            return res.status(400).json({error: 'Missing required field'});
        }

        const user = await User.findOne({email});
        if (!user) return res.status(404).json({error: 'user not found'});

        const valid = await bcrypt.compare(oldPass, user.password);
        if (!valid) return res.status(401).json({error: 'Old password is incorrect'});

        user.password = await bcrypt.hash(newPass, 10);
        await user.save();

        return res.status(200).json({message: 'Password changed successfully'});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const updateaddress = async (req, res) => {
    try {
        const {email} = req.params;
        const {street, city, state, postalCode, country} = req.body;

        const user = await User.findOneAndUpdate(
            {email},
            {$set: {address: {street, city, state, postalCode, country }}},
            {new: true}
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

module.exports = {
    registeruser,
    loginuser,
    getuser,
    deleteuser,
    changepassword,
    updateaddress
};
