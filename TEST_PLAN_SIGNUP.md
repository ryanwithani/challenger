# Complete Test Plan: Sign-Up Process

## Overview
This test plan covers all aspects of the sign-up process for the Challenger application, including frontend validation, backend API, security features, user flows, and edge cases.

---

## 1. Frontend Form Validation Tests

### 1.1 Username Field Validation

#### Test Cases:
1. **Valid Username**
   - **Input**: `testuser123`
   - **Expected**: No error, form accepts input
   - **Validation Rules**: 3-20 chars, lowercase letters, numbers, `-`, `_`

2. **Username Too Short**
   - **Input**: `ab`
   - **Expected**: Error: "Username must be at least 3 characters"
   - **Trigger**: On blur or submit

3. **Username Too Long**
   - **Input**: `thisusernameistoolongforvalidation`
   - **Expected**: Error: "Username must be less than 20 characters"

4. **Invalid Characters**
   - **Input**: `Test User!`, `user@name`, `user name`
   - **Expected**: Error: "Username can only contain lowercase letters, numbers, - and _"

5. **Reserved Username**
   - **Input**: `admin`, `root`, `system`, `mod`, `moderator`, `support`, `help`
   - **Expected**: Error: "This username is reserved."

6. **Case Insensitivity**
   - **Input**: `TestUser`, `TESTUSER`, `TestUser123`
   - **Expected**: Automatically converted to lowercase (`testuser`, `testuser`, `testuser123`)

7. **Whitespace Handling**
   - **Input**: `  testuser  `, `test user`
   - **Expected**: Trims whitespace, converts to lowercase

8. **Empty Username**
   - **Input**: `""` or empty
   - **Expected**: Error: "Username must be at least 3 characters"

### 1.2 Email Field Validation

#### Test Cases:
1. **Valid Email**
   - **Input**: `user@example.com`, `test.user+tag@example.co.uk`
   - **Expected**: No error, accepts input

2. **Invalid Email Format**
   - **Input**: `notanemail`, `@example.com`, `user@`, `user@.com`
   - **Expected**: Error: "Please enter a valid email address"

3. **Email Too Long**
   - **Input**: `verylongemailaddressthatiswaytoolong@example.com` (254+ chars)
   - **Expected**: Error: "Email address is too long"

4. **Consecutive Dots**
   - **Input**: `user..name@example.com`
   - **Expected**: Error: "Email cannot contain consecutive dots"

5. **Email Starting/Ending with Dot**
   - **Input**: `.user@example.com`, `user.@example.com`
   - **Expected**: Error: "Email cannot start or end with a dot"

6. **Local Part Starting/Ending with Dot**
   - **Input**: `.user@example.com`, `user.@example.com`
   - **Expected**: Error: "Email username cannot start or end with a dot"

7. **Common Domain Typos**
   - **Input**: `user@gmial.com`, `user@gmai.com`, `user@yahooo.com`, `user@hotmial.com`
   - **Expected**: Error: "Please check your email domain for typos"

8. **Case Insensitivity**
   - **Input**: `User@EXAMPLE.COM`, `USER@Example.Com`
   - **Expected**: Automatically converted to lowercase

9. **Empty Email**
   - **Input**: `""` or empty
   - **Expected**: Error: "Email is required"

### 1.3 Password Field Validation

#### Test Cases:
1. **Valid Password**
   - **Input**: `ValidPass123!@#`
   - **Expected**: No error, all validation checks pass
   - **Requirements**: 
     - At least 12 characters
     - Contains uppercase letter
     - Contains lowercase letter
     - Contains number
     - Contains symbol

2. **Password Too Short**
   - **Input**: `Short1!`
   - **Expected**: Error: "Use at least 12 characters."

3. **Password Too Long**
   - **Input**: `Password123!` (128+ characters)
   - **Expected**: Error: "Password is too long"

4. **Missing Uppercase**
   - **Input**: `lowercase123!@#`
   - **Expected**: Error: "Add an uppercase letter."

