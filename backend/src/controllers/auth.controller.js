const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const tokenBlackListModel = require('../models/blackList.model');

/*
* - User Registration Controller
* - POST /api/auth/register
* - Body: { name, email, password }
*/

async function userRegisterConroller(req, res){
    const { name, email, password } = req.body;

    const isExists = await userModel.findOne({
        email: email
    });

    if(isExists){
        return res.status(422).json({
            message: 'User already exists with this email',
            status: "failed"
        });
    };

    const user = await userModel.create({
        name,
        email,
        password
    });

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: '3d'});

    res.cookie("auth_token", token);

    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            systemUser: user.systemUser
        },
        token 
    });

    /*
    * - Send Email after Registration
    */
    await emailService.sendRegistrationEmail(user.email, user.name);
}

/*
* - User Login Controller
* - POST /api/auth/login
* - Body: { email, password }
*/

const userLoginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password +systemUser');

    if (!user) {
        return res.status(404).json({
            message: 'Email or Password is invalid',
            status: "failed"
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: 'Email or Password is invalid',
            status: "failed"
        });
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: '3d'});

    res.cookie("auth_token", token);

    res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            systemUser: user.systemUser
        },
        token 
    });
}

async function userLogoutController(req, res) {
    const token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(400).json({
            message: "No token provided",
            status: "failed"
        });
    }

    res.clearCookie("auth_token");

    await tokenBlackListModel.create({
        token: token
    });

    res.status(200).json({
        message: "User logged out successfully",
        status: "success"
    });
}

module.exports = {
    userRegisterConroller,
    userLoginController,
    userLogoutController
}