const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/UserSchema');
const userRouter = express.Router();

// Get the list of connections (accepted)
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
        
        console.log(connections);
        res.status(200).json({
            message: 'Your connection list.',
            data: connections,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching connections', error: err.message });
    }
});

// Get the list of received requests (interested)
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

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();
        connectionRequests.forEach(req => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        hideUserFromFeed.add(userId.toString());

        const users = await User.find({ _id: { $nin: Array.from(hideUserFromFeed) } });

        res.json(users);

    } catch (err) {
        console.error('Error fetching feed:', err);
        res.status(500).json({ message: 'Error fetching feed', error: err.message });
    }
});

module.exports = { userRouter };
