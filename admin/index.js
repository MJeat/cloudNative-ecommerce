const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('./dbconnect.js');
const createUserModel = require('../user/User.js');

const app = express();
const User = createUserModel(mongoose);
const port = Number(process.env.PORT || 5001);

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ service: 'admin', status: 'ok' });
});

app.get('/searchuser', async (req, res) => {
    try {
        const { name, email } = req.query;
        const query = {};

        if (name?.trim()) {
            query.name = { $regex: escapeRegex(name.trim()), $options: 'i' };
        }
        if (email?.trim()) {
            query.email = { $regex: escapeRegex(email.trim()), $options: 'i' };
        }

        const users = await User.find(query).select('-passwordHash');
        return res.status(200).json({ message: 'Users found', users });
    } catch (error) {
        console.error('ADMIN SEARCH ERROR:', error.message);
        return res.status(500).json({ message: 'Unable to search users' });
    }
});

app.get('/viewallusers', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        return res.status(200).json(users);
    } catch (error) {
        console.error('ADMIN LIST ERROR:', error.message);
        return res.status(500).json({ message: 'Unable to load users' });
    }
});

app.delete('/deleteuser', async (req, res) => {
    try {
        const email = req.query.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('ADMIN DELETE ERROR:', error.message);
        return res.status(500).json({ message: 'Unable to delete user' });
    }
});

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Admin service started on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('ADMIN DATABASE ERROR:', error.message);
        process.exitCode = 1;
    });