const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        req.user = user;
        
        next(); //forwards the request to the controller

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, invalid token",
            status: "failed"
        });
    }
}

module.exports = {
    authMiddleware
};