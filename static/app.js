
const url = 'http://localhost:3000/api';

// we store the logged-in user's token and id here after login
let token = null;
let currentUserId = null;//holds the user id of the current user
let currentU = null; //currentU is the variable holding the current user object that will be used in manage profile.....
let cart = []; //the variable to hold the users ticket before confirming the order
let currentRole=null;

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
	if(page === 'reports') document.getElementById('reportsPage').classList.add('active');
	if(page === 'profile') document.getElementById('profilePage').classList.add('active');
	if(page === 'login') document.getElementById('loginPage').classList.add('active');
	if (page === 'admin') document.getElementById('adminPage').classList.add('active');
}

async function register(){
	const newUser = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        email: document.getElementById('signUpEmail').value,
        phoneNumber: document.getElementById('phoneNum').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        password: document.getElementById('signUpPass').value,
        role: 'customer'   // customer is the default role
    };
	//the http request to the register endpoint to the register the user
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
        document.getElementById('signUpErr').textContent = data.error;
    }
}

function toggleAuth() {
    const loginBox = document.getElementById('login');
    const signupBox = document.getElementById('signUpform');

    // if signup is hidden, show it and hide login(This is the way of doing page shifting;one page is hided when the other has to pop up)
    if (signupBox.style.display === 'none') {
        signupBox.style.display = 'block';
        loginBox.style.display = 'none';
    } else {
        //signupBox.style.display = 'block' === false; // (see note)
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    }
}

async function signin(){
	const credential ={
		email: document.getElementById('loginEmail').value,
		password: document.getElementById('loginPass').value
	};
	//http request for the backend end point
	const res = await fetch('http://localhost:3000/api/users/login',{method: 'POST',
	headers: {'Content-Type':'application/json'},
	body:JSON.stringify(credential)
	});
	const data = await res.json();
	
	if(res.status ===200){
		token=data.token;
		currentUserId = data.userId;
		currentRole = data.role;
		currentU =data.user;
		if(currentRole==='Railway admin'){
			document.getElementById('reportsLink').style.display = 'inline';
			document.getElementById('adminLink').style.display = 'inline';
		}

		document.querySelector('nav div').style.display = 'block';

		showPage('search');
		toast('Welcome Back');
	}else{
		document.getElementById('loginErr').textContent = data.error;
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

	const container = document.getElementById('results');
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
	//we added this block so user is forced to sign in before anykind of purchases....
	if(!currentUserId){
		toast('Please sign in');
		showPage('login');
		return;
	}
	cart.push({scheduledRouteId: scheduledRouteId ,classType: classType, price: price});
	rendercart();//here it fetches the cart(multiple tickets on the cart)......
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
	cartdiv.innerHTML = sentence;
}

async function confirmorder(){
	if(cart.length ==0){
		toast('Your order is empty,add tickets to proceed');
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

async function reports(){
	const res = await fetch(url + '/reports/mostBookedReport',{
		headers: {token: token}
	});
	const data = await res.json();
	const box = document.getElementById('reportsContent');

	if(res.status !== 200){
	box.innerHTML = '<p>' + data.error + '</p>';
		return;
	}
	//data has the info about scheduledRoute and bookings;we make 'stuff' to arrange the format to be shown........
	let stuff = '<h3>Most booked routes</h3>';
	data.forEach(r=>{
		stuff += '<div class= "small">Route ' + r.scheduledRoute + ' - ' + r.bookings + 'bookings</div>';
	});

	//the second report(longest routes)
	const res2= await fetch(url + '/reports/longestRreport',{
		headers: {token: token}
	});
	const data2 = await res2.json();
	if(res2.status==200){
		stuff += '<h3>Longest routes</h3>';
		data2.forEach(r =>{
			stuff += '<div class="small">Route #' + r.routeId + ' - ' + r.distance + 'km</div>';
		});
	}
	box.innerHTML = stuff;
}

async function loadProfile(){
	document.getElementById('profilename').value = currentU.name || "-";
	document.getElementById('profilesurname').value = currentU.surname || "-";
	document.getElementById('profilephone').value = currentU.phoneNumber || "-";
	document.getElementById('profileaddress').value = currentU.address || "-";
	document.getElementById('p_dateOfBirth').value= currentU.dateOfBirth || "-";
}

async function saveProfile(){
	const update = {
		name: document.getElementById('profilename').value,
		surname: document.getElementById('profilesurname').value,
		phoneNumber: document.getElementById('profilephone').value,
		address: document.getElementById('profileaddress').value,
		dateOfBirth: document.getElementById('p_dateOfBirth').value
	};
	const res = await fetch(url + '/users/profile/' + currentUserId, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(update)

	});
	const data = await res.json();
	if (res.status ===200){
		currentU = data;
		toast('Profile updated');
	}else{
		document.getElementById('profileErr').textContent = data.error;
	}
}
function logout() {
	// clear all stored login state
	 token = null;
	currentUserId = null;
	currentRole = null;
	currentU = null;
	cart = [];
	// hide the nav menu /home page ,and the reports link we added for specialy for admins
	document.querySelector('nav div').style.display = 'none';
	document.getElementById('reportsLink').style.display = 'none';
	document.getElementById('adminLink').style.display = 'none';
	// return to the login page
	showPage('login');
	toast('Logged out sucessfully');
}
//We added this function, to implement the usecase "update timetables"-Basically this function helps admins to add a particular route to the system
async function addRoute(){
    const body = {
	    routeId: Number(document.getElementById('routeid').value),
	    departureStation: document.getElementById('routedep').value,
	    arrivalStation: document.getElementById('routearr').value,
	    distance: Number(document.getElementById('routedistance').value)
    };
	const res = await fetch(url + '/network/route/add', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
    const data = await res.json();
    if(res.status === 201){
        toast('Route added successfully');
    } else {
        document.getElementById('adminErr').textContent = data.error;
    }
}
