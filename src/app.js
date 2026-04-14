const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

/*
* - Importing Routes
*/
const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.route');

/**
 * - Use Routes
 */
app.use('/', (req, res) => {
    res.send('Banking API is up and running!');
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

module.exports = app;