const express = require('express');
const bcrypt = require('bcrypt');
const { userAuth } = require('../middlewares/auth');
const User = require('../models/UserSchema');
const { validateProfileEditData } = require('../utils/validator');
const profileRouter = express.Router();

profileRouter.get('/view', userAuth, async (req, res) => {
    try {
        const data = req.user;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

profileRouter.patch('/edit', userAuth, async (req, res) => {
    try {
        if (!validateProfileEditData(req)) {
            throw new Error('Invalid Edit Request');
        }
        const loggedInUser = req.user;
        const { about } = req.body;

        if (about && about.split(/\s+/).length > 100) {
            throw new Error('The "about" section cannot exceed 100 words.');
        }

        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        await loggedInUser.save();

        res.status(200).json({ 
            message: `${loggedInUser.firstName}, your profile is updated.`,
            updatedUser: loggedInUser,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

profileRouter.patch('/password', userAuth, async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Email, old password, and new password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (isPasswordMatch) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: `${user.firstName}, your password has been updated successfully.` });
        } else {
            res.status(400).json({ error: 'Old password is incorrect.' });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = { profileRouter };
