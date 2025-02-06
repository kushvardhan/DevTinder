const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const { validatorSignupData } = require('../utils/validator');
const authRouter = express.Router();
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

authRouter.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, gender } = req.body;

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            age,
            gender,
        });

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
        });

        res.status(201).json({ message: "New User Added", user });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Something went wrong" });
        }
    }
});


authRouter.post('/login', async (req, res) => {          
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send('User not found');

        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // Generate JWT
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Set cookie with token
            res.cookie('token', token, {
                expires: new Date(Date.now() + 8 * 3600000), // 8 hours
                httpOnly: true,
            });
            res.send(user);
        } else {
            res.status(400).send('Wrong Credential');
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

authRouter.post('/logout', (req, res) => {
    res
      .cookie('token', '', { expires: new Date(0), httpOnly: true })
      .status(200)
      .send('Logged out successfully');
  });

module.exports = { authRouter };
