# Feature #1: User Authentication - Testing Guide

## ✅ FEATURE COMPLETE

**What Was Built:**
- User registration (create account)
- User login (authenticate)
- JWT token generation
- Protected routes
- Login page UI
- User model with password hashing

---

## 🧪 Testing Instructions

### **BEFORE TESTING: Database Setup Required**

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE fn_furniture_inventory;"

# 2. Run schema (includes new User table)
psql -U postgres -d fn_furniture_inventory -f database/schema.sql

# 3. Verify User table created
psql -U postgres -d fn_furniture_inventory -c "\dt \"User\";"
```

---

## 📊 Test Method 1: Manual Testing (Easiest)

### **Test 1.1: Start Backend Server**

```bash
cd backend
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
Server running on port 5000
```

---

### **Test 1.2: Start Frontend**

In a new terminal:

```bash
cd frontend
npm install  # If not already done
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view the app in the browser at http://localhost:3000
```

---

### **Test 1.3: Test Registration**

**Step 1:** Open http://localhost:3000

**Step 2:** Click "Create Account"

**Step 3:** Fill in registration form:
```
Full Name: Test Admin
Email: admin@test.com
Username: testadmin
Password: Test123
Confirm Password: Test123
```

**Step 4:** Click "Create Account"

**Expected Results:**
✅ See "Registration successful! Please login." message
✅ Form clears
✅ Auto-switches to login form

**Verify in Database:**
```bash
psql -U postgres -d fn_furniture_inventory -c "SELECT id, username, email, full_name, role, is_active FROM \"User\";"
```

Expected output:
```
                  id                  | username  |     email      | full_name  | role  | is_active
--------------------------------------+-----------+----------------+------------+-------+-----------
 <uuid>                              | testadmin | admin@test.com | Test Admin | admin | t
```

---

### **Test 1.4: Test Login**

**Step 1:** On login form, enter:
```
Username: testadmin
Password: Test123
```

**Step 2:** Click "Sign In"

**Expected Results:**
✅ Login succeeds
✅ Redirects to dashboard
✅ Can see "Dashboard (Coming Soon)" message
✅ JWT token stored in browser localStorage

**Verify Token:**
1. Open Browser DevTools (F12)
2. Go to "Application" → "Local Storage"
3. Look for token in localStorage
4. Should see a long JWT token starting with "eyJ..."

---

### **Test 1.5: Test Invalid Login**

**Step 1:** Logout and return to login page

**Step 2:** Try with wrong password:
```
Username: testadmin
Password: WrongPassword
```

**Step 3:** Click "Sign In"

**Expected Results:**
❌ Login fails
✅ See error message: "Invalid username or password"
❌ Does NOT redirect to dashboard

---

### **Test 1.6: Test Non-existent User**

**Step 1:** Try login with:
```
Username: nonexistent
Password: Test123
```

**Step 2:** Click "Sign In"

**Expected Results:**
❌ Login fails
✅ See error message: "Invalid username or password"

---

### **Test 1.7: Test Protected Route**

**Step 1:** Logout (clear localStorage or restart browser)

**Step 2:** Try to access http://localhost:3000/dashboard directly

**Expected Results:**
✅ Redirects to http://localhost:3000/login
❌ Cannot access dashboard without login

---

## 🔌 Test Method 2: API Testing (Postman)

### **Setup Postman**

1. Download Postman: https://www.postman.com/downloads/
2. Create new collection: "FN Furniture Auth"
3. Create requests below

---

### **Test 2.1: Register User (POST)**

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/register
Header: Content-Type: application/json

Body (raw JSON):
{
  "username": "postman_user",
  "email": "postman@test.com",
  "password": "Test123456",
  "confirmPassword": "Test123456",
  "fullName": "Postman Test User"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid...",
    "username": "postman_user",
    "email": "postman@test.com",
    "full_name": "Postman Test User",
    "role": "admin",
    "created_at": "2026-02-25T..."
  }
}
```

---

### **Test 2.2: Register with Duplicate Username**

