// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require('mongoose');
jrequire('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDatabase() {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('Connected to MongoDB');
}

module.exports = connectDatabase;
