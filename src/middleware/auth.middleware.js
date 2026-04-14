const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blackList.model');

/**
 * - Middleware to authenticate NORMAL users based on JWT token
 */
async function authMiddleware(req, res, next) {
    const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token });

    if(isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid",
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

/**
 * - Middleware to authenticate SYSTEM users based on JWT token
 */

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    const isBlackListed = await tokenBlackListModel.findOne({ token });

    if(isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid",
            status: "failed"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select('+systemUser');  

        if(!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, requires system user privileges",
                status: "failed"
            });
        }

        req.user = user;
        
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, invalid token",
            status: "failed"
        });
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};