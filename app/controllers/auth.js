const jwt = require('jsonwebtoken');

const checkadmin = (req,res,next) => {
	const token = req.headers.token;
	if(!token){
		return res.status(401).json({error: 'No token'});
	}

	//verify the token using the  secret key
	jwt.verify(token,process.env.TOKEN_KEY,(err, payload) => {
		if(err){
		return res.status(401).json({ error: 'Invalid Token'});
		}
		//check if the user is admin or not
		if(payload.role != 'admin'){
			return res.status(403).json({ error: 'You do not have access here'});
		}
		//attch the decoded info.....controller will see it
		req.user=payload;
		next();
	});
};
//the auth code for the On board Inspector
const inspector = (req,res,next)=>{
	const token = req.headers.token;
	if(!token){
		return res.status(401).json({error: 'No token'});
	}

	jwt.verify(token,process.env.TOKEN_KEY,(err, payload) => {
		if(err){
			return res.status(401).json({error: 'Invalid token'});
		}
		if(payload.role !='ticketInspector'){
			return res.status(403).json({ error: 'You are not allowed'});
		}
		req.user= payload;
		next();
	});
	
};
module.exports = {checkadmin,inspector};

