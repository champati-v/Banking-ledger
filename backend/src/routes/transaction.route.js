const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRoutes = Router();

/**
 * - Create a new transaction between two accounts
 */
transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - GET /api/transactions/
 * - Get all transactions for the authenticated user's accounts
 * - Protected
 */
transactionRoutes.get('/', authMiddleware.authMiddleware, transactionController.getTransactionsController);

/**
 * - GET /api/transactions/admin/all
 * - Get all transactions in the database
 * - Protected: System User Only
 */
transactionRoutes.get('/admin/all', authMiddleware.authSystemUserMiddleware, transactionController.getAllTransactionsAdminController);

/**
 * - POST api/transactions/system/initial-funds
 * - Create initial funds transfer from system user 
 */
transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRoutes;