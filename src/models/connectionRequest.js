const mongoose = require('mongoose');

const connectionRequestSchema = mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model
            required: true,
        },
        status: {
            type: String,
            enum: {
                values: ['ignored', 'interested', 'rejected', 'accepted'],
                message: '{VALUE} is an incorrect status type',
            },
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index to ensure no duplicate requests
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Pre-save validation to prevent self-connections
connectionRequestSchema.pre('save', function (next) {
    if (this.fromUserId.equals(this.toUserId)) {
        return next(new Error("Can't send a connection request to yourself"));
    }
    next();
});

// Model initialization
const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;
