# UI Testing Guide - WFH Attendance System

## 📋 Overview

Panduan lengkap untuk melakukan testing UI/UX aplikasi WFH Attendance System. Dokumen ini mencakup semua skenario testing, langkah-langkah detail, dan checklist untuk memastikan aplikasi berfungsi dengan baik.

---

## 🚀 Persiapan Testing

### Prerequisites

1. **Backend API Running**
   ```bash
   cd backend
   php artisan serve
   # Backend should run on http://localhost:8000
   ```

2. **Database Seeded**
   ```bash
   cd backend
   php artisan migrate:fresh --seed
   ```

3. **Frontend Running**
   ```bash
   cd frontend
   npm run dev
   # Frontend should run on http://localhost:5173
   ```

4. **Browser**
   - Chrome/Firefox/Safari (latest version)
   - Browser DevTools opened (F12)
   - Network tab untuk monitoring API calls

### Test Accounts

**Employee Account:**
- Email: `employee@example.com`
- Password: `password123`

**Manager Account:**
- Email: `manager@example.com`
- Password: `password123`

---

## 🧪 Testing Scenarios

## 1. AUTHENTICATION TESTING

### 1.1 Login Page Testing

#### Test Case 1.1.1: Successful Login (Employee)
**Steps:**
1. Buka `http://localhost:5173`
2. Akan redirect ke `/login`
3. Input email: `employee@example.com`
4. Input password: `password123`
5. Click "Sign In"

**Expected Results:**
- ✅ Loading indicator muncul
- ✅ Success toast notification muncul
- ✅ Redirect ke `/employee/dashboard`
- ✅ Navbar menampilkan nama user dan role "employee"

#### Test Case 1.1.2: Successful Login (Manager)
**Steps:**
1. Buka `http://localhost:5173/login`
2. Input email: `manager@example.com`
3. Input password: `password123`
4. Click "Sign In"

**Expected Results:**
- ✅ Success toast notification muncul
- ✅ Redirect ke `/manager/dashboard`
- ✅ Navbar menampilkan nama user dan role "manager"

#### Test Case 1.1.3: Failed Login - Invalid Credentials
**Steps:**
1. Input email: `wrong@example.com`
2. Input password: `wrongpassword`
3. Click "Sign In"

**Expected Results:**
- ✅ Error toast notification: "Invalid credentials"
- ✅ Tetap di halaman login
- ✅ Form tidak di-reset

#### Test Case 1.1.4: Validation - Empty Fields
**Steps:**
1. Leave email empty
2. Leave password empty
3. Click "Sign In"

**Expected Results:**
- ✅ Error message "Email is required"
- ✅ Error message "Password is required"
- ✅ No API call made

#### Test Case 1.1.5: Validation - Invalid Email Format
**Steps:**
1. Input email: `notanemail`
2. Input password: `password123`
3. Click "Sign In"

**Expected Results:**
- ✅ HTML5 validation error muncul
- ✅ No API call made

### 1.2 Logout Testing

#### Test Case 1.2.1: Successful Logout
**Steps:**
1. Login sebagai employee/manager
2. Click "Logout" button di navbar
3. Confirm logout

**Expected Results:**
- ✅ Success toast: "Logged out successfully"
- ✅ Redirect ke `/login`
- ✅ Token removed from localStorage
- ✅ User data removed from localStorage

### 1.3 Protected Routes Testing

#### Test Case 1.3.1: Access Protected Route Without Login
**Steps:**
1. Logout dari aplikasi
2. Manually navigate ke `http://localhost:5173/employee/dashboard`

**Expected Results:**
- ✅ Redirect ke `/login`

#### Test Case 1.3.2: Access Wrong Role Route
**Steps:**
1. Login sebagai employee
2. Manually navigate ke `http://localhost:5173/manager/dashboard`

**Expected Results:**
- ✅ Redirect ke `/employee/dashboard` (home route)

---

## 2. EMPLOYEE FEATURES TESTING

### 2.1 Employee Dashboard Testing

#### Test Case 2.1.1: View Dashboard (Not Checked In)
**Steps:**
1. Login sebagai employee
2. View dashboard

**Expected Results:**
- ✅ "Check In" button visible
- ✅ Current Status: "Checked Out" (gray)
- ✅ Today's Hours: 0 hours
- ✅ Remaining Hours: 7 hours
- ✅ Progress bar at 0%
- ✅ No current session card shown