5. **Missing Lowercase**
   - **Input**: `UPPERCASE123!@#`
   - **Expected**: Error: "Add a lowercase letter."

6. **Missing Number**
   - **Input**: `NoNumbers!@#`
   - **Expected**: Error: "Add a number."

7. **Missing Symbol**
   - **Input**: `NoSymbol123`
   - **Expected**: Error: "Add a symbol."

8. **Password Strength Indicator**
   - **Input**: Various password combinations
   - **Expected**: Visual feedback shows which requirements are met (if implemented)

9. **Empty Password**
   - **Input**: `""` or empty
   - **Expected**: Error: "Use at least 12 characters."

10. **Password Visibility Toggle**
    - **Action**: Click password visibility toggle
    - **Expected**: Password field switches between masked and visible

### 1.4 Form-Level Validation

#### Test Cases:
1. **All Fields Valid**
   - **Input**: Valid username, email, password
   - **Expected**: Form submits successfully

2. **Multiple Field Errors**
   - **Input**: Invalid username, invalid email, weak password
   - **Expected**: All errors displayed simultaneously

3. **Error Clearing on Input**
   - **Action**: Enter invalid data, see error, then correct the field
   - **Expected**: Error clears as user types

4. **Real-time Validation on Blur**
   - **Action**: Focus field, enter invalid data, blur field
   - **Expected**: Error appears on blur

5. **Form Submission with Errors**
   - **Action**: Submit form with invalid data
   - **Expected**: Submission blocked, errors displayed

---

## 2. Client-Side Security Tests

### 2.1 Honeypot Field

#### Test Cases:
1. **Honeypot Empty (Valid)**
   - **Input**: `website` field left empty
   - **Expected**: Form submits normally

2. **Honeypot Filled (Bot Detection)**
   - **Input**: `website` field contains any value
   - **Expected**: 
     - Form submission blocked
     - Returns success (200) to bot but no account created
     - Console warning: "Honeypot triggered - possible bot submission"
     - Global error: "Submission blocked - please try again"

3. **Honeypot Visibility**
   - **Action**: Inspect form HTML
   - **Expected**: Honeypot field is hidden (CSS `display: none` or similar)

### 2.2 CSRF Protection

#### Test Cases:
1. **Valid CSRF Token**
   - **Action**: Submit form with valid CSRF token
   - **Expected**: Request succeeds

2. **Missing CSRF Token**
   - **Action**: Submit form without CSRF token
   - **Expected**: Request rejected with 403 Forbidden

3. **Invalid CSRF Token**
   - **Action**: Submit form with invalid/corrupted CSRF token
   - **Expected**: Request rejected with 403 Forbidden

4. **Expired CSRF Token**
   - **Action**: Use CSRF token after expiration
   - **Expected**: Request rejected, new token provided

---

## 3. Server-Side API Tests

### 3.1 Endpoint: POST /api/auth/signup

#### Test Cases:

1. **Successful Signup**
   - **Request**: Valid username, email, password, empty website field, valid CSRF token
   - **Expected**: 
     - Status: 200 OK
     - Response: `{ success: true, user: {...}, message: 'Account created successfully' }`
     - User created in Supabase Auth
     - User profile created in `users` table
     - Username stored in lowercase

2. **Missing Required Fields**
   - **Request**: Missing username, email, or password
   - **Expected**: 
     - Status: 400 Bad Request
     - Response: `{ error: 'All fields are required' }`

3. **Username Already Exists**
   - **Request**: Username that exists in database (case-insensitive)
   - **Expected**: 
     - Status: 400 Bad Request
     - Response: `{ field: 'username', error: 'This username is already taken' }`

4. **Email Already Registered**
   - **Request**: Email that exists in Supabase Auth
   - **Expected**: 
     - Status: 400 Bad Request
     - Response: `{ field: 'email', error: 'This email is already registered' }`

5. **Invalid Email Format (Server-side)**
   - **Request**: Email that passes client validation but fails server validation
   - **Expected**: 
     - Status: 400 Bad Request
     - Response: `{ field: 'email', error: 'Please enter a valid email address' }`

