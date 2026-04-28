const accountModel = require('../models/account.model');

async function createAccountController(req, res) {

    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    });

    res.status(201).json({
        message: "Account created successfully",
        status: "success",
        account
    });
};

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if(!account) {
        return res.status(404).json({
            message: "Account not found",
            status: "error"
        });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
        message: "Account balance retrieved successfully",
        status: "success",
        balance
    });
}

module.exports = {
    createAccountController,
    getAccountBalanceController
};