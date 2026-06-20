
//This is the root file,this will start the server and connect the database.
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//to server to read JSON from requests
app.use(express.json());

app.use(express.static('static'));//serve static files

//importing router files to route the functions correctly for endpoints
const userRoutes = require('./app/routes/router');
app.use('/api', userRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Connection error:', err));

// server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
