const mongoose = require('mongoose');

const uri = process.env.MONGO_URL || '******cluster0.oxcbzu5.mongodb.net/ecommerce_commerce_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => console.log('Review Microservice: Successfully connected to MongoDB!'))
  .catch((error) => console.log('Review Microservice: MongoDB Connection Error:', error));

module.exports = mongoose;
