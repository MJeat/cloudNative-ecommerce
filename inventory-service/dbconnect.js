// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

// Database Connection URL
const uri = process.env.COMMERCE_MONGO_URL || process.env.MONGO_URL || "mongodb+srv://titoleng77_db_user:WpKiSlO4kv3T6bar@cluster0.02ixnj9.mongodb.net/commerce_db?retryWrites=true&w=majority&appName=Cluster0";

// STEP-2 : ESTABLISH CONNECTION WITH MONGODB DATABASE THROUGH MONGOOSE
mongoose.connect(uri)
  .then(() => {
    console.log("Inventory Microservice: Successfully connected to MongoDB!");
  })
  .catch(err => {
    console.log("Inventory Microservice: MongoDB Connection Error: ", err);
  });

// STEP-3 : EXPORT MODULE mongoose
module.exports = mongoose;
