const transactionModel = require('../models/transactions.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');

/**
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

    const { fromAccount, toAccount, amount, idempotenceKey } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotenceKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotenceKey are required",
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
        idempotenceKey: idempotenceKey
    });

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

    /**
     * 5. Create transaction with PENDING status
     */

    
}

module.exports = {
    createTransaction
};