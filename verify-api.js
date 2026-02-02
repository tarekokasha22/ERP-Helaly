const http = require('http');

// Configuration
const API_PORT = 5000;
const BASE_URL = `http://localhost:${API_PORT}`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

// Helper to make HTTP requests
function request(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, headers: res.headers, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Main verification flow
async function verify() {
    log('🚀 Starting API Verification...', colors.cyan);
    log(`   Target: ${BASE_URL}`, colors.cyan);
    console.log('-'.repeat(50));

    try {
        // 1. Check Health/Root
        log('1️⃣  Checking Server Health...');
        try {
            const health = await request('/health');
            if (health.status === 200) {
                log(`   ✅ Server is UP (Status: ${health.status})`, colors.green);
            } else {
                log(`   ❌ Server returned status ${health.status}`, colors.red);
                log(`   Response: ${JSON.stringify(health.data)}`, colors.red);
                process.exit(1);
            }
        } catch (e) {
            log(`   ❌ Could not connect to server: ${e.message}`, colors.red);
            log('   👉 Please ensure the backend server is running on port 5000', colors.yellow);
            process.exit(1);
        }

        // 2. Check Employee Route Existence (Test DEBUG route if implemented, or standard)
        // We expect 401 for protected routes without token, NOT 404
        log('\n2️⃣  Checking Employee Route Existence...');
        const noAuth = await request('/api/employees/egypt');
        if (noAuth.status === 401) {
            log('   ✅ Route exists and is protected (Status: 401)', colors.green);
        } else if (noAuth.status === 404) {
            log('   ❌ Route NOT FOUND (Status: 404)', colors.red);
            log('   👉 The server is not registering the /api/employees route properly', colors.yellow);
        } else {
            log(`   ⚠️ Unexpected status: ${noAuth.status}`, colors.yellow);
            log(`   Response: ${JSON.stringify(noAuth.data)}`, colors.yellow);
        }

        // 3. Login to get Token
        log('\n3️⃣  Attempting Admin Login...');
        const login = await request('/api/auth/login', 'POST', {
            username: 'admin',
            password: 'admin123',
            country: 'egypt'
        });

        if (login.status !== 200 || !login.data.token) {
            log('   ❌ Login Failed', colors.red);
            log(`   Response: ${JSON.stringify(login.data)}`, colors.red);
            process.exit(1);
        }

        const token = login.data.token;
        const country = login.data.user.country;
        log(`   ✅ Login Successful! Token received.`, colors.green);
        log(`   User Country: ${country}`, colors.green);

        // 4. Fetch Employees with Token
        log(`\n4️⃣  Fetching Employees for ${country}...`);
        const employees = await request(`/api/employees/${country}`, 'GET', null, {
            'Authorization': `Bearer ${token}`
        });

        if (employees.status === 200) {
            log(`   ✅ Success! Found ${employees.data.data?.length || 0} employees`, colors.green);
        } else {
            log(`   ❌ Failed to fetch employees (Status: ${employees.status})`, colors.red);
            log(`   Response: ${JSON.stringify(employees.data)}`, colors.red);
        }

        // 5. Fetch Payments with Token
        log(`\n5️⃣  Fetching Payments for ${country}...`);
        const payments = await request(`/api/payments/${country}`, 'GET', null, {
            'Authorization': `Bearer ${token}`
        });

        if (payments.status === 200) {
            log(`   ✅ Success! Found ${payments.data.data?.length || 0} payments`, colors.green);
        } else {
            log(`   ❌ Failed to fetch payments (Status: ${payments.status})`, colors.red);
            log(`   Response: ${JSON.stringify(payments.data)}`, colors.red);
        }

    } catch (error) {
        log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
    }

    console.log('-'.repeat(50));
    log('Example usage to start server (in separate terminal):', colors.cyan);
    log('cd server && npm run dev', colors.cyan);
}

verify();
