const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Please login!!!' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) throw new Error('User not found');

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized: ' + err.message });
    }
};

module.exports = { userAuth };
