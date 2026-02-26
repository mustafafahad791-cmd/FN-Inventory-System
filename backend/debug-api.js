const http = require('http');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(label, message, color = 'reset') {
  console.log(`${colors[color]}[${label}]${colors.reset} ${message}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
          isJSON: res.headers['content-type'] && res.headers['content-type'].includes('application/json'),
          isHTML: responseData.trim().startsWith('<!DOCTYPE') || responseData.trim().startsWith('<html')
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runDebugTests() {
  log('DEBUG', 'Starting API Debug Tests', 'cyan');
  log('DEBUG', '='.repeat(60), 'cyan');

  try {
    // Test 1: Health Check
    log('TEST 1', 'Testing GET /api/health', 'blue');
    const health = await makeRequest('GET', '/api/health');
    log('STATUS', `Code: ${health.statusCode}`, health.statusCode === 200 ? 'green' : 'red');
    log('HEADERS', `Content-Type: ${health.headers['content-type']}`, 'yellow');
    log('IS JSON', health.isJSON ? 'YES' : 'NO', health.isJSON ? 'green' : 'red');
    log('IS HTML', health.isHTML ? 'YES' : 'NO', health.isHTML ? 'red' : 'green');
    log('BODY', health.body, health.isJSON ? 'green' : 'red');
    console.log('');

    // Test 2: Register with valid data
    log('TEST 2', 'Testing POST /api/auth/register (Valid Data)', 'blue');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'Test User'
    };
    
    const register = await makeRequest('POST', '/api/auth/register', testUser);
    log('STATUS', `Code: ${register.statusCode}`, register.statusCode === 201 ? 'green' : 'red');
    log('HEADERS', `Content-Type: ${register.headers['content-type']}`, 'yellow');
    log('IS JSON', register.isJSON ? 'YES' : 'NO', register.isJSON ? 'green' : 'red');
    log('IS HTML', register.isHTML ? 'YES' : 'NO', register.isHTML ? 'red' : 'green');
    log('BODY', register.body, register.isJSON ? 'green' : 'red');
    console.log('');

    // Test 3: Register with invalid data (missing password)
    log('TEST 3', 'Testing POST /api/auth/register (Invalid Data - Missing Password)', 'blue');
    const invalidReg = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com'
    });
    log('STATUS', `Code: ${invalidReg.statusCode}`, invalidReg.statusCode === 400 ? 'green' : 'red');
    log('HEADERS', `Content-Type: ${invalidReg.headers['content-type']}`, 'yellow');
    log('IS JSON', invalidReg.isJSON ? 'YES' : 'NO', invalidReg.isJSON ? 'green' : 'red');
    log('IS HTML', invalidReg.isHTML ? 'YES' : 'NO', invalidReg.isHTML ? 'red' : 'green');
    log('BODY', invalidReg.body, invalidReg.isJSON ? 'green' : 'red');
    console.log('');

    // Test 4: Login with valid credentials
    log('TEST 4', 'Testing POST /api/auth/login (Valid Credentials)', 'blue');
    const login = await makeRequest('POST', '/api/auth/login', {
      username: 'Mustafa',
      password: 'password123'
    });
    log('STATUS', `Code: ${login.statusCode}`, [200, 401, 400].includes(login.statusCode) ? 'green' : 'red');
    log('HEADERS', `Content-Type: ${login.headers['content-type']}`, 'yellow');
    log('IS JSON', login.isJSON ? 'YES' : 'NO', login.isJSON ? 'green' : 'red');
    log('IS HTML', login.isHTML ? 'YES' : 'NO', login.isHTML ? 'red' : 'green');
    log('BODY', login.body, login.isJSON ? 'green' : 'red');
    console.log('');

    // Test 5: Invalid endpoint (should return 404)
    log('TEST 5', 'Testing GET /api/nonexistent (Should be 404)', 'blue');
    const notFound = await makeRequest('GET', '/api/nonexistent');
    log('STATUS', `Code: ${notFound.statusCode}`, notFound.statusCode === 404 ? 'green' : 'red');
    log('HEADERS', `Content-Type: ${notFound.headers['content-type']}`, 'yellow');
    log('IS JSON', notFound.isJSON ? 'YES' : 'NO', notFound.isJSON ? 'green' : 'red');
    log('IS HTML', notFound.isHTML ? 'YES' : 'NO', notFound.isHTML ? 'red' : 'green');
    log('BODY', notFound.body, notFound.isJSON ? 'green' : 'red');
    console.log('');

    // Summary
    log('DEBUG', '='.repeat(60), 'cyan');
    log('SUMMARY', 'Debug tests completed!', 'cyan');

  } catch (error) {
    log('ERROR', `Connection failed: ${error.message}`, 'red');
    log('ERROR', 'Make sure the backend is running on http://localhost:5000', 'red');
  }
}

runDebugTests();
