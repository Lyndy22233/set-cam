/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors({origin: true}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

// Import routes from backend folder
const appointmentRoutes = require("../backend/routes/appointments");
const authRoutes = require("../backend/routes/auth");
const adminRoutes = require("../backend/routes/admin");
const serviceRoutes = require("../backend/routes/services");
const settingsRoutes = require("../backend/routes/settings");

// Mount routes
app.use("/appointments", appointmentRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/services", serviceRoutes);
app.use("/settings", settingsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({status: "OK", message: "API is running"});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
