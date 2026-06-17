// where our backend live
const url = 'http://localhost:3000/api';

// we store the logged-in user's token and id here after login
let token = null;
let currentUserId = null;
let cart = []; //the variable to hold the users ticket before confirming the order

// small helper: show a message in the toast box
function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// page-switch
function showPage(page) {
    // hide all pages(then selects one page to view)
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    if (page === 'search') document.getElementById('searchingPage').classList.add('active');
    if (page === 'bookings') document.getElementById('BookingPage').classList.add('active');
}

async function register(){
	const newUser = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        email: document.getElementById('email-for-signUp').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        password: document.getElementById('password-for-signUp').value,
        role: 'customer'   // backend requires a role; signups are customers
    };
	//the http request to the register endpoint......
	 const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    });
	const data = await res.json();
	
	if (res.status === 201) {
        toast('Account created, please sign in');
        toggleAuth();   // actually logged in version
    } else {
        document.getElementById('signUp-error').textContent = data.error;
    }
}

function toggleAuth() {
    const loginBox = document.getElementById('login');
    const signupBox = document.getElementById('form-for-signUp');

    // if signup is hidden, show it and hide login
    if (signupBox.style.display === 'none') {
        signupBox.style.display = 'block';
        loginBox.style.display = 'none';
    } else {
        //signupBox.style.display = 'block' === false; // (see note)
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    }
}

async function login(){
	const credential ={
		email: document.getElementById('email-for-login').value,
		password: document.getElementById('password-for-login').value
	};
	const res = await fetch('http://localhost:3000/api/users/login',{method: 'POST',
	headers: {'Content-Type':'application/json'},
	body:JSON.stringify(credential)
	});
	const data = await res.json();
	
	if(res.status ===200){
		token=data.token;
		currentUserId = data.userId;

		document.querySelector('nav div').style.display = 'block';

		showPage('search');
		toast('Welcome back');
	}else{
		document.getElementById('login-error').textContent = data.error;
	}
}

async function search(){
	const params = new URLSearchParams({
        departureCity: document.getElementById('departureCity').value,
        arrivalCity: document.getElementById('arrivalCity').value,
        date: document.getElementById('date').value
    });
	const res = await fetch(url + '/trains/search?' + params);
    const data = await res.json();

	const container = document.getElementById('searchResults');
    if (res.status !== 200) {
        container.innerHTML = '<p>' + data.error + '</p>';
        return;
    }
	container.innerHTML = '';   // clear old results
    data.forEach(sr => {
        // each sr is a scheduled route with populated route/train
        const div = document.createElement('div');
        div.className = 'boxClass';
        div.innerHTML =
	    '<div>Train: ' + sr.train.model + ' (ID: ' + sr.train.trainId + ')</div>' +
            '<div>Departure: ' + new Date(sr.departureTime).toLocaleString() + '</div>' +
            '<div>Arrival: ' + new Date(sr.arrivalTime).toLocaleString() + '</div>' +
            '<div class="price">Economy: €' + (sr.price.economyclass || 'N/A') + '</div>' +
	    '<div class= "price">Buissness: €' + (sr.price.businessclass || 'N/A') + '</div>';
        container.appendChild(div);

	    if(sr.price.businessclass){
		const b = document.createElement('button');
		    b.textContent = 'Add business -' + sr.price.businessclass;
		    b.onclick = () => addOrder(sr._id, 'businessclass', sr.price.businessclass);
		    div.appendChild(b);
	    }

	    if(sr.price.economyclass){
		const e = document.createElement('button');
		    e.textContent = 'ADd economy ' + sr.price.economyclass;
		    e.onclick = () => addOrder(sr._id, 'economyclass',sr.price.economyclass);
		    div.appendChild(e);
	    }
    

    });
}

function addOrder (scheduledRouteId,classType, price){
	cart.push({scheduledRouteId: scheduledRouteId ,classType: classType, price: price});
	rendercart();//comment here
}

function rendercart(){
	const cartdiv= document.getElementById('cart');
	let total = 0;
	let sentence= '';
	cart.forEach(item => {
		total += item.price;
		sentence += '<div>' + item.classType + ' - €' + item.price + '</div>';
	});
	sentence += '<div class="price">Total: €' + total + '</div>' +'<button onclick="confirmorder()">Confirm order</button>';
	cartdiv.innerHTML = html;
}

async function confirmorder(){
	if(cart.length ==0){
		toast('Your order is empty');
		return;
	}
	//here mapped because backend ticket object only need these two data types as mandataory fields.
	const tickets = cart.map(item => ({
		scheduledRouteId: item.scheduledRouteId,
		classType: item.classType
	}));

	const res =await fetch(url + '/bookings/create',{method: 'POST',headers:{'Content-Type': 'application/json'},body: JSON.stringify({customerId: currentUserId, ticket:tickets})});
	const data = await res.json();
	if (res.status === 201){
		toast('Order confirmed! Total paid: €' + data.price);
		cart=[];
		rendercart();
	}else{
		toast('Booking failed '+ data.error);
	}


}

async function mybookings(){
	const res = await fetch(url + '/bookings/' + currentUserId);
	const data = await res.json();

	const container = document.getElementById('bookingsList');
	container.innerHTML = '';//this will prevent the case where the bookingList is being added by the same list of orders , everytime we click the tab.

	if(data.length===0){
		container.innerHTML = '<p> No Bookings</p>';
		return;
	}
	data.forEach(b => {
		const div = document.createElement('div');
		div.className = 'boxClass';
		let sentence = '<div>Booking #' + b.bookingId + '</div>' +
			'<div>Status: ' + b.bstatus + '</div>' +
			'<div class="price">Total: €' + b.price + '</div>';
		b.ticket.forEach(t => {
			const sr = t.scheduledRoute;
			sentence += '<div class="small">Ticket: ' + t.classType + '- €'  + t.price + '<br>' + 'From: ' + sr.route.departureStation.city + ' To: ' + sr.route.arrivalStation.city + '</div>';
});
		div.innerHTML = sentence;
		container.appendChild(div);
	})
}


i


