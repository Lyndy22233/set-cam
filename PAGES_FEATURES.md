# Page-by-Page Feature List

Complete breakdown of all pages and their functionality in the Smoke Emission Test Center Appointment System.

---

## 🏠 PUBLIC PAGES

### 1. Home Page (`/`)
**File:** `frontend/src/pages/Home.js`

**Features:**
- ✅ Hero section with system introduction
- ✅ "Book an Appointment" call-to-action button
- ✅ Features grid showcasing system benefits:
  - Easy Booking
  - Online Payment
  - Real-time Notifications
  - Digital Results
- ✅ "How It Works" section with 4-step process:
  1. Register/Login
  2. Select Service
  3. Book & Pay
  4. Get Results
- ✅ Responsive design
- ✅ Accessible to all visitors (no login required)

**Navigation Options:**
- Link to Services page
- Link to Login/Register (if not logged in)
- Link to My Appointments (if logged in)

---

### 2. Login Page (`/login`)
**File:** `frontend/src/pages/Login.js`

**Features:**
- ✅ Email and password input fields
- ✅ Form validation
- ✅ Firebase Authentication integration
- ✅ Error handling with user-friendly messages
- ✅ Loading state during authentication
- ✅ Link to registration page
- ✅ Automatic redirect to home after successful login
- ✅ Toast notification for success/error

**Form Fields:**
- Email (required, email format)
- Password (required, min 6 characters)

**Actions:**
- Submit login form
- Navigate to registration page

---

### 3. Register Page (`/register`)
**File:** `frontend/src/pages/Register.js`

**Features:**
- ✅ Complete registration form
- ✅ Password confirmation validation
- ✅ Firebase user creation
- ✅ Firestore user profile creation
- ✅ Email format validation
- ✅ Password strength requirement (min 6 chars)
- ✅ Error handling
- ✅ Loading state
- ✅ Link to login page
- ✅ Automatic redirect after successful registration
- ✅ Toast notifications

**Form Fields:**
- Full Name (required)
- Email (required, email format)
- Phone Number (required)
- Password (required, min 6 characters)
- Confirm Password (required, must match password)

**Actions:**
- Submit registration form
- Navigate to login page

---

### 4. Services Page (`/services`)
**File:** `frontend/src/pages/Services.js`

**Features:**
- ✅ Display all available services
- ✅ Service cards with details:
  - Service name
  - Description
  - Price (₱)
  - Duration
- ✅ "Book Now" button on each service
- ✅ Loading state while fetching data
- ✅ Empty state message if no services
- ✅ Responsive grid layout
- ✅ Real-time data from Firestore
- ✅ Hover effects on cards