#### Test Case 2.1.2: Check-In with Tasks
**Steps:**
1. Click "Check In" button
2. Modal "Check In" muncul
3. Input task 1: "Complete feature X"
4. Click "Add Task"
5. Input task 2: "Fix bug Y"
6. Click "Check In"

**Expected Results:**
- ✅ Loading state on button
- ✅ Success toast: "Checked in successfully"
- ✅ Modal closes
- ✅ Dashboard refreshes
- ✅ Current Status: "Checked In" (green)
- ✅ "Check Out" button visible (red)
- ✅ Current Session card shows:
  - Check-in time
  - Elapsed hours (updating)
  - List of tasks
- ✅ Progress bar updates

#### Test Case 2.1.3: Check-In Validation - No Tasks
**Steps:**
1. Click "Check In"
2. Leave task field empty
3. Try to submit

**Expected Results:**
- ✅ HTML5 validation: "Please fill out this field"
- ✅ Cannot submit

#### Test Case 2.1.4: Check-In Validation - Already Checked In
**Steps:**
1. Already checked in
2. Try to check in again (via API or refresh)

**Expected Results:**
- ✅ Error toast: "You have already checked in. Please check out first."

#### Test Case 2.1.5: Check-Out with Task Status
**Steps:**
1. Already checked in with 2 tasks
2. Click "Check Out" button
3. Modal "Check Out" muncul
4. Mark task 1 as completed (check checkbox)
5. Leave task 2 unchecked
6. Input blocker reason for task 2: "Waiting for API credentials"
7. Click "Check Out"

**Expected Results:**
- ✅ Success toast with total hours
- ✅ Modal closes
- ✅ Dashboard refreshes
- ✅ Current Status: "Checked Out"
- ✅ "Check In" button visible
- ✅ Today's Hours updated
- ✅ Progress bar updated
- ✅ Previous Sessions card shows completed session

#### Test Case 2.1.6: Check-Out Validation - Missing Blocker Reason
**Steps:**
1. Click "Check Out"
2. Leave task unchecked (incomplete)
3. Leave blocker reason empty
4. Try to submit

**Expected Results:**
- ✅ Alert: "Please provide blocker reason for incomplete tasks"
- ✅ Cannot submit

#### Test Case 2.1.7: Multiple Check-Ins (Installment System)
**Steps:**
1. Check in at 9:00 AM
2. Check out at 12:00 PM (3 hours)
3. Check in again at 2:00 PM
4. View dashboard

**Expected Results:**
- ✅ Today's Hours shows cumulative hours (3 hours)
- ✅ Previous Sessions card shows first session
- ✅ Current Session shows second session
- ✅ Progress bar shows cumulative progress

#### Test Case 2.1.8: Complete 7 Hours
**Steps:**
1. Work until total hours >= 7

**Expected Results:**
- ✅ Progress bar turns green
- ✅ Message: "✓ Daily requirement completed!"
- ✅ Remaining Hours: 0 hours (green)

### 2.2 Employee Report Testing

#### Test Case 2.2.1: View Personal Report
**Steps:**
1. Navigate to "My Report" from sidebar
2. View report page

**Expected Results:**
- ✅ Summary cards show:
  - Total Days Worked
  - Total Hours
  - Avg Hours/Day
  - Task Completion Rate
- ✅ Date filter with default current month
- ✅ Attendance details listed by date
- ✅ Each attendance shows:
  - Date
  - Status badge (complete/incomplete/overtime)
  - Sessions with times
  - Tasks completed/incomplete count

#### Test Case 2.2.2: Filter Report by Date Range
**Steps:**
1. Change start date to "2024-01-01"
2. Change end date to "2024-01-31"
3. Click "Apply Filter"

**Expected Results:**
- ✅ Loading indicator
- ✅ Report refreshes with filtered data
- ✅ Summary statistics recalculated
- ✅ Only attendances in date range shown

#### Test Case 2.2.3: View Empty Report
**Steps:**
1. Select date range with no attendance
2. Apply filter

**Expected Results:**
- ✅ Message: "No attendance records found for the selected period"
- ✅ Summary shows zeros

### 2.3 Leave Management Testing

#### Test Case 2.3.1: View Leave Requests Page
**Steps:**
1. Navigate to "Leave Requests" from sidebar

**Expected Results:**
- ✅ Page title: "Leave Requests"
- ✅ "Request Leave" button visible
- ✅ List of leave requests (if any)

#### Test Case 2.3.2: Request New Leave
**Steps:**
1. Click "Request Leave"
2. Modal opens
3. Input start date: tomorrow's date
4. Input end date: 2 days from now
5. Input reason: "Family emergency - need to visit hometown"
6. Click "Submit Request"

