const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/UserSchema');
const requestRouter = express.Router();
const mongoose = require('mongoose');


requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId.trim();
        const status = req.params.status;

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        const validStatuses = ['ignored', 'interested'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `${status} is invalid. Allowed values: ignored, interested` });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: `User with ID ${toUserId} doesn't exist.` });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Connection Request already exists" });
        }

        const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
        await connectionRequest.save();

        res.status(201).json({ message: `${req.user.firstName} has sent a ${status} request to ${toUserId}` });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});


requestRouter.post('/reviews/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const requestId = req.params.requestId;
        const status = req.params.status;

        const allowedStatus = ['accepted','rejected'];

        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:'Status not Allowed'});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id:requestId,
            toUserId: loggedInUser._id,
            status:'interested',
        })

        if(!connectionRequest){
            return res.status(404).json({message:"Connection request not found."});
        }
        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.status(200).json({message:'Connection Request:'+status,data})

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = { requestRouter };
