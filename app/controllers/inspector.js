//Ticket calidation use case by On board controllers
const Ticket = require('../models/ticket');
const scanticket = async(req, res) => {
	try{
		if(!req.body.qr){
			return res.status(400).json({error: 'QR code required'});
		}
		const ticket = await Ticket.findOne({ qr: req.body.qr}) //finding the ticket using qr code
			.populate({
				path: 'scheduledRoute',
				populate: {path: 'route train'}
			});
		if(!ticket){
			return res.status(404).json({ error: 'Ticket not found'});
		}
		if(!ticket.valid){
			return res.status(200).json({
				valid:false,
				message: 'Ticket is invalid,try again'
			});
		}
	}catch(err){
		return res.status(500).json({ error: err.message});
	}
};
module.exports = {scanticket};
