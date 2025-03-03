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
                { toUserId: userId, status: 'accepted' },
                { fromUserId: userId, status: 'accepted' },
            ],
        })
        .populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender'])
        .populate('toUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender'])

        const data = connections.map((row)=> {
            if(row.fromUserId._id.toString() === userId.toString() ){
               return row.toUserId;
            }
            return row.fromUserId;
        });

        res.status(200).json({
            message: 'Your connection list.',
            data,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching connections', error: err.message });
    }
});

userRouter.get('/request/recieved', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested',
        }).populate('fromUserId', 'firstName lastName photoUrl about skills age gender');

        if (!connectionRequests.length) {
            return res.status(404).json({ message: 'No one is interested in you.' });
        }

        res.status(200).json({
            message: 'The users who are interested in connecting with you.',
            data : connectionRequests
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching received requests', error: err.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page-1)*limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();
        connectionRequests.forEach(req => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        hideUserFromFeed.add(userId.toString());

        const users = await User.find({
            $and : [
                { _id: { $nin: Array.from(hideUserFromFeed) }, },
                { _id: { $ne : userId } },
            ]
        }).select(['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender']).skip(skip).limit(limit);

        res.json({ data: users });

    } catch (err) {
        console.error('Error fetching feed:', err);
        res.status(500).json({ message: 'Error fetching feed', error: err.message });
    }
});

module.exports = { userRouter };