6. **Weak Password (Server-side)**
   - **Request**: Password that doesn't meet requirements
   - **Expected**: 
     - Status: 400 Bad Request
     - Response: `{ field: 'password', error: '<specific validation error>' }`

7. **Rate Limiting**
   - **Action**: Submit 4 signup requests from same IP within 1 hour
   - **Expected**: 
     - First 3 requests: Success
     - 4th request: Status 429 Too Many Requests
     - Response: `{ error: 'Too many signup attempts. Please try again in an hour.' }`
     - Headers: `Retry-After: 3600`

8. **Honeypot Triggered (Server-side)**
   - **Request**: `website` field contains any value
   - **Expected**: 
     - Status: 200 OK
     - Response: `{ success: true }`
     - No account created (silent rejection)

9. **Server Error**
   - **Action**: Simulate database/Supabase error
   - **Expected**: 
     - Status: 500 Internal Server Error
     - Response: `{ error: 'Failed to create account. Please try again.' }`

10. **Profile Creation Failure**
    - **Action**: Simulate users table insert failure
    - **Expected**: 
      - Signup still succeeds (user can sign in)
      - Profile created on first login via auth store
      - Error logged to console

---

## 4. User Flow Tests

### 4.1 Complete Signup Flow

#### Test Cases:
1. **Happy Path - Full Onboarding**
   - **Steps**:
     1. Navigate to `/signup`
     2. Fill in username, email, password
     3. Submit account creation
     4. Select expansion packs
     5. Complete welcome step
     6. Choose destination (Dashboard, New Challenge, New Sim)
   - **Expected**: 
     - Account created successfully
     - Redirected to chosen destination
     - User logged in
     - Onboarding data cleared from localStorage

2. **Signup with Skip Packs**
   - **Steps**:
     1. Create account
     2. Skip pack selection
   - **Expected**: 
     - Default preferences created (base_game only)
     - Proceeds to welcome step

3. **Signup with Pack Selection**
   - **Steps**:
     1. Create account
     2. Select multiple expansion packs
     3. Submit
   - **Expected**: 
     - User preferences saved with selected packs
     - Proceeds to welcome step

### 4.2 Form Persistence

#### Test Cases:
1. **Auto-save on Input**
   - **Action**: Enter data in form fields, wait 500ms
   - **Expected**: Data saved to localStorage under `onboarding_account_data`

2. **Form Restoration on Page Reload**
   - **Action**: Fill form partially, reload page
   - **Expected**: Form data restored from localStorage

3. **Clear Data on Success**
   - **Action**: Complete signup successfully
   - **Expected**: `onboarding_account_data` cleared from localStorage

4. **Clear Data on Completion**
   - **Action**: Complete entire onboarding flow
   - **Expected**: 
     - `onboarding_progress` cleared
     - `onboarding_account_data` cleared
     - `onboarding_packs_data` cleared

---

## 5. Integration Tests

### 5.1 Frontend-Backend Integration

#### Test Cases:
1. **End-to-End Signup**
   - **Action**: Complete signup from form submission to dashboard
   - **Expected**: 
     - Client validation passes
     - API call succeeds
     - User authenticated
     - Redirect to dashboard works

2. **Error Handling Integration**
   - **Action**: Submit form with server-side error
   - **Expected**: 
     - Error message displayed in UI
     - Form remains in editable state
     - User can correct and resubmit

3. **CSRF Token Management**
   - **Action**: Submit form multiple times
   - **Expected**: 
     - CSRF tokens refreshed as needed
     - Form continues to work

### 5.2 Database Integration

#### Test Cases:
1. **User Profile Creation**
   - **Action**: Complete signup
   - **Expected**: 
     - Row created in `users` table
     - `id` matches Supabase Auth user ID
     - `username` stored in lowercase
     - `display_name` set to username
     - `email` matches auth email
     - `created_at` timestamp set

2. **User Preferences Creation**
   - **Action**: Complete signup with pack selection
   - **Expected**: 
     - Preferences saved in database
     - All selected packs stored correctly

---

## 6. Error Handling Tests

