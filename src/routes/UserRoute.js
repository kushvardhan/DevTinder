const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/UserSchema');
const userRouter = express.Router();

userRouter.get('/connection', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId, status: 'accepted' },
                { toUserId: userId, status: 'accepted' },
            ],
        })
            .populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender'])
            .populate('toUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender']);

        res.status(200).json({
            message: 'Your connection list.',
            data: connections,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching connections', error: err.message });
    }
});

userRouter.get('/request/recieved', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await ConnectionRequest.find({
            toUserId: userId,
            status: 'interested',
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender']);

        if (!requests.length) {
            return res.status(404).json({ message: 'No one is interested in you.' });
        }

        const data = requests.map((row) => row.fromUserId);

        res.status(200).json({
            message: 'The users who are interested in connecting with you.',
            data,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching received requests', error: err.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find users who have no connection with the current user (not interested, ignored, or accepted)
        const ignoredOrConnectedUserIds = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId, status: { $in: ['accepted', 'interested', 'ignored'] } },
                { toUserId: userId, status: { $in: ['accepted', 'interested', 'ignored'] } }
            ]
        }).distinct('fromUserId');

        // Concatenate the distinct values for 'toUserId'
        const toUserIds = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId, status: { $in: ['accepted', 'interested', 'ignored'] } },
                { toUserId: userId, status: { $in: ['accepted', 'interested', 'ignored'] } }
            ]
        }).distinct('toUserId');

        // Combine the two arrays and remove duplicates using spread syntax
        const allConnectedUserIds = [...new Set([...ignoredOrConnectedUserIds, ...toUserIds])];

        // Remove the current user from the list of connected users
        const ignoredOrConnectedUserIdsSet = allConnectedUserIds.filter(id => id.toString() !== userId.toString());

        // Find users who do not have any connections with the current user and explicitly exclude the current user
        const users = await User.find({
            _id: { $nin: ignoredOrConnectedUserIdsSet }
        }).where('_id').ne(userId);  // Exclude current user explicitly

        // If no users are found, return a 404 error
        if (!users.length) {
            return res.status(404).json({ message: 'No users found in the feed.' });
        }

        // Send the list of users who haven't connected, ignored, or shown interest
        res.status(200).json({
            message: 'Feed Section:',
            data: users,
        });
    } catch (err) {
        console.error('Error fetching feed:', err); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching feed', error: err.message });
    }
});

module.exports = { userRouter };
