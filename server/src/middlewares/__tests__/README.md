# Auth Middleware Tests

This directory contains tests for the authentication middleware.

## Test Files

1. `auth.middleware.test.ts` - Jest test suite for the auth middleware
2. `auth.middleware.manual-test.js` - Manual test script with console logs
3. `auth.middleware.manual-runner.js` - Manual test runner with mock objects
4. `auth.middleware.test.html` - Visual test results in HTML format
5. `simple.test.js` - Simple Jest test to verify the setup

## Running the Tests

### Option 1: Using Jest (Recommended)

To run the tests with Jest, you need to enable PowerShell script execution:

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the tests:

```powershell
cd helaly-erp/server
npm test
```

### Option 2: View HTML Test Results

Open the `auth.middleware.test.html` file in a web browser to see the test results visually.

## Test Coverage

The tests cover the following scenarios:

### `authenticate` middleware:

1. No authorization header
2. Invalid token format (not Bearer)
3. No token provided
4. Expired token
5. Invalid token
6. Valid token

### `isAdmin` middleware:

1. User not authenticated
2. User not an admin
3. User is an admin

## Implementation Details

The auth middleware provides two main functions:

1. `authenticate` - Verifies the JWT token in the Authorization header
2. `isAdmin` - Checks if the authenticated user has admin privileges

Both middlewares are designed to be used in Express routes to protect API endpoints. 