**Request:**
```
Same as above but with:
"username": "testadmin"  // Already exists
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

---

### **Test 2.3: Register with Mismatched Passwords**

**Request:**
```
{
  "username": "test_pass_mismatch",
  "email": "test@test.com",
  "password": "Test123456",
  "confirmPassword": "Different456",
  "fullName": "Test User"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

---

### **Test 2.4: Register with Short Password**

**Request:**
```
{
  "username": "test_short",
  "email": "test@test.com",
  "password": "123",
  "confirmPassword": "123",
  "fullName": "Test"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

---

### **Test 2.5: Login User (POST)**

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/login
Header: Content-Type: application/json

Body (raw JSON):
{
  "username": "postman_user",
  "password": "Test123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid...",
      "username": "postman_user",
      "email": "postman@test.com",
      "fullName": "Postman Test User",
      "role": "admin"
    }
  }
}
```

⚠️ **Important:** Copy the token for next tests!

---

### **Test 2.6: Login with Wrong Password**

**Request:**
```
{
  "username": "postman_user",
  "password": "WrongPassword"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### **Test 2.7: Verify Token (GET - Protected)**

**Request:**
```
Method: GET
URL: http://localhost:5000/api/auth/verify
Header: Authorization: Bearer <PASTE_TOKEN_HERE>
```

(Replace `<PASTE_TOKEN_HERE>` with token from Test 2.5)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "username": "postman_user",
    "email": "postman@test.com",
    "full_name": "Postman Test User",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-02-25T..."
  }
}
```

---

### **Test 2.8: Verify with Invalid Token**

**Request:**
```
Method: GET
URL: http://localhost:5000/api/auth/verify
Header: Authorization: Bearer invalid_token_12345
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### **Test 2.9: Get Current User (GET - Protected)**

**Request:**
```
Method: GET
URL: http://localhost:5000/api/auth/me
Header: Authorization: Bearer <PASTE_TOKEN_HERE>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "username": "postman_user",
    "email": "postman@test.com",
    "full_name": "Postman Test User",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-02-25T..."
  }
}
```

---

### **Test 2.10: Update Profile (PUT - Protected)**

**Request:**
```
Method: PUT
URL: http://localhost:5000/api/auth/profile
Header: Authorization: Bearer <PASTE_TOKEN_HERE>
Header: Content-Type: application/json

Body (raw JSON):
{
  "email": "newemail@test.com",
  "fullName": "Updated Name"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid...",
    "username": "postman_user",
    "email": "newemail@test.com",
    "full_name": "Updated Name",
    "role": "admin"
  }
}
```

---

### **Test 2.11: Logout (POST)**

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/logout
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please clear token from client storage."
}
```

---

## 📋 Test Checklist

### **Registration Tests**
- [ ] Can register with valid data
- [ ] Cannot register with duplicate username
- [ ] Cannot register with duplicate email
- [ ] Cannot register with mismatched passwords
- [ ] Cannot register with password < 6 characters
- [ ] Cannot register with missing required fields

### **Login Tests**
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent username
- [ ] Cannot login with missing username/password
- [ ] Receives JWT token on successful login
- [ ] Token is stored in localStorage

### **Token Tests**
- [ ] Can verify valid token
- [ ] Cannot verify invalid token
- [ ] Cannot verify expired token
- [ ] Can access protected routes with token
- [ ] Cannot access protected routes without token

### **Protected Routes**
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access dashboard
- [ ] Can get current user info
- [ ] Can update user profile
- [ ] Cannot access other protected routes

### **Database Tests**
- [ ] User created in database with hashed password
- [ ] Password is never stored in plain text
- [ ] User can login immediately after registration
- [ ] User record shows correct role
- [ ] User record shows correct is_active status

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module 'bcryptjs'**
**Solution:**
```bash
cd backend
npm install bcryptjs
```

### **Issue: Database connection error**
**Solution:**
```bash
# Check if PostgreSQL is running
# Make sure database exists
psql -U postgres -l
# Should show "fn_furniture_inventory"
```

### **Issue: Port 5000 already in use**
**Solution:**
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
# Or use different port in .env
```

### **Issue: CORS error on login**
**Solution:**
- Make sure backend is running
- Check REACT_APP_API_URL in frontend/.env
- Should be: http://localhost:5000/api

### **Issue: Token not persisting after refresh**
**Solution:**
- Clear browser cache and localStorage
- Make sure AuthProvider wraps App in index.js
- Check localStorage in browser DevTools

---

## ✅ Success Criteria

**Feature #1 is successful when ALL of these pass:**

✅ User can register with valid data
✅ User can login with correct credentials
✅ JWT token is generated and stored
✅ Protected routes require authentication
✅ Invalid credentials rejected
✅ Password is hashed in database
✅ Token expires after time set in .env
✅ All API endpoints return correct responses
✅ UI properly handles success/error messages

---

## 📝 Notes

- All passwords are hashed using bcryptjs
- Tokens expire based on JWT_EXPIRY in .env (default 7d)
- Sensitive data is never logged or exposed
- All dates/times are stored as ISO 8601 format
- User IDs are UUIDs (universally unique)

---

**Created**: February 25, 2026
**Feature**: User Authentication
**Status**: ✅ READY FOR TESTING
**Next Feature**: Branch Management

---

**When all tests pass, reply with:** ✅ Authentication tests complete!

Then we'll move to **Feature #2: Branch Management**
