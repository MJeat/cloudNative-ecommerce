// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require('mongoose');
const dns = require('dns');

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

// Database Connection URL
const uri = process.env.MONGO_URL || "mongodb+srv://b80954643_db_user:Boyd1209@cluster0.oxcbzu5.mongodb.net/ecommerce_commerce_db?retryWrites=true&w=majority&appName=Cluster0";

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