### 6.1 Network Error Handling

#### Test Cases:
1. **Network Failure**
   - **Action**: Disconnect network, submit form
   - **Expected**: 
     - Error message displayed
     - Form remains editable
     - User can retry

2. **Timeout Handling**
   - **Action**: Simulate slow network/timeout
   - **Expected**: 
     - Loading state shown
     - Error message after timeout
     - User can retry

### 6.2 Server Error Handling

#### Test Cases:
1. **500 Server Error**
   - **Action**: Simulate server error
   - **Expected**: 
     - Generic error message displayed
     - User can retry
     - No sensitive information exposed

2. **Field-Specific Errors**
   - **Action**: Submit form with field validation errors
   - **Expected**: 
     - Error displayed next to specific field
     - Other fields remain editable

3. **Global Errors**
   - **Action**: Submit form with non-field-specific errors
   - **Expected**: 
     - Global error message displayed at top of form
     - Form remains editable

---

## 7. Edge Cases and Boundary Tests

### 7.1 Username Edge Cases

#### Test Cases:
1. **Minimum Length**
   - **Input**: `abc` (3 characters)
   - **Expected**: Valid

2. **Maximum Length**
   - **Input**: `abcdefghijklmnopqrs` (20 characters)
   - **Expected**: Valid

3. **Boundary Conditions**
   - **Input**: `ab` (2 chars), `abc` (3 chars), `abcdefghijklmnopqrst` (21 chars)
   - **Expected**: Appropriate errors for boundaries

4. **Special Characters**
   - **Input**: `user-name`, `user_name`, `user123`, `user-name_123`
   - **Expected**: All valid

5. **Unicode Characters**
   - **Input**: `用户`, `ñame`, `üser`
   - **Expected**: Error (only ASCII lowercase allowed)

### 7.2 Email Edge Cases

#### Test Cases:
1. **Maximum Length**
   - **Input**: Email exactly 254 characters
   - **Expected**: Valid

2. **Plus Addressing**
   - **Input**: `user+tag@example.com`
   - **Expected**: Valid

3. **Subdomain**
   - **Input**: `user@sub.example.com`
   - **Expected**: Valid

4. **International Domain**
   - **Input**: `user@example.co.uk`
   - **Expected**: Valid

### 7.3 Password Edge Cases

#### Test Cases:
1. **Minimum Length**
   - **Input**: Exactly 12 characters meeting all requirements
   - **Expected**: Valid

2. **Maximum Length**
   - **Input**: Exactly 128 characters
   - **Expected**: Valid

3. **Boundary Conditions**
   - **Input**: 11 characters, 12 characters, 129 characters
   - **Expected**: Appropriate errors

4. **All Requirement Types**
   - **Input**: `A1b2c3d4e5f6!` (has all: upper, lower, number, symbol)
   - **Expected**: Valid

---

## 8. Accessibility Tests

### 8.1 Form Accessibility

#### Test Cases:
1. **Label Association**
   - **Action**: Check form labels
   - **Expected**: All inputs have associated labels

2. **Error Announcements**
   - **Action**: Submit form with errors
   - **Expected**: Errors announced by screen readers

3. **Keyboard Navigation**
   - **Action**: Navigate form with keyboard only
   - **Expected**: All fields accessible via Tab key

4. **Focus Management**
   - **Action**: Submit form with errors
   - **Expected**: Focus moves to first error field

5. **ARIA Attributes**
   - **Action**: Inspect form elements
   - **Expected**: Appropriate ARIA attributes present

---

## 9. Performance Tests

### 9.1 Form Performance

#### Test Cases:
1. **Auto-save Debouncing**
   - **Action**: Type rapidly in form fields
   - **Expected**: localStorage write only after 500ms pause

2. **Validation Performance**
   - **Action**: Enter data and validate
   - **Expected**: Validation completes in <100ms

3. **Large Form Data**
   - **Action**: Enter maximum length values
   - **Expected**: No performance degradation

---

## 10. Browser Compatibility Tests

### 10.1 Cross-Browser Testing