**Expected Results:**
- ✅ Success toast: "Leave request submitted successfully"
- ✅ Modal closes
- ✅ New leave appears in list with status "pending"
- ✅ Leave card shows:
  - Date range
  - Reason
  - Status badge (yellow/pending)
  - Requested date

#### Test Case 2.3.3: Leave Validation - Short Reason
**Steps:**
1. Click "Request Leave"
2. Input reason: "sick" (< 10 characters)
3. Try to submit

**Expected Results:**
- ✅ Error toast: "Reason must be at least 10 characters"
- ✅ Character counter shows: "4/500 characters (minimum 10)"

#### Test Case 2.3.4: Leave Validation - Invalid Date Range
**Steps:**
1. Input start date: "2024-01-15"
2. Input end date: "2024-01-10" (before start date)
3. Try to submit

**Expected Results:**
- ✅ HTML5 validation prevents submission
- ✅ End date field shows error

#### Test Case 2.3.5: View Approved Leave
**Steps:**
1. After manager approves leave
2. View leave list

**Expected Results:**
- ✅ Status badge: "approved" (green)
- ✅ Manager's notes visible (if provided)
- ✅ Approved by and date shown

#### Test Case 2.3.6: View Rejected Leave
**Steps:**
1. After manager rejects leave
2. View leave list

**Expected Results:**
- ✅ Status badge: "rejected" (red)
- ✅ Manager's notes visible with rejection reason

---

## 3. MANAGER FEATURES TESTING

### 3.1 Manager Dashboard Testing

#### Test Case 3.1.1: View Manager Dashboard
**Steps:**
1. Login sebagai manager
2. View dashboard

**Expected Results:**
- ✅ Summary cards show:
  - Total Employees
  - Checked In Now
  - On Leave
  - Avg Daily Hours
- ✅ Date filter (default: today)
- ✅ Employee status table with columns:
  - Employee (name, email)
  - Status (checked_in/checked_out/on_leave)
  - Today's hours
  - This week's hours
  - This month's hours

#### Test Case 3.1.2: Filter by Date
**Steps:**
1. Change date to yesterday
2. View changes

**Expected Results:**
- ✅ Dashboard refreshes
- ✅ Data shows for selected date
- ✅ Employee statuses update

#### Test Case 3.1.3: View Employee Details
**Steps:**
1. Observe employee in "checked_in" status

**Expected Results:**
- ✅ Status badge: green
- ✅ Shows "Since [time]" under status
- ✅ Today's hours updating

#### Test Case 3.1.4: View Employee on Leave
**Steps:**
1. Observe employee with "on_leave" status

**Expected Results:**
- ✅ Status badge: blue
- ✅ Shows leave reason under status

### 3.2 User Management Testing

#### Test Case 3.2.1: View Users List
**Steps:**
1. Navigate to "User Management"

**Expected Results:**
- ✅ Table shows all users
- ✅ Columns: User (name, email), Role, Created At, Actions
- ✅ Role badges: manager (blue), employee (green)
- ✅ Icons: Shield for manager, User for employee

#### Test Case 3.2.2: Create New Employee
**Steps:**
1. Click "Add User"
2. Modal opens
3. Input name: "John Doe"
4. Input email: "john.doe@example.com"
5. Select role: "Employee"
6. Input password: "password123"
7. Input confirm password: "password123"
8. Click "Create User"

**Expected Results:**
- ✅ Success toast: "User created successfully"
- ✅ Modal closes
- ✅ User list refreshes
- ✅ New user appears in table

#### Test Case 3.2.3: Create User Validation - Password Mismatch
**Steps:**
1. Click "Add User"
2. Input password: "password123"
3. Input confirm password: "password456"
4. Try to submit

**Expected Results:**
- ✅ Error toast: "Passwords do not match"
- ✅ Form not submitted

#### Test Case 3.2.4: Create User Validation - Duplicate Email
**Steps:**
1. Try to create user with existing email
2. Submit form

**Expected Results:**
- ✅ Error toast from API: email already exists

#### Test Case 3.2.5: Edit User
**Steps:**
1. Click edit icon on a user
2. Modal opens with pre-filled data
3. Change name to "Jane Doe Updated"
4. Leave password empty (no change)
5. Click "Update User"

**Expected Results:**
- ✅ Success toast: "User updated successfully"
- ✅ User list refreshes
- ✅ Updated name shown

