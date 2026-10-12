// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

// Database Connection URL
const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');

// STEP-2 : ESTABLISH CONNECTION WITH MONGODB DATABASE THROUGH MONGOOSE
mongoose.connect(uri)
  .then(() => {
    console.log("Order Microservice: Successfully connected to MongoDB!");
  })
  .catch(err => {
    console.log("Order Microservice: MongoDB Connection Error: ", err);
  });

// STEP-3 : EXPORT MODULE mongoose
module.exports = mongoose;
