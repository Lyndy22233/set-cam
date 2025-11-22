# System Architecture Documentation

## Overview

The Smoke Emission Test Center Appointment System is a full-stack web application designed to digitize the appointment booking and management process for vehicle smoke emission testing.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    React     │  │   Router     │      │
│  │   (Chrome,   │──│  Components  │──│   (React     │      │
│  │   Firefox)   │  │   & Pages    │  │   Router)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Firebase SDK  │
                    └────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐   ┌────▼─────┐
│  Firebase    │   │   Backend API   │   │ Firebase │
│     Auth     │   │  (Express.js)   │   │ Storage  │
└──────────────┘   └─────────────────┘   └──────────┘
                            │
                    ┌───────▼────────┐
                    │ Firebase Admin │
                    │      SDK       │
                    └────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Firestore    │
                    │   Database     │
                    └────────────────┘
```

## System Components

### 1. Frontend (React Application)

**Technology Stack:**
- React 18.2.0
- React Router DOM 6.20.1
- Firebase SDK 10.7.1
- Axios 1.6.2
- React Toastify 9.1.3

**Key Components:**

#### Authentication Components
- `Login.js` - User login interface
- `Register.js` - User registration interface
- `PrivateRoute.js` - Protected route wrapper
- `AdminRoute.js` - Admin-only route wrapper

#### User Components
- `Home.js` - Landing page with features overview
- `Services.js` - Service catalog display
- `BookAppointment.js` - Appointment booking form
- `MyAppointments.js` - User appointment history
- `AppointmentDetails.js` - Detailed appointment view

#### Admin Components
- `AdminDashboard.js` - Admin statistics dashboard
- `AdminAppointments.js` - Appointment management interface

#### Shared Components
- `Navbar.js` - Navigation bar with authentication state

**State Management:**
- React Hooks (useState, useEffect)
- Firebase Auth state observer
- Component-level state

### 2. Backend (Node.js/Express API)

**Technology Stack:**
- Node.js
- Express 4.18.2
- Firebase Admin SDK 12.0.0
- CORS 2.8.5
- Multer 1.4.5 (file uploads)

**API Structure:**

#### Routes
1. **Authentication Routes** (`/api/auth`)
   - POST `/register` - User registration
   - POST `/verify` - Token verification

2. **Appointment Routes** (`/api/appointments`)
   - POST `/` - Create appointment
   - GET `/user` - Get user appointments
   - GET `/:id` - Get single appointment
   - PATCH `/:id/receipt` - Upload receipt

3. **Admin Routes** (`/api/admin`)
   - GET `/appointments` - Get all appointments
   - GET `/dashboard/stats` - Get statistics
   - PATCH `/appointments/:id/approve` - Approve appointment
   - PATCH `/appointments/:id/reject` - Reject appointment
   - PATCH `/appointments/:id/result` - Add test result

4. **Service Routes** (`/api/services`)
   - GET `/` - Get all services
   - GET `/:id` - Get single service

#### Middleware
- `authMiddleware` - JWT token verification
- `adminMiddleware` - Admin role verification
- CORS configuration
- Body parser for JSON
- Error handling middleware

### 3. Database (Firebase Firestore)

**Collections Structure:**

#### users
```javascript
{
  uid: string,              // Firebase Auth UID
  name: string,
  email: string,
  phone: string,
  role: string,             // 'user' or 'admin'
  createdAt: timestamp
}
```

#### services
```javascript
{
  name: string,
  description: string,
  price: number,
  duration: string,
  category: string          // 'standard', 'motorcycle', 'heavy', 'express'
}
```

#### appointments
```javascript
{
  userId: string,           // Reference to user
  userEmail: string,
  serviceId: string,        // Reference to service
  serviceName: string,
  vehicleInfo: {
    make: string,
    model: string,
    year: number,
    plateNumber: string
  },
  appointmentDate: string,
  appointmentTime: string,
  paymentDetails: {
    method: string,         // 'gcash', 'paymaya', 'bank'
    amount: number
  },
  receiptUrl: string,       // Firebase Storage URL
  status: string,           // 'pending', 'pending_verification', 'approved', 'rejected', 'completed'
  emissionTestResult: {     // Added when completed
    co2Level: string,
    smokeOpacity: string,
    result: string          // 'Passed' or 'Failed'
  },
  rejectionReason: string,  // Added if rejected
  approvedBy: string,       // Admin UID
  approvedAt: timestamp,
  rejectedBy: string,
  rejectedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. Storage (Firebase Storage)

**Structure:**
```
/receipts
  /{appointmentId}
    /{filename}
```

**File Types:**
- Images (JPEG, PNG, GIF)
- PDF documents

### 5. Authentication (Firebase Auth)

**Authentication Methods:**
- Email/Password

**Custom Claims:**
- `admin: boolean` - Admin privilege flag

**Security:**
- JWT tokens for API authentication
- Token verification on each protected request
- Custom claims for role-based access control

## Data Flow

### User Appointment Booking Flow

1. **User Action:** User fills out appointment form
2. **Frontend:** React validates form data
3. **API Call:** POST request to `/api/appointments`
4. **Backend:** 
   - Verifies JWT token
   - Creates appointment document in Firestore
   - Returns appointment ID
5. **File Upload:**
   - User uploads receipt to Firebase Storage
   - Frontend gets download URL
   - PATCH request to update appointment with receipt URL
6. **Database Update:** Appointment status changes to "pending_verification"
7. **Notification:** User sees success message

### Admin Approval Flow

1. **Admin Action:** Admin reviews appointment
2. **Frontend:** Admin clicks "Approve" or "Reject"
3. **API Call:** PATCH request to `/api/admin/appointments/:id/approve` or `/reject`
4. **Backend:**
   - Verifies admin privileges
   - Updates appointment status
   - Records approval/rejection metadata
5. **Database Update:** Appointment status and metadata updated
6. **Notification:** Status change reflected in user's appointment list

### Test Result Entry Flow

1. **Admin Action:** Admin enters emission test results
2. **Frontend:** Admin fills test result form
3. **API Call:** PATCH request to `/api/admin/appointments/:id/result`
4. **Backend:**
   - Verifies admin privileges
   - Updates appointment with test results
   - Changes status to "completed"
5. **Database Update:** Test results stored
6. **User Access:** User can view and print results

## Security Measures

### Frontend Security
- Environment variables for sensitive config
- Client-side route protection
- Input validation and sanitization
- Secure token storage

### Backend Security
- JWT token verification on all protected routes
- Admin role verification for privileged operations
- CORS configuration to prevent unauthorized access
- Input validation and error handling

### Database Security
- Firestore security rules for data access control
- User-based read/write permissions
- Admin-only write access for sensitive operations

### Storage Security
- Storage rules for file access control
- Authenticated access only
- File type restrictions

## Performance Considerations

### Frontend Optimization
- React component memoization
- Lazy loading of routes
- Optimized re-renders with proper state management
- Image optimization for uploaded receipts

### Backend Optimization
- Efficient Firestore queries with indexes
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Connection pooling

### Database Optimization
- Indexed fields for common queries
- Denormalized data where appropriate
- Batch operations for multiple updates
- Query result limits

## Scalability

### Horizontal Scaling
- Stateless backend allows multiple instances
- Firebase services auto-scale
- CDN for frontend static assets

### Vertical Scaling
- Firebase Firestore scales automatically
- Storage scales with usage
- Backend can be upgraded with more resources

## Monitoring & Logging

### Frontend Monitoring
- Error boundary for React errors
- Console logging in development
- User feedback via toast notifications

### Backend Monitoring
- Server logs for requests and errors
- Firebase Admin SDK error tracking
- Health check endpoint

### Database Monitoring
- Firebase Console for usage metrics
- Query performance monitoring
- Storage usage tracking

## Deployment Architecture

### Frontend Deployment
- Build: `npm run build`
- Hosting: Firebase Hosting, Vercel, Netlify
- CDN: Automatic with hosting providers

### Backend Deployment
- Platform: Heroku, Railway, Google Cloud Run
- Environment: Node.js runtime
- Configuration: Environment variables

## Backup & Recovery

### Data Backup
- Firestore automatic daily backups
- Export functionality for critical data
- Storage file redundancy

### Disaster Recovery
- Firebase multi-region replication
- Point-in-time recovery for Firestore
- Backup of service account keys

## Future Enhancements

1. **Real-time Notifications**
   - Implement Firebase Cloud Messaging
   - Push notifications for appointment updates

2. **Payment Gateway Integration**
   - Integrate PayPal, Stripe, or local payment processors
   - Automated payment verification

3. **Advanced Analytics**
   - User behavior tracking
   - Appointment trends analysis
   - Revenue reporting

4. **Mobile Application**
   - React Native mobile app
   - Native push notifications
   - Offline support

5. **Automated Testing**
   - Equipment integration for automated results
   - QR code scanning for quick check-in

---

**Document Version:** 1.0  
**Last Updated:** November 19, 2025  
**Maintained By:** Development Team
