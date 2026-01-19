# Manual Testing Guide for Auth Middleware

This guide will walk you through manually testing the authentication middleware using a local test server.

## Option 1: Using the HTML Test Page (Recommended)

This is the easiest way to test the auth middleware.

1. Start the test server:
   ```
   cd D:\h p\helaly-erp\server
   node test-server.js
   ```

2. Open the HTML test page in your browser:
   ```
   D:\h p\helaly-erp\server\test-auth.html
   ```

3. Follow the steps in the HTML page:
   - Step 1: Generate a token (choose between regular user or admin)
   - Step 2: Test the public route
   - Step 3: Test the protected route with your token
   - Step 4: Test the admin route with your token
   - Step 5: Test with an invalid token

4. Generate both types of tokens and observe the different behaviors:
   - Regular user token: Can access protected routes but not admin routes
   - Admin token: Can access both protected and admin routes

## Option 2: Using PowerShell Script

If you prefer using PowerShell:

1. Start the test server:
   ```
   cd D:\h p\helaly-erp\server
   node test-server.js
   ```

2. In a new PowerShell window, run the test script:
   ```
   cd D:\h p\helaly-erp\server
   .\test-auth.ps1
   ```

3. The script will generate tokens for you. To test with a specific token:
   ```
   .\test-auth.ps1 "your.token.here"
   ```

## Option 3: Using Batch File

For Windows users who prefer using batch files:

1. Open a command prompt and run:
   ```
   cd D:\h p\helaly-erp\server
   test-auth.bat
   ```

2. Follow the instructions in the command prompt window.

## Option 4: Manual Testing with curl

If you want to test manually with curl commands:

### Step 1: Start the Test Server

1. Open a terminal/command prompt
2. Navigate to the server directory:
   ```
   cd D:\h p\helaly-erp\server
   ```
3. Run the test server:
   ```
   node test-server.js
   ```
4. You should see output confirming the server is running at http://localhost:3000

### Step 2: Test the Public Route

This route doesn't require authentication.

1. Open your browser and navigate to:
   ```
   http://localhost:3000/api/public
   ```
2. Or use curl:
   ```
   curl http://localhost:3000/api/public
   ```
3. You should see a JSON response: `{"message":"This is a public route - no authentication required"}`

### Step 3: Test Protected Route Without Authentication

This will test the authentication middleware's rejection of unauthenticated requests.

1. Open your browser and navigate to:
   ```
   http://localhost:3000/api/protected
   ```
2. Or use curl:
   ```
   curl http://localhost:3000/api/protected
   ```
3. You should see a 401 Unauthorized response: `{"message":"No authorization header, authentication required"}`

### Step 4: Generate Test Tokens

1. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
2. You'll see a simple web interface
3. Select "Regular User" from the dropdown
4. Click "Generate Token"
5. Copy the generated token and the curl commands for testing

### Step 5: Test Protected Route With Regular User Token

1. Use the curl command provided in the web interface, or:
   ```
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/protected
   ```
2. Replace `YOUR_TOKEN_HERE` with the token you generated
3. You should see a successful response with your user information

### Step 6: Test Admin Route With Regular User Token

This will test the isAdmin middleware's rejection of non-admin users.

1. Use the curl command provided in the web interface, or:
   ```
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/admin
   ```
2. You should see a 403 Forbidden response: `{"message":"Access denied, admin privileges required"}`

### Step 7: Generate Admin Token

1. Go back to http://localhost:3000
2. Select "Admin User" from the dropdown
3. Click "Generate Token"
4. Copy the new admin token

### Step 8: Test Admin Route With Admin Token

1. Use the curl command provided in the web interface with the admin token:
   ```
   curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" http://localhost:3000/api/admin
   ```
2. You should see a successful response: `{"message":"You accessed an admin route!","user":{"id":"admin-123","role":"admin","iat":...}}`

### Step 9: Test Invalid Token Format

1. Try accessing the protected route with an invalid token format:
   ```
   curl -H "Authorization: InvalidFormat" http://localhost:3000/api/protected
   ```
2. You should see a 401 response: `{"message":"Invalid token format, Bearer scheme required"}`

### Step 10: Test Invalid Token

1. Try accessing the protected route with an invalid token:
   ```
   curl -H "Authorization: Bearer invalid.token.here" http://localhost:3000/api/protected
   ```
2. You should see a 401 response: `{"message":"Invalid token"}`

## Summary of Test Cases

1. ✅ Public route - No auth required
2. ✅ Protected route without auth - Should return 401
3. ✅ Protected route with valid user token - Should succeed
4. ✅ Admin route with user token - Should return 403
5. ✅ Admin route with admin token - Should succeed
6. ✅ Invalid token format - Should return 401
7. ✅ Invalid token - Should return 401 