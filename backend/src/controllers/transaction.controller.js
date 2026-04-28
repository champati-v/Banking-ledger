const transactionModel = require('../models/transactions.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');

/*
 * - Create a new transaction between two accounts
 * 10 Step transfer flow:
 * 1. Validate request body (fromAccount, toAccount, amount)
 * 2. Validate idempotence key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction with PENDING status
 * 6. Create DEBIT ledger entry for sender
 * 7. Create CREDIT ledger entry for receiver
 * 8. Update transaction status to COMPLETED
 * 9. Commit MongoDB transaction
 * 10. Send email notifications to both parties
 */

async function createTransaction(req, res) {

    /*
     * 1. Validate request body (fromAccount, toAccount, amount)
    */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required",
            status: "failed"
        });
    };

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if(!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "Invalid Receiver or Sender account",
            status: "failed"
        });
    };

    /**
     * 2. Validate idempotence key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    console.log("From user email: ", req.user._id);

    if(isTransactionAlreadyExists) {
        if(isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                status: "success",
                transaction: isTransactionAlreadyExists
            });
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
                status: "pending",
            });
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction attempt failed",
                status: "failed",
            });
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction has been reversed, please try again",
                status: "reversed",
            });
        }
    };
    
    /**
     * 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both sender and receiver accounts must be active",
            status: "failed"
        });
    };

    /**
     * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance();

    if(balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
            status: "failed"
        });
    };

    let transaction;
    
    try{
    /**
     * 5. Create transaction with PENDING status
     */

    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = ( await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session }))[0];

    console.log("Transaction created with PENDING status:", transaction);

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount,
        type: "DEBIT",
        transaction: transaction._id
    }], { session });

    /**
     * - Delay for 10 seconds to simulate real-world processing time and test idempotency and transaction status handling
     */

    await (() => {
        return new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        type: "CREDIT",
        transaction: transaction._id
    }], { session });

    await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session }
    )

    await session.commitTransaction();
    session.endSession();
    } catch (error) {
        return res.status(400).json({
            message: "Transaction is Pending due to some error, please try after some time",
            status: "failed"
        });
    }


    /**
     * 6. Send email notifications to both parties
     */

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, "DEBIT");

    return res.status(201).json({
        message: "Transaction successful",
        status: "success",
        transaction
    });
}

/**
 * Create initial funds transaction from system to user account
*/

async function createInitialFundsTransaction(req, res) {
    const {toAccount, amount, idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required",
            status: "failed"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!toUserAccount) {
        return res.status(404).json({
            message: "Invalid Receiver account",
            status: "failed"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    /**
     * - Edge case: If someone deleted system user/DB has no system user
     */

    if(!fromUserAccount) {
        return res.status(404).json({
            message: "System account not found for the user",
            status: "failed"
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds transaction successful",
        status: "success",
        transaction
    });
}

async function getTransactionsController(req, res) {
    const userAccounts = await accountModel.find({ user: req.user._id });
    const accountIds = userAccounts.map(acc => acc._id);

    const transactions = await transactionModel.find({
        $or: [
            { fromAccount: { $in: accountIds } },
            { toAccount: { $in: accountIds } }
        ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
        message: "Transactions retrieved successfully",
        status: "success",
        transactions
    });
}

async function getAllTransactionsAdminController(req, res) {
    const transactions = await transactionModel.find({}).sort({ createdAt: -1 });

    res.status(200).json({
        message: "All transactions retrieved successfully",
        status: "success",
        transactions
    });
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getTransactionsController,
    getAllTransactionsAdminController
};