const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRoutes = Router();

/**
 * - Create a new transaction between two accounts
 */

transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST api/transactions/system/initial-funds
 * - Create initial funds transfer from system user 
 */

transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRoutes;