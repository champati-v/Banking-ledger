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

module.exports = router;