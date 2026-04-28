# Bank Ledger API

A simple Node.js, Express, and MongoDB banking API with JWT authentication, transaction safety, and email notifications.

## Features

- User registration, login, and logout
  Users can create an account, sign in, and safely log out. Logout also invalidates the active token.
- JWT auth using cookie or `Authorization: Bearer <token>`
  The API accepts a JWT from either a cookie or the request header. This keeps authentication flexible for browser and API clients.
- Token blacklisting on logout
  Logged-out tokens are stored in a blacklist and rejected by the auth middleware. This prevents reused tokens from accessing protected routes.
- Bank account creation for authenticated users
  Signed-in users can create bank accounts tied to their profile. Account access stays limited to the owning user.
- Account balance calculated from immutable ledger entries
  Balance is not stored as a manual value. It is derived from ledger records so the history stays consistent and auditable.
- Transfers protected with `idempotencyKey`
  Repeating the same transfer request does not create duplicate payments. The idempotency key helps safely retry requests.
- System-user-only initial funding route
  A special system user can seed starting balances. This route is restricted so normal users cannot use it.
- Email notifications for registration and successful transfers
  The app sends emails after signup and after completed transfers. This provides basic transactional feedback to users.

## Concepts Used

- JWT authentication
  JWTs are used to prove a user is logged in without storing session state on the server. Each protected request must carry a valid token.
- Token blacklisting
  Blacklisting makes logout meaningful by rejecting tokens that were already used to sign out. It adds an extra layer of session control.
- Idempotency key
  An idempotency key ensures the same request is processed only once. This is important for transfers that might be retried by the client.
- Immutable ledger
  Ledger entries are treated as append-only records. This makes balance calculations easier to trust and keeps transaction history clean.
- Role-based system user access
  Some routes are reserved for a system user with elevated access. This separates normal banking actions from admin-style funding actions.
- Email delivery with Nodemailer
  Nodemailer handles outgoing emails through Gmail OAuth2. It is used for automated notifications without exposing raw SMTP credentials.

## Setup

```bash
git clone <your-repo-url>
cd banking-system
npm install
```

Create a `.env` file:

```env
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-gmail-address@gmail.com
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-oauth-refresh-token
```

## Run

```bash
npm run dev
```

The app runs on `http://localhost:5000`.

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/accounts`
- `GET /api/accounts/balance/:accountId`
- `POST /api/transactions`
- `POST /api/transactions/system/initial-funds`
- `GET /api/test`

## Notes

- Passwords are hashed before saving.
- Ledger entries are immutable.
- Logout stores the token in the blacklist so it cannot be reused.
