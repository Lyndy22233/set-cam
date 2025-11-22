# ✅ Installation Verification Checklist

Use this checklist to verify your Smoke Emission Test Center Appointment System is properly set up and running.

---

## 📦 PART 1: File Structure Verification

### Root Directory
- [x] `README.md` exists
- [x] `QUICKSTART.md` exists
- [x] `ARCHITECTURE.md` exists
- [x] `PROJECT_SUMMARY.md` exists
- [x] `ENV_SETUP_GUIDE.md` exists
- [x] `PAGES_FEATURES.md` exists
- [x] `.github/copilot-instructions.md` exists

### Frontend Directory (`frontend/`)
- [x] `package.json` exists
- [x] `package-lock.json` exists (after npm install)
- [x] `node_modules/` exists (after npm install)
- [x] `.env.example` exists
- [ ] `.env` exists (you need to create this)
- [x] `.gitignore` exists
- [x] `public/index.html` exists
- [x] `src/` directory exists
- [x] `src/App.js` exists
- [x] `src/index.js` exists
- [x] `src/components/` directory exists
- [x] `src/pages/` directory exists
- [x] `src/config/` directory exists

### Backend Directory (`backend/`)
- [x] `package.json` exists
- [x] `package-lock.json` exists (after npm install)
- [x] `node_modules/` exists (after npm install)
- [x] `.env.example` exists
- [ ] `.env` exists (you need to create this)
- [x] `.gitignore` exists
- [x] `server.js` exists
- [x] `config/` directory exists
- [x] `middleware/` directory exists
- [x] `routes/` directory exists
- [x] `scripts/` directory exists

---

## 🔧 PART 2: Dependencies Verification

### Frontend Dependencies
Run in `frontend/` directory:
```bash
npm list --depth=0
```

Should show:
- [ ] `react@18.2.0`
- [ ] `react-router-dom@6.20.1`
- [ ] `firebase@10.7.1`
- [ ] `axios@1.6.2`
- [ ] `react-toastify@9.1.3`

### Backend Dependencies
Run in `backend/` directory:
```bash
npm list --depth=0
```

Should show:
- [ ] `express@4.18.2`
- [ ] `firebase-admin@12.0.0`
- [ ] `cors@2.8.5`
- [ ] `dotenv@16.3.1`
- [ ] `multer@1.4.5-lts.1`

---

## 🔥 PART 3: Firebase Configuration

### Firebase Project Setup
- [ ] Firebase project created
- [ ] Project name noted
- [ ] Project ID noted

### Firebase Services Enabled
- [ ] Authentication enabled
- [ ] Email/Password provider enabled in Authentication
- [ ] Firestore Database created
- [ ] Firestore Database in production/test mode
- [ ] Storage initialized
- [ ] Storage bucket created

### Firebase Configuration Obtained
- [ ] Web app registered in Firebase project
- [ ] Web app configuration copied (apiKey, authDomain, etc.)
- [ ] Service Account JSON downloaded

---

## 📝 PART 4: Environment Variables Configuration

### Frontend `.env` File
Location: `frontend/.env`

- [ ] File created from `.env.example`
- [ ] `REACT_APP_FIREBASE_API_KEY` set
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` set
- [ ] `REACT_APP_FIREBASE_PROJECT_ID` set
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET` set
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `REACT_APP_FIREBASE_APP_ID` set
- [ ] `REACT_APP_API_URL` set to `http://localhost:5000/api`

### Backend `.env` File
Location: `backend/.env`

- [ ] File created from `.env.example`
- [ ] `PORT` set to `5000`
- [ ] `FIREBASE_PROJECT_ID` set
- [ ] `FIREBASE_PRIVATE_KEY` set (with quotes and \n)
- [ ] `FIREBASE_CLIENT_EMAIL` set
- [ ] `FIREBASE_DATABASE_URL` set

---

## 🚀 PART 5: Server Startup Verification

### Backend Server Test

1. Navigate to backend directory:
```bash
cd backend
```

2. Start the server:
```bash
npm start
```

**Expected Output:**
```
Server is running on port 5000
```

3. Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{"status":"OK","message":"Server is running"}
```

**Checklist:**
- [ ] Server starts without errors
- [ ] Port 5000 is accessible
- [ ] Health endpoint responds correctly
- [ ] No Firebase authentication errors in console

### Frontend Server Test

1. Open new terminal
2. Navigate to frontend directory:
```bash
cd frontend
```

3. Start the development server:
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view smoke-emission-frontend in the browser.
Local: http://localhost:3000
```

4. Browser should automatically open to `http://localhost:3000`