#### Test Case 3.2.6: Edit User - Change Password
**Steps:**
1. Click edit on user
2. Input new password: "newpassword123"
3. Input confirm: "newpassword123"
4. Submit

**Expected Results:**
- ✅ Success toast
- ✅ Password updated (test by logging in with new password)

#### Test Case 3.2.7: Delete User
**Steps:**
1. Click delete icon on a user
2. Confirm dialog appears
3. Click "OK"

**Expected Results:**
- ✅ Confirmation dialog: "Are you sure you want to delete [name]?"
- ✅ Success toast: "User deleted successfully"
- ✅ User removed from list

### 3.3 Holiday Management Testing

#### Test Case 3.3.1: View Holidays
**Steps:**
1. Navigate to "Holidays"
2. View page

**Expected Results:**
- ✅ Year selector (default: current year)
- ✅ "Add Holiday" button
- ✅ Grid of holiday cards
- ✅ Each card shows: name, date, description, actions

#### Test Case 3.3.2: Create Holiday
**Steps:**
1. Click "Add Holiday"
2. Input name: "Christmas Day"
3. Input date: "2024-12-25"
4. Input description: "Company holiday - Christmas celebration"
5. Click "Create Holiday"

**Expected Results:**
- ✅ Success toast: "Holiday created successfully"
- ✅ Modal closes
- ✅ New holiday appears in grid

#### Test Case 3.3.3: Edit Holiday
**Steps:**
1. Click edit icon on holiday
2. Change name to "Christmas Day (Updated)"
3. Click "Update Holiday"

**Expected Results:**
- ✅ Success toast
- ✅ Holiday updated in grid

#### Test Case 3.3.4: Delete Holiday
**Steps:**
1. Click delete icon
2. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog
- ✅ Success toast
- ✅ Holiday removed

#### Test Case 3.3.5: Filter by Year
**Steps:**
1. Change year selector to 2025
2. View changes

**Expected Results:**
- ✅ Only holidays for 2025 shown
- ✅ If no holidays: "No holidays found for 2025"

### 3.4 Leave Approval Testing

#### Test Case 3.4.1: View Leave Requests
**Steps:**
1. Navigate to "Leave Approval"

**Expected Results:**
- ✅ Status filter dropdown (default: pending)
- ✅ List of leave requests
- ✅ Each request shows:
  - Employee name and email
  - Date range
  - Reason
  - Status badge
  - Action buttons (if pending)

#### Test Case 3.4.2: Approve Leave Request
**Steps:**
1. Filter: "Pending"
2. Click "Approve" on a request
3. Modal opens
4. Input notes: "Approved. Take care!"
5. Click "Approve"

**Expected Results:**
- ✅ Confirmation modal shows employee details
- ✅ Success toast: "Leave request approved"
- ✅ Request removed from pending list
- ✅ Status changed to "approved"

#### Test Case 3.4.3: Reject Leave Request
**Steps:**
1. Click "Reject" on a pending request
2. Input notes: "We have a critical deadline. Can you reschedule?"
3. Click "Reject"

**Expected Results:**
- ✅ Success toast: "Leave request rejected"
- ✅ Status changed to "rejected"
- ✅ Notes visible in request card

#### Test Case 3.4.4: Filter by Status
**Steps:**
1. Change filter to "Approved"
2. View list

**Expected Results:**
- ✅ Only approved requests shown
- ✅ No action buttons (already processed)
- ✅ Shows approver name and date

### 3.5 Activity Logs Testing

#### Test Case 3.5.1: View Activity Logs
**Steps:**
1. Navigate to "Activity Logs"

**Expected Results:**
- ✅ Filter section with:
  - User dropdown
  - Action type dropdown
  - Start date
  - End date
- ✅ List of activity logs
- ✅ Each log shows:
  - Action badge (colored by type)
  - User name and email
  - Description
  - Timestamp
  - IP address

#### Test Case 3.5.2: Filter by User
**Steps:**
1. Select a user from dropdown
2. Click "Apply Filters"

**Expected Results:**
- ✅ Only logs for selected user shown

#### Test Case 3.5.3: Filter by Action Type
**Steps:**
1. Select "check_in" from action dropdown
2. Click "Apply Filters"

**Expected Results:**
- ✅ Only check_in actions shown

#### Test Case 3.5.4: Filter by Date Range
**Steps:**
1. Set start date: "2024-01-01"
2. Set end date: "2024-01-31"
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only logs in date range shown

