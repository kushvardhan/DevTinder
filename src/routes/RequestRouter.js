const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/UserSchema');
const mongoose = require('mongoose');
const requestRouter = express.Router();

// Send Connection Request Route
requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id; // Get the authenticated user's ID (fromUserId)
        const toUserId = req.params.toUserId; // Get the target user's ID from URL parameter
        const status = req.params.status; // Get the status (e.g., 'interested', 'accepted')

        // Check if the status is valid
        const validStatuses = ['ignored', 'interested'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send(`${status} is invalid. Allowed values: ignored, interested`);
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).send(`User with ID ${toUserId} doesn't exist.`);
        }

        // Check if a connection request already exists
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ]
        });

        if (existingConnectionRequest) {
            throw new Error('Connection request already exists');
        }

        // Create a new connection request
        const connectionData = await ConnectionRequest.create({
            fromUserId,
            toUserId,
            status
        });


        const fromUser = await User.findById(fromUserId);
        res.status(201).send(`${fromUser.firstName} has sent a request to ${toUser.firstName}`);
    } catch (err) {
        console.error(err);
        res.status(400).send('Error: ' + err.message);
    }
});

requestRouter.post('/reviews/:status/:RequestId', userAuth, async (req, res) => {
    try {
        const LoggedInUserId = req.user._id;
        const requestId = req.params.RequestId;
        const status = req.params.status;

        // Validate status
        const validStatuses = ['rejected', 'accepted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `${status} is invalid. Allowed values: rejected, accepted.` });
        }

        // Find connection request
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: LoggedInUserId,
            status: 'interested',
        });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found or invalid." });
        }

        // Update status
        connectionRequest.status = status;
        const updatedRequest = await connectionRequest.save();

        res.status(200).json({ message: `Connection request ${status}`, data: updatedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = { requestRouter };
