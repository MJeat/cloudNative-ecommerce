const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dbconnect = require('./dbconnect.js');
const createUserModel = require('../user/User.js');
const User = createUserModel(mongoose);

// REGISTER API

app.post("/register", async (req, res) => {
    try {

        const { name, firstname, email, password, role, phone, mobile } = req.body;
        const userName = name || firstname;

        if (!userName || !email || !password || !role) {
            return res.status(400).json({
                message: 'Name, email, password, and role are required'
            });
        }

        if (!['admin', 'user', 'student'].includes(role)) {
            return res.status(400).json({
                message: 'Role must be admin, user, or student'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name,
            email,
            passwordHash,
            role,
            phone: phone || mobile
        });

        return res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        console.error('REGISTRATION ERROR:', error.message);
        return res.status(500).json({ message: 'Registration failed' });
    }
});


// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Hello Register");
});


// START SERVER
app.listen(5003, () => {
    console.log('EXPRESS Server Started at Port No: 5003');
});