#### Test Case 3.5.5: Clear Filters
**Steps:**
1. Apply some filters
2. Click "Clear Filters"

**Expected Results:**
- ✅ All filters reset
- ✅ All logs shown

---

## 4. UI/UX TESTING

### 4.1 Responsive Design Testing

#### Test Case 4.1.1: Mobile View (< 768px)
**Steps:**
1. Resize browser to mobile size
2. Navigate through all pages

**Expected Results:**
- ✅ Sidebar hidden by default
- ✅ Hamburger menu button visible
- ✅ Cards stack vertically
- ✅ Tables scroll horizontally
- ✅ Forms adjust to single column
- ✅ Buttons stack vertically

#### Test Case 4.1.2: Tablet View (768px - 1024px)
**Steps:**
1. Resize to tablet size
2. Navigate through pages

**Expected Results:**
- ✅ Sidebar visible
- ✅ 2-column grid for cards
- ✅ Proper spacing maintained

#### Test Case 4.1.3: Desktop View (> 1024px)
**Steps:**
1. View on desktop size

**Expected Results:**
- ✅ Sidebar always visible
- ✅ 3-4 column grid for cards
- ✅ Optimal use of space

### 4.2 Loading States Testing

#### Test Case 4.2.1: Page Loading
**Steps:**
1. Navigate to any page
2. Observe loading state

**Expected Results:**
- ✅ Loading spinner visible
- ✅ Content hidden during load
- ✅ Smooth transition when loaded

#### Test Case 4.2.2: Button Loading
**Steps:**
1. Submit any form
2. Observe button state

**Expected Results:**
- ✅ Button shows "Loading..." or similar
- ✅ Button disabled during submission
- ✅ Cursor shows not-allowed

### 4.3 Error Handling Testing

#### Test Case 4.3.1: Network Error
**Steps:**
1. Stop backend server
2. Try any API operation

**Expected Results:**
- ✅ Error toast notification
- ✅ Graceful error message
- ✅ No app crash

#### Test Case 4.3.2: 401 Unauthorized
**Steps:**
1. Manually expire token in localStorage
2. Try any API operation

**Expected Results:**
- ✅ Auto redirect to login
- ✅ Token cleared from localStorage

### 4.4 Accessibility Testing

#### Test Case 4.4.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter to activate buttons
3. Use Escape to close modals

**Expected Results:**
- ✅ Focus visible on all interactive elements
- ✅ Logical tab order
- ✅ Modals close with Escape
- ✅ Forms submit with Enter

#### Test Case 4.4.2: Color Contrast
**Steps:**
1. Check all text elements
2. Verify color contrast ratios

**Expected Results:**
- ✅ Text readable on backgrounds
- ✅ Status badges have good contrast
- ✅ Buttons clearly visible

### 4.5 Performance Testing

#### Test Case 4.5.1: Page Load Time
**Steps:**
1. Open DevTools Network tab
2. Navigate to pages
3. Check load times

**Expected Results:**
- ✅ Initial load < 3 seconds
- ✅ Subsequent navigation < 1 second
- ✅ No unnecessary API calls

#### Test Case 4.5.2: Memory Leaks
**Steps:**
1. Open DevTools Performance tab
2. Navigate between pages multiple times
3. Check memory usage

**Expected Results:**
- ✅ Memory doesn't continuously increase
- ✅ No console errors

---

## 5. INTEGRATION TESTING

### 5.1 Complete Employee Workflow

**Scenario:** Employee's typical workday

**Steps:**
1. Login as employee
2. Check in with 3 tasks at 9:00 AM
3. Work for 4 hours
4. Check out at 1:00 PM
5. View report - should show 4 hours
6. Check in again at 2:00 PM with 2 tasks
7. Work for 3 hours
8. Check out at 5:00 PM
9. View report - should show 7 hours total
10. Request leave for next week

**Expected Results:**
- ✅ All operations successful
- ✅ Data consistent across pages
- ✅ Total hours calculated correctly (7 hours)
- ✅ Progress bar shows 100%
- ✅ Leave request created

### 5.2 Complete Manager Workflow

**Scenario:** Manager's daily tasks

**Steps:**
1. Login as manager
2. View dashboard - see all employees
3. Create new employee user
4. Approve pending leave request
5. Create holiday for next month
6. View activity logs
7. Edit an attendance record
8. View employee report

**Expected Results:**
- ✅ All operations successful
- ✅ Changes reflected immediately
- ✅ Activity logs record all actions

---

## 6. EDGE CASES TESTING

