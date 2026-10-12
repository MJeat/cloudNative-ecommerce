const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

app.use(express.urlencoded({ extended: false }));

const mongoose = require('mongoose');
const createUserModel = require('../user/User');
const User = createUserModel(mongoose);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Hello Login");
});


// LOGIN API
app.post(["/", "/log"], async (req, res) => {
    try {

        const { email, password, role } = req.body;

        if (!email || !password || !["admin", "user", "student"].includes(role)) {
            return res.status(400).json({
                message: "Email, password, and a valid role are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select('+passwordHash');

        if (!user || user.role !== role) {
            return res.status(401).json({
                message: "Invalid email or password or role"
            });
        }

        const passwordMatched = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatched) {
            return res.status(401).json({
                message: "Invalid email or password or role"
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('LOGIN ERROR: JWT_SECRET is not configured');
            return res.status(500).json({
                message: 'Login service is not configured'
            });
        }

        const token = jwt.sign(
            {
                sub: user._id,
                email: user.email,
                role: user.role
            },
            jwtSecret,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {

        console.error("LOGIN ERROR:", error.message);

        return res.status(500).json({
            message: "Login service error"
        });
    }
});

app.listen(5004, () => {
    console.log('EXPRESS Server Started at Port No: 5004');
});