const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new bank account for the authenticated user
 * - Protected Route: Requires Authentication
 * - Body: { accountType, initialDeposit }
 */
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * - GET /api/accounts/
 * - Get all accounts for the authenticated user
 * - Protected
 */
router.get('/', authMiddleware.authMiddleware, accountController.getAccountsController);

/**
 * - GET /api/accounts/admin/all
 * - Get all accounts in the database
 * - Protected: System User Only
 */
router.get('/admin/all', authMiddleware.authSystemUserMiddleware, accountController.getAllAccountsAdminController);

router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController);

module.exports = router;