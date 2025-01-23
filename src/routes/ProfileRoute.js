const express = require('express');
const bcrypt = require('bcrypt');
const { userAuth } = require('../middlewares/auth');
const User = require('../models/UserSchema');
const { validateProfileEditData } = require('../utils/validator');
const profileRouter = express.Router();

profileRouter.get('/view', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

profileRouter.patch('/edit', userAuth, async (req, res) => {
    try {
        if (!validateProfileEditData(req)) {
            throw new Error('Invalid Edit Request');
        }
        const loggedInUser = req.user;
        const { about } = req.body;

        // Validate "about" field if exists
        if (about && about.split(/\s+/).length > 100) {
            throw new Error('The "about" section cannot exceed 100 words.');
        }

        // Update the user's profile fields
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        // Save the updated user
        await loggedInUser.save();

        res.status(200).json({ 
            message: `${loggedInUser.firstName}, your profile is updated.`,
            updatedUser: loggedInUser,
        });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});


profileRouter.patch('/password', userAuth, async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).send('Email, old password, and new password are required.');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (isPasswordMatch) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: `${user.firstName}, your password has been updated successfully.` });
        } else {
            res.status(400).send('Old password is incorrect.');
        }
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});

module.exports = { profileRouter };