### 6.1 Boundary Testing

#### Test Case 6.1.1: Maximum Tasks (20)
**Steps:**
1. Check in
2. Add 20 tasks
3. Submit

**Expected Results:**
- ✅ All 20 tasks accepted
- ✅ "Add Task" button disabled after 20

#### Test Case 6.1.2: Long Text Input
**Steps:**
1. Input very long task title (> 255 chars)
2. Try to submit

**Expected Results:**
- ✅ Validation error or truncation
- ✅ Character limit enforced

### 6.2 Concurrent Operations

#### Test Case 6.2.1: Multiple Browser Tabs
**Steps:**
1. Open app in 2 tabs
2. Login in both
3. Check in from tab 1
4. Try to check in from tab 2

**Expected Results:**
- ✅ Tab 2 shows error: "Already checked in"

### 6.3 Time Zone Testing

#### Test Case 6.3.1: Different Time Zones
**Steps:**
1. Change system time zone
2. Check in/out
3. View times

**Expected Results:**
- ✅ Times displayed correctly in local timezone
- ✅ Calculations accurate

---

## 7. BROWSER COMPATIBILITY TESTING

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Login | ✅ | ✅ | ✅ | ✅ |
| Check-in/out | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ |
| Modals | ✅ | ✅ | ✅ | ✅ |
| Forms | ✅ | ✅ | ✅ | ✅ |

---

## 8. SECURITY TESTING

### 8.1 Authentication Security

#### Test Case 8.1.1: Token Expiration
**Steps:**
1. Login
2. Wait for token to expire
3. Try API operation

**Expected Results:**
- ✅ Auto logout
- ✅ Redirect to login

#### Test Case 8.1.2: XSS Prevention
**Steps:**
1. Input `<script>alert('xss')</script>` in form
2. Submit

**Expected Results:**
- ✅ Script not executed
- ✅ Text escaped/sanitized

### 8.2 Authorization Testing

#### Test Case 8.2.1: Role-Based Access
**Steps:**
1. Login as employee
2. Try to access manager endpoints via DevTools

**Expected Results:**
- ✅ 403 Forbidden response
- ✅ Redirect to home

---

## 9. TESTING CHECKLIST

### Pre-Testing
- [ ] Backend running and seeded
- [ ] Frontend running
- [ ] Browser DevTools open
- [ ] Test accounts ready

### Authentication
- [ ] Employee login
- [ ] Manager login
- [ ] Failed login
- [ ] Logout
- [ ] Protected routes

### Employee Features
- [ ] Dashboard view
- [ ] Check-in
- [ ] Check-out
- [ ] Multiple sessions
- [ ] View reports
- [ ] Request leave

### Manager Features
- [ ] Dashboard view
- [ ] User management (CRUD)
- [ ] Holiday management (CRUD)
- [ ] Leave approval
- [ ] Activity logs

### UI/UX
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility
- [ ] Performance

### Integration
- [ ] Complete workflows
- [ ] Data consistency
- [ ] Cross-page navigation

---

## 10. BUG REPORTING TEMPLATE

Jika menemukan bug, gunakan template ini:

```markdown
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Screen Size: 1920x1080

**Console Errors:**
[Copy any console errors]

**Network Response:**
[Copy relevant API response]
```

---

## 11. TESTING TOOLS

### Recommended Tools

1. **Browser DevTools**
   - Network tab: Monitor API calls
   - Console: Check for errors
   - Elements: Inspect UI
   - Performance: Check load times

2. **Lighthouse**
   - Performance audit
   - Accessibility audit
   - Best practices

3. **React DevTools**
   - Component inspection
   - Props/State debugging

4. **Postman**
   - API testing
   - Request debugging

---

## 12. AUTOMATION TESTING (Optional)

### Cypress E2E Tests

```javascript
describe('Employee Check-in', () => {
  it('should allow employee to check in', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('employee@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/employee/dashboard')
    cy.contains('Check In').click()
    
    cy.get('input[placeholder*="Task"]').type('Test task')
    cy.contains('button', 'Check In').click()
    
    cy.contains('Checked in successfully').should('be.visible')
  })
})
```

---

## 📞 Support

Jika menemukan masalah atau butuh bantuan testing, hubungi tim development atau buat issue di repository.

---

## ✅ Testing Sign-off

**Tester Name:** ________________  
**Date:** ________________  
**Test Environment:** ________________  
**Overall Status:** Pass / Fail  
**Notes:** ________________

---

**Happy Testing! 🚀**
