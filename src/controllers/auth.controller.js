const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

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
            email: user.email
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

    const user = await userModel.findOne({ email }).select('+password');

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
            email: user.email
        },
        token 
    });
}

module.exports = {
    userRegisterConroller,
    userLoginController
}