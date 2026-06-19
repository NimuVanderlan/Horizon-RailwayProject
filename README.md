# Horizon Railway

## Tech Stack
- Backend: Node.js, Express
- Database: MongoDB Atlas (Mongoose)
- Frontend: HTML, CSS, vanilla JavaScript
- Auth: JWT

## Setup
1. Clone the repo
2. `npm install`
3. Create a `.env` file in the root with:
   - MONGO_URI (connection string — provided in the submitted document)
   - PORT (3000)
   - TOKEN_KEY (secret — provided in the submitted document)
4. `node app.js`
5. Open http://localhost:3000

## Roles
- customer — search and book, manage bookings/profile
- ticketInspector — scan/validate tickets
- railwayAdmin — manage network, view reports