**Checklist:**
- [ ] Frontend compiles successfully
- [ ] No compilation errors
- [ ] Browser opens automatically
- [ ] Home page loads without errors
- [ ] No Firebase errors in browser console (F12)

---

## 🗄️ PART 6: Database & Data Setup

### Seed Services Data

Run in `backend/` directory:
```bash
npm run seed
```

**Expected Output:**
```
Starting to seed services...

✓ Added: Standard Smoke Emission Test (xxx)
✓ Added: Motorcycle Smoke Test (xxx)
✓ Added: Heavy Vehicle Smoke Test (xxx)
✓ Added: Express Testing Service (xxx)

✓ All services seeded successfully!
```

**Checklist:**
- [ ] Seed script runs without errors
- [ ] 4 services added to Firestore
- [ ] Can view services in Firebase Console
- [ ] Services appear on `/services` page

### Verify Firestore Collections

Go to Firebase Console → Firestore Database

**Checklist:**
- [ ] `services` collection exists
- [ ] 4 documents in `services` collection
- [ ] Each service has: name, description, price, duration, category

---

## 👤 PART 7: User Registration & Login Test

### Register a Test User

1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: test123
   - Confirm Password: test123
4. Click "Register"

**Checklist:**
- [ ] Registration form loads
- [ ] Can fill out all fields
- [ ] Submit button works
- [ ] Success message appears
- [ ] Redirects to home page
- [ ] User appears in Firebase Console → Authentication
- [ ] User document created in Firestore → users collection

### Login Test

1. Click "Logout" (if logged in)
2. Click "Login"
3. Enter credentials:
   - Email: test@example.com
   - Password: test123
4. Click "Login"

**Checklist:**
- [ ] Login form loads
- [ ] Can enter credentials
- [ ] Login successful
- [ ] Success message appears
- [ ] Redirects to home page
- [ ] Navbar shows "My Appointments" and "Logout"

---

## 🎫 PART 8: Booking Flow Test

### Book an Appointment

1. Navigate to "Services" page
2. Click "Book Now" on any service
3. Fill out the booking form:
   - Vehicle Make: Toyota
   - Vehicle Model: Vios
   - Year: 2020
   - Plate Number: ABC123
   - Appointment Date: (Select future date)
   - Appointment Time: 10:00 AM
   - Payment Method: GCash
4. Click "Book Appointment"

**Checklist:**
- [ ] Services page loads with 4 services
- [ ] Can click "Book Now"
- [ ] Booking form loads
- [ ] Service details display correctly
- [ ] Can fill all form fields
- [ ] Date picker works (future dates only)
- [ ] Time dropdown works
- [ ] Can select payment method
- [ ] Submit button works
- [ ] Success message appears
- [ ] Redirects to "My Appointments"
- [ ] New appointment appears in list

### View Appointment

1. On "My Appointments" page
2. Click "View Details" on your appointment

**Checklist:**
- [ ] Appointment list shows created appointment
- [ ] Status badge shows "Pending"
- [ ] Can click "View Details"
- [ ] Details page loads
- [ ] All information displays correctly
- [ ] Can see "Upload Payment Receipt" section

### Upload Receipt

1. On appointment details page
2. Click "Choose File" under Upload Payment Receipt
3. Select an image file
4. Click "Upload Receipt"

**Checklist:**
- [ ] File input works
- [ ] Can select image file
- [ ] Upload button activates
- [ ] Upload processes successfully
- [ ] Success message appears
- [ ] Status changes to "Pending Verification"
- [ ] Receipt image displays on page

---

## 👨‍💼 PART 9: Admin Setup & Testing

### Create Admin User

Run in `backend/` directory:
```bash
npm run set-admin test@example.com
```

**Expected Output:**
```
Setting admin claim for: test@example.com
✓ Admin claim successfully set!
User: test@example.com (xxx)

Note: User must log out and log back in for changes to take effect.
```

**Checklist:**
- [ ] Script runs without errors
- [ ] Success message appears
- [ ] Shows user UID

### Test Admin Access

1. In the frontend, click "Logout"
2. Login again with test@example.com
3. Manually navigate to `http://localhost:3000/admin/dashboard`

**Checklist:**
- [ ] Can log back in
- [ ] Admin dashboard loads (not redirected)
- [ ] Statistics display correctly
- [ ] Can see "Manage Appointments" button

### Test Admin Appointment Management

1. Click "Manage Appointments"
2. Should see your test appointment with "Pending Verification" status
3. Click "Approve" button

**Checklist:**
- [ ] Admin appointments page loads
- [ ] Test appointment appears
- [ ] Shows "Pending Verification" status
- [ ] Can see all appointment details
- [ ] "Approve" and "Reject" buttons visible
- [ ] Can click "Approve"
- [ ] Success message appears
- [ ] Status changes to "Approved"

