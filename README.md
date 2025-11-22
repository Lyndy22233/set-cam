# Smoke Emission Test Center Appointment System

A comprehensive web-based appointment system for smoke emission testing centers, built with React, Node.js, and Firebase. This system allows users to book appointments online, make payments, and receive digital emission test results, while providing administrators with tools to manage appointments and update test results.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login using Firebase Authentication
- **Service Browsing**: View available smoke emission testing services
- **Online Booking**: Schedule appointments with preferred date and time
- **Payment Integration**: Support for multiple payment methods (GCash, PayMaya, Bank Transfer)
- **Receipt Upload**: Upload payment receipts for verification
- **Real-time Notifications**: Get updates on appointment status
- **Appointment Management**: View and track all appointments in one place
- **Digital Results**: Receive printable emission test results

### Admin Features
- **Dashboard**: Overview of all appointments with statistics
- **Appointment Management**: Review, approve, or reject appointments
- **Receipt Verification**: View uploaded payment receipts
- **Test Result Entry**: Add emission test results for completed tests
- **User Communication**: Send notifications about appointment status

## 📋 System Requirements

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Modern web browser

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation and routing
- **Firebase SDK** - Authentication, Firestore, Storage
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Firebase Admin SDK** - Backend Firebase integration
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Database & Storage
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage for receipts and documents
- **Firebase Authentication** - User authentication

## 📁 Project Structure

```
SET CAM/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── config/          # Configuration files
│   │   │   └── firebase.js
│   │   ├── pages/           # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Services.js
│   │   │   ├── BookAppointment.js
│   │   │   ├── MyAppointments.js
│   │   │   ├── AppointmentDetails.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       └── AdminAppointments.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
├── backend/                 # Node.js backend server
│   ├── config/
│   │   └── firebase.js      # Firebase Admin configuration
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── appointments.js  # Appointment endpoints
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── admin.js         # Admin endpoints
│   │   └── services.js      # Service endpoints
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
│
└── README.md                # This file
```

## 🔧 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**
   - **Cloud Messaging** (optional, for notifications)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on Web app (</>) icon
   - Copy the configuration

5. Generate Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Firebase credentials:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
   ```

4. Install dependencies (already done):
   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Install dependencies (already done):
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### 4. Firestore Database Setup

Create the following collections in Firestore:

#### Services Collection
```javascript
// Collection: services
{
  name: "Smoke Emission Test",
  description: "Standard smoke emission testing for all vehicle types",
  price: 500,
  duration: "30 minutes"
}
```

#### Initial Data Setup
Run these commands in Firestore console or create documents manually:

1. Create a service:
   - Collection ID: `services`
   - Document ID: Auto-generate
   - Fields:
     - name (string): "Smoke Emission Test"
     - description (string): "Standard smoke emission testing for all vehicle types"
     - price (number): 500
     - duration (string): "30 minutes"

### 5. Create Admin User

To create an admin user, you need to set custom claims using Firebase Admin SDK:

1. Register a user through the app
2. Use Firebase Admin SDK to set admin claim (you can create a script or use Firebase console):

```javascript
// admin-setup.js (create this file in backend folder)
const { admin } = require('./config/firebase');

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Admin claim set for ${email}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
}

// Replace with your admin email
setAdminClaim('admin@example.com');
```

Run it:
```bash
node admin-setup.js
```

## 🚦 Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

### Production Build

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The build files will be in `frontend/build/`

3. Deploy to your hosting service (Firebase Hosting, Netlify, Vercel, etc.)

## 📖 User Guide

### For Users

1. **Registration**
   - Click "Register" in the navigation
   - Fill in your details (name, email, phone, password)
   - Submit to create your account

2. **Booking an Appointment**
   - Login to your account
   - Go to "Services" page
   - Click "Book Now" on your desired service
   - Fill in vehicle information
   - Select date and time
   - Choose payment method
   - Upload payment receipt
   - Submit your appointment

3. **Managing Appointments**
   - Go to "My Appointments"
   - View all your appointments with their status
   - Click "View Details" to see full information
   - Upload receipt if not uploaded during booking
   - Download test results when completed

### For Administrators

1. **Access Admin Dashboard**
   - Login with admin credentials
   - Navigate to `/admin/dashboard`

2. **Managing Appointments**
   - View all appointments in the system
   - Filter by status (Pending, Approved, Completed)
   - Click on appointments to view details
   - View uploaded payment receipts
   - Approve or reject appointments
   - Add emission test results

3. **Approving Appointments**
   - Review appointment details
   - Verify payment receipt
   - Click "Approve" to confirm the appointment
   - Or click "Reject" and provide a reason

4. **Adding Test Results**
   - For approved appointments, click "Add Test Result"
   - Enter CO2 level, smoke opacity, and result (Pass/Fail)
   - Submit to complete the appointment

## 🔐 Security Features

- Firebase Authentication for secure user management
- JWT token-based API authentication
- Protected routes for authenticated users
- Admin-only routes with role-based access control
- Secure file uploads with Firebase Storage
- Environment variables for sensitive data

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify JWT token

### Appointments (User)
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/user` - Get user's appointments
- `GET /api/appointments/:id` - Get single appointment
- `PATCH /api/appointments/:id/receipt` - Upload payment receipt

### Admin
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `PATCH /api/admin/appointments/:id/approve` - Approve appointment
- `PATCH /api/admin/appointments/:id/reject` - Reject appointment
- `PATCH /api/admin/appointments/:id/result` - Add test result

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check that API URL in frontend `.env` is correct

2. **Firebase Authentication Errors**
   - Verify Firebase configuration in both frontend and backend
   - Ensure Email/Password authentication is enabled in Firebase Console

3. **File Upload Issues**
   - Check Firebase Storage rules
   - Verify storage bucket name in configuration

4. **Admin Access Issues**
   - Ensure admin custom claim is set correctly
   - User must log out and log back in after admin claim is set

### Firebase Storage Rules

Set these rules in Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{appointmentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Security Rules

Set these rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    match /appointments/{appointmentId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.userId || 
                        request.auth.token.admin == true);
    }
  }
}
```

## 📝 Future Enhancements

- [ ] SMS notifications for appointment updates
- [ ] Email notifications
- [ ] Online payment gateway integration (PayPal, Stripe)
- [ ] Calendar view for available time slots
- [ ] User profile management
- [ ] Appointment rescheduling
- [ ] Service rating and reviews
- [ ] Multi-language support
- [ ] Mobile app version (React Native)
- [ ] Automated test result generation

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for backend services
- All contributors and testers

---

**Built with ❤️ for Smoke Emission Test Center in Mintal**
