const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('./dbconnect.js');
const createUserModel = require('./User.js');
const User = createUserModel(mongoose);
const bcrypt = require('bcryptjs');
const app = express();
const port = Number(process.env.PORT || 5002);

app.use(express.json());

app.get("/",  (req,res) => {
    res.send("User Page")
})

app.get("/users/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/users", async (req, res) => {
  try {

        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }

    const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
      name,
      email,
            passwordHash: hashedPassword,
      role,
      phone
    });

    res.status(201).json({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
  } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

    res.status(500).json({
      message: error.message
    });
  }});

app.get("/email/:email", async (req, res) => {
  try {
        const user = await User.findOne({
            email: req.params.email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.get("/users/search", async (req, res) => {
    try {
        const { name, email } = req.query;

        let query = {};

        if (name) {
            query.name = {
                $regex: name,
                $options: "i"
            };
        }

        if (email) {
            query.email = {
                $regex: email,
                $options: "i"
            };
        }

        const users = await User.find(query).select('-passwordHash');

        if (users.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        res.status(200).json({
            message: "User Found",
            users
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/users/viewprofile", async (req, res) => {

    try {

        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(401).json({
                message: "User ID not provided"
            });
        }

        const user = await User.findById(userId)
            .select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.put("/users/updateprofile", async (req, res) => {

    try {

        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(401).json({
                message: "User ID not provided"
            });
        }

        const { name, email, phone, password } = req.body;

        const updateData = {};

        if (name) {
            updateData.name = name;
        }

        if (email) {
            updateData.email = email;
        }

        if (phone) {
            updateData.phone = phone;
        }

        // Hash password if user wants to change it
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});
// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
connectDatabase()
    .then(() => {
        app.listen(port, () => console.log(`User service started on port ${port}`));
    })
    .catch((error) => {
        console.error('USER DATABASE ERROR:', error.message);
        process.exitCode = 1;
    });
