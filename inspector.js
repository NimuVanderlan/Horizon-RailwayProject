/bin/bash: line 1: :q: command not found

const scanticket = async (req, res) => {
	try {
		if (!req.body.qr) {
			return res.status(400).json({ error: 'QR code requied' });
		}
		const ticket = await Ticket.findOne({ qr: req.body.qr })
			.populate({
				path: 'scheduledRoute',
				populate: { path: 'route train' }
			});
		if (!ticket) {
			return res.status(404).json({ error: 'Ticket not found ' });
		}

		if (!ticket.valid) {
			return res.status(200).json({
				valid: false,
				message: 'Ticket is not valid'
			});
		}
		return res.status(200).json({
			valid: true,
			message: 'Ticket is valid',
			ticket: ticket
		});
	} catch (err) {
		return res.status(500).json({ error: err.message});
	}
};
module.exports = { scanticket };