### Add Test Result

1. On same appointment (now Approved)
2. Click "Add Test Result"
3. Fill in the form:
   - CO2 Level: 150
   - Smoke Opacity: 20
   - Result: Passed
4. Click "Save Result"

**Checklist:**
- [ ] "Add Test Result" button visible for approved appointments
- [ ] Modal opens with form
- [ ] Can fill all fields
- [ ] Result dropdown has Pass/Fail options
- [ ] Can submit form
- [ ] Success message appears
- [ ] Status changes to "Completed"

---

## 📊 PART 10: End-to-End User Flow

### Complete User Journey

1. Log out from admin account
2. Log back in as regular user (test@example.com)
3. Go to "My Appointments"
4. Click on completed appointment
5. Scroll to "Emission Test Result" section
6. Click "Print Result" button

**Checklist:**
- [ ] Can log back in as user
- [ ] My Appointments shows completed appointment
- [ ] Status badge shows "Completed"
- [ ] Details page loads
- [ ] Test results display correctly:
  - CO2 Level: 150
  - Smoke Opacity: 20
  - Result: Passed
- [ ] "Print Result" button appears
- [ ] Print dialog opens when clicked
- [ ] Print preview shows clean layout

---

## 🔍 PART 11: Error Handling Tests

### Test Invalid Login
- [ ] Wrong password shows error message
- [ ] Non-existent email shows error message

### Test Form Validation
- [ ] Empty fields prevent submission
- [ ] Invalid email format shows error
- [ ] Password mismatch shows error
- [ ] Past dates disabled in date picker

### Test Authorization
- [ ] Non-logged-in user redirected from protected pages
- [ ] Non-admin user redirected from admin pages
- [ ] Cannot access other users' appointments

---

## 🌐 PART 12: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Edge - All features work
- [ ] Safari - All features work (if on Mac)

---

## 📱 PART 13: Responsive Design

Test at different screen sizes:
- [ ] Mobile (320px-768px) - Layout adapts correctly
- [ ] Tablet (768px-1024px) - Layout adapts correctly
- [ ] Desktop (1024px+) - Layout looks good

---

## ⚡ PART 14: Performance Checks

### Frontend Performance
- [ ] Page loads in under 3 seconds
- [ ] No console errors
- [ ] No console warnings (except deprecation warnings)
- [ ] Images load properly
- [ ] Smooth navigation between pages

### Backend Performance
- [ ] API responses in under 1 second
- [ ] No server errors in terminal
- [ ] Successful database connections
- [ ] File uploads complete successfully

---

## 🔒 PART 15: Security Verification

### Environment Files
- [ ] `.env` files not committed to git
- [ ] `.gitignore` includes `.env`
- [ ] Private keys secure and not exposed

### Firebase Rules
- [ ] Review Firestore rules in Firebase Console
- [ ] Review Storage rules in Firebase Console
- [ ] Authentication required for protected data

---

## 📚 PART 16: Documentation Review

### Documentation Files
- [ ] README.md is comprehensive
- [ ] QUICKSTART.md is easy to follow
- [ ] ENV_SETUP_GUIDE.md has clear instructions
- [ ] ARCHITECTURE.md explains system design
- [ ] PROJECT_SUMMARY.md provides overview
- [ ] PAGES_FEATURES.md lists all features

---

## ✅ FINAL VERIFICATION

### System Status
- [ ] Backend server running without errors
- [ ] Frontend development server running
- [ ] Firebase services all connected
- [ ] Can register and login
- [ ] Can book appointments
- [ ] Can upload receipts
- [ ] Admin can manage appointments
- [ ] Admin can add test results
- [ ] Users can view results
- [ ] Print functionality works

### Ready for Production?
- [ ] All tests passed
- [ ] No critical errors
- [ ] Documentation complete
- [ ] Firebase rules configured
- [ ] Environment variables secured

---

## 🎉 CONGRATULATIONS!

If all items are checked, your Smoke Emission Test Center Appointment System is:
- ✅ Fully Installed
- ✅ Properly Configured
- ✅ Tested and Working
- ✅ Ready to Use or Deploy

---

## 📞 Next Steps

1. **For Development:**
   - Continue testing with more scenarios
   - Customize services in Firestore
   - Adjust styling as needed
   - Add more features

2. **For Production:**
   - Update Firebase security rules
   - Configure custom domain
   - Deploy frontend to hosting
   - Deploy backend to server
   - Set up monitoring

3. **For Issues:**
   - Review error messages
   - Check environment variables
   - Verify Firebase configuration
   - Consult documentation files

---

**Installation Date:** _______________  
**Verified By:** _______________  
**System Status:** ✅ OPERATIONAL
