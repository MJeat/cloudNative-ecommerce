const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');

mongoose.connect(uri)
  .then(() => console.log('Review Microservice: Successfully connected to MongoDB!'))
  .catch((error) => console.log('Review Microservice: MongoDB Connection Error:', error));

module.exports = mongoose;
