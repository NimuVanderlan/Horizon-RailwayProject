const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    
    street: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String},
    postalCode: {type: String},
    country: {type: String},
});

module.exports = addressSchema;