#### Test Cases:
1. **Chrome**
   - **Action**: Complete signup flow
   - **Expected**: All features work correctly

2. **Firefox**
   - **Action**: Complete signup flow
   - **Expected**: All features work correctly

3. **Safari**
   - **Action**: Complete signup flow
   - **Expected**: All features work correctly

4. **Edge**
   - **Action**: Complete signup flow
   - **Expected**: All features work correctly

5. **Mobile Browsers**
   - **Action**: Complete signup on mobile device
   - **Expected**: Form responsive, touch-friendly

---

## 11. Security Tests

### 11.1 Input Sanitization

#### Test Cases:
1. **XSS Prevention**
   - **Input**: `<script>alert('xss')</script>`, `javascript:alert(1)`
   - **Expected**: Input sanitized, no script execution

2. **SQL Injection Prevention**
   - **Input**: `' OR '1'='1`, `'; DROP TABLE users;--`
   - **Expected**: Input treated as literal string, no SQL execution

3. **HTML Injection**
   - **Input**: `<img src=x onerror=alert(1)>`
   - **Expected**: HTML tags sanitized

### 11.2 Authentication Security

#### Test Cases:
1. **Password Hashing**
   - **Action**: Complete signup
   - **Expected**: Password hashed in database (never stored plaintext)

2. **Session Management**
   - **Action**: Complete signup
   - **Expected**: Secure session created, HTTP-only cookies

3. **Email Verification**
   - **Action**: Check Supabase Auth settings
   - **Expected**: Email verification required (if enabled)

---

## 12. Test Execution Checklist

### Pre-Execution Setup
- [ ] Test database configured
- [ ] Test Supabase project configured
- [ ] Test environment variables set
- [ ] Test accounts created for integration tests
- [ ] Rate limiting reset mechanism available

### Test Execution Order
1. **Unit Tests** (Frontend validation)
2. **Integration Tests** (API endpoints)
3. **E2E Tests** (Complete user flows)
4. **Security Tests** (Input sanitization, CSRF, etc.)
5. **Performance Tests** (Load, stress)
6. **Accessibility Tests** (WCAG compliance)

### Test Data Management
- [ ] Test usernames prepared (various valid/invalid)
- [ ] Test emails prepared (various valid/invalid)
- [ ] Test passwords prepared (various strengths)
- [ ] Cleanup procedures for test data

---

## 13. Test Scenarios Summary

### Critical Path Tests (Must Pass)
1. ✅ Valid signup with all fields
2. ✅ Invalid username validation
3. ✅ Invalid email validation
4. ✅ Weak password validation
5. ✅ Duplicate username rejection
6. ✅ Duplicate email rejection
7. ✅ Rate limiting enforcement
8. ✅ Honeypot bot detection
9. ✅ CSRF protection
10. ✅ Complete onboarding flow

### Important Tests (Should Pass)
1. Form persistence and restoration
2. Error message display
3. Network error handling
4. Server error handling
5. Field-specific error display

### Nice-to-Have Tests
1. Accessibility compliance
2. Performance optimization
3. Cross-browser compatibility
4. Mobile responsiveness

---

## 14. Test Tools and Framework Recommendations

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **E2E**: Playwright or Cypress
- **Accessibility**: axe-core, jest-axe

### Backend Testing
- **Framework**: Jest
- **API Testing**: Supertest
- **Mocking**: Mock Supabase client

### Test Coverage Goals
- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Security Tests**: All security features

---

## 15. Regression Test Suite

### Automated Tests to Run on Every PR
1. All validation tests
2. API endpoint tests
3. Security tests (CSRF, honeypot, rate limiting)
4. Critical path E2E tests

### Manual Tests (Before Release)
1. Complete signup flow
2. Error scenarios
3. Cross-browser testing
4. Mobile device testing

---

## Notes
- All tests should be deterministic (no random data)
- Test data should be cleaned up after each test run
- Use test fixtures for consistent test data
- Mock external services (email, Supabase) in unit tests
- Use real services in integration/E2E tests
- Document any test-specific environment requirements