**Service Information Displayed:**
- Name (e.g., "Standard Smoke Emission Test")
- Description (what's included)
- Price in Philippine Peso
- Estimated duration

**Actions:**
- View all services
- Click "Book Now" (requires login)

---

## 👤 USER PAGES (Protected Routes)

### 5. Book Appointment Page (`/book-appointment/:serviceId`)
**File:** `frontend/src/pages/BookAppointment.js`

**Features:**
- ✅ Two-column layout (service summary + booking form)
- ✅ Service details display
- ✅ Multi-section booking form
- ✅ Date picker with min date validation
- ✅ Time slot selection
- ✅ Payment method selection
- ✅ Receipt file upload
- ✅ Optional notes field
- ✅ Form validation
- ✅ Firebase Storage integration
- ✅ Loading and submission states
- ✅ Redirect to My Appointments after success
- ✅ Toast notifications

**Form Sections:**

1. **Vehicle Information**
   - Make (text, required) - e.g., "Toyota"
   - Model (text, required) - e.g., "Vios"
   - Year (number, required, 1900-2025)
   - Plate Number (text, required) - e.g., "ABC123"

2. **Schedule**
   - Appointment Date (date picker, required, future dates only)
   - Appointment Time (dropdown, required):
     - 08:00 AM, 09:00 AM, 10:00 AM, 11:00 AM
     - 01:00 PM, 02:00 PM, 03:00 PM, 04:00 PM

3. **Payment Information**
   - Payment Method (dropdown, required):
     - GCash
     - PayMaya
     - Bank Transfer
   - Upload Receipt (file, optional, images only)

4. **Additional Information**
   - Notes (textarea, optional)

**Actions:**
- Fill and submit booking form
- Upload payment receipt
- View selected service details
- Cancel and return to services

---

### 6. My Appointments Page (`/my-appointments`)
**File:** `frontend/src/pages/MyAppointments.js`

**Features:**
- ✅ List of all user appointments
- ✅ Filter buttons by status:
  - All
  - Pending
  - Approved
  - Completed
- ✅ Status badges with color coding:
  - Pending (Yellow)
  - Pending Verification (Yellow)
  - Approved (Green)
  - Rejected (Red)
  - Completed (Blue)
- ✅ Appointment cards showing:
  - Service name
  - Vehicle details
  - Appointment date and time
  - Payment method
- ✅ "View Details" button on each card
- ✅ Empty state with link to services
- ✅ Real-time data updates
- ✅ Loading state
- ✅ Responsive card layout

**Displayed Information:**
- Service Name
- Vehicle (Make, Model, Year)
- Plate Number
- Date and Time
- Payment Method
- Current Status

**Actions:**
- Filter appointments by status
- View appointment details
- Navigate to book new appointment

---

### 7. Appointment Details Page (`/appointment/:id`)
**File:** `frontend/src/pages/AppointmentDetails.js`

**Features:**
- ✅ Complete appointment information display
- ✅ Status badge
- ✅ Organized sections:
  - Service Information
  - Vehicle Information
  - Appointment Schedule
  - Payment Information
  - Payment Receipt (if uploaded)
  - Rejection Reason (if rejected)
  - Emission Test Result (if completed)
- ✅ Receipt upload functionality (if not uploaded)
- ✅ Receipt image viewer
- ✅ Print functionality for test results
- ✅ Loading state
- ✅ Error handling
- ✅ Back to appointments button
- ✅ Print-friendly styling

**Information Sections:**

1. **Service Information**
   - Service name

2. **Vehicle Information**
   - Make, Model, Year
   - Plate Number

3. **Appointment Schedule**
   - Date
   - Time

4. **Payment Information**
   - Payment method
   - Amount

5. **Payment Receipt** (if uploaded)
   - Receipt image display
   - View full size

6. **Upload Receipt** (if pending and no receipt)
   - File upload input
   - Upload button
   - Progress indicator

7. **Rejection Reason** (if rejected)
   - Admin's rejection message

8. **Emission Test Result** (if completed)
   - CO2 Level
   - Smoke Opacity
   - Result (Pass/Fail)
   - Print button

**Actions:**
- Upload payment receipt
- View uploaded receipt
- Print test results
- Return to My Appointments

---

## 👨‍💼 ADMIN PAGES (Admin-Only Protected Routes)

### 8. Admin Dashboard (`/admin/dashboard`)
**File:** `frontend/src/pages/admin/AdminDashboard.js`

**Features:**
- ✅ Statistics overview cards
- ✅ Real-time appointment counts
- ✅ Color-coded statistics
- ✅ Quick action buttons
- ✅ Responsive grid layout
- ✅ Loading state
- ✅ Auto-refresh capability

**Statistics Displayed:**
1. **Total Appointments**
   - Count of all appointments

2. **Pending**
   - Appointments awaiting review (Yellow)

3. **Approved**
   - Approved appointments (Green)

4. **Completed**
   - Finished with test results (Blue)

5. **Rejected**
   - Rejected appointments (Red)

**Quick Actions:**
- Navigate to Manage Appointments

**Navigation:**
- Link to appointment management
- Access to all admin features

---

### 9. Admin Appointments Page (`/admin/appointments`)
**File:** `frontend/src/pages/admin/AdminAppointments.js`

**Features:**
- ✅ Complete appointment management interface
- ✅ Filter appointments by status:
  - All
  - Pending Verification
  - Approved
  - Completed
- ✅ Detailed appointment cards showing:
  - User email
  - Service name
  - Vehicle details
  - Appointment schedule
  - Payment information
  - Status badge
- ✅ Receipt viewing (opens in new tab)
- ✅ Action buttons based on status
- ✅ Modal dialogs for actions:
  - Reject appointment modal
  - Add test result modal
- ✅ Real-time updates after actions
- ✅ Loading states
- ✅ Toast notifications
- ✅ Empty state handling

**Appointment Card Information:**
- User's email address
- Service name
- Current status
- Vehicle details (Make, Model, Plate)
- Appointment date and time
- Payment method and amount
- Link to view receipt

**Available Actions by Status:**

1. **Pending Verification:**
   - View receipt
   - Approve appointment
   - Reject appointment (with reason)

2. **Approved:**
   - Add test result

3. **Completed:**
   - View only (no actions)

**Modal Features:**

1. **Reject Appointment Modal:**
   - Textarea for rejection reason (required)
   - Confirm reject button
   - Cancel button
   - Form validation

2. **Add Test Result Modal:**
   - CO2 Level input (text)
   - Smoke Opacity input (text)
   - Result dropdown (Pass/Fail)
   - Save button
   - Cancel button
   - Form validation

**Actions:**
- Filter appointments
- View payment receipts
- Approve appointments
- Reject with reason
- Add emission test results
- View appointment details

---

## 🗺️ NAVIGATION STRUCTURE

### Public Navigation (Not Logged In)
```
Home → Services → Login/Register
```

### User Navigation (Logged In)
```
Home → Services → Book Appointment → My Appointments → Appointment Details
```

### Admin Navigation (Admin Logged In)
```
Home → Admin Dashboard → Manage Appointments
```

---

## 🔐 ROUTE PROTECTION

### Public Routes (No Auth Required)
- `/` - Home
- `/login` - Login
- `/register` - Register
- `/services` - Services

### Protected Routes (Auth Required)
- `/book-appointment/:serviceId` - Book Appointment
- `/my-appointments` - My Appointments
- `/appointment/:id` - Appointment Details

### Admin Routes (Admin Role Required)
- `/admin/dashboard` - Admin Dashboard
- `/admin/appointments` - Admin Appointments

### Automatic Redirects
- Logged-in users accessing `/login` → Redirect to `/`
- Logged-in users accessing `/register` → Redirect to `/`
- Non-logged-in users accessing protected routes → Redirect to `/login`
- Non-admin users accessing admin routes → Redirect to `/`

---

## 🎨 SHARED COMPONENTS

### Navbar Component
**File:** `frontend/src/components/Navbar.js`

**Features:**
- ✅ Site branding/logo
- ✅ Navigation links
- ✅ Conditional rendering based on auth state
- ✅ Logout functionality
- ✅ Responsive design
- ✅ Active link highlighting

**Navigation Links (Not Logged In):**
- Home
- Services
- Login (button)
- Register (button)

**Navigation Links (Logged In):**
- Home
- Services
- My Appointments
- Logout (button)

**Navigation Links (Admin Logged In):**
- Home
- Services
- My Appointments
- Admin Dashboard (if admin)
- Logout (button)

---

## 📱 RESPONSIVE DESIGN

All pages include:
- ✅ Mobile-first design approach
- ✅ Responsive grid layouts
- ✅ Breakpoints for tablets and mobile
- ✅ Touch-friendly buttons and inputs
- ✅ Optimized for screens from 320px to 1920px+

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎯 USER EXPERIENCE FEATURES

### Feedback Mechanisms
- ✅ Toast notifications for all actions
- ✅ Loading spinners during operations
- ✅ Form validation messages
- ✅ Success/error alerts
- ✅ Empty state messages
- ✅ Confirmation dialogs

### Visual Indicators
- ✅ Status badges with colors
- ✅ Hover effects on interactive elements
- ✅ Active state for buttons
- ✅ Disabled state for processing
- ✅ Progress indicators

### Accessibility
- ✅ Semantic HTML
- ✅ Form labels for screen readers
- ✅ Keyboard navigation support
- ✅ Alt text for images (when applicable)
- ✅ Color contrast compliance

---

## 📊 DATA DISPLAY FORMATS

### Dates
- Display format: "YYYY-MM-DD"
- Input format: Date picker

### Times
- Display format: "HH:MM" (24-hour)
- Display with AM/PM labels

### Currency
- Format: ₱XXX (Philippine Peso)
- No decimal places for whole amounts

### Status
- Formatted with proper capitalization
- Color-coded for quick recognition

---

## 🔄 REAL-TIME UPDATES

Pages with real-time data:
- ✅ Services (from Firestore)
- ✅ My Appointments (from Firestore via API)
- ✅ Appointment Details (from Firestore via API)
- ✅ Admin Dashboard Stats (from Firestore via API)
- ✅ Admin Appointments (from Firestore via API)

---

## 📝 FORM VALIDATION

All forms include:
- ✅ Required field validation
- ✅ Format validation (email, phone, dates)
- ✅ Length validation
- ✅ Pattern matching where needed
- ✅ Real-time error display
- ✅ Submit button disabled when invalid

---

## 🎬 LOADING STATES

All pages with async operations show:
- ✅ Spinner animation
- ✅ Loading message
- ✅ Disabled interactive elements
- ✅ Graceful content loading

---

## 🖨️ PRINT FUNCTIONALITY

Pages with print support:
- ✅ Appointment Details (test results)
- ✅ Print-specific CSS
- ✅ Hidden navigation and buttons when printing
- ✅ Optimized layout for paper

---

**Total Pages:** 9 (4 public, 3 user-protected, 2 admin-protected)  
**Total Components:** 4 shared components  
**Total Features:** 100+ individual features across all pages

---

This comprehensive system provides a complete solution for managing smoke emission test appointments from booking to completion! 🚗✨
