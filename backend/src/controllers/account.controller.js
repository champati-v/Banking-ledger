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

async function getAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });
    
    // Fetch balance for each account to return it with the account object
    const accountsWithBalance = await Promise.all(accounts.map(async (account) => {
        const balance = await account.getBalance();
        return {
            ...account.toObject(),
            balance
        };
    }));

    res.status(200).json({
        message: "Accounts retrieved successfully",
        status: "success",
        accounts: accountsWithBalance
    });
}

async function getAllAccountsAdminController(req, res) {
    const accounts = await accountModel.find({});
    
    const accountsWithBalance = await Promise.all(accounts.map(async (account) => {
        const balance = await account.getBalance();
        return {
            ...account.toObject(),
            balance
        };
    }));

    res.status(200).json({
        message: "All accounts retrieved successfully",
        status: "success",
        accounts: accountsWithBalance
    });
}

module.exports = {
    createAccountController,
    getAccountBalanceController,
    getAccountsController,
    getAllAccountsAdminController
};