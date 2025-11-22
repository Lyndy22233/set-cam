# OTP Email Setup Guide

## 🎉 New Features Added:
- ✅ OTP verification during registration
- ✅ Forgot Password with OTP
- ✅ Email-based OTP delivery

## 📧 Email Configuration Required

To use OTP features, you need to configure email sending. We're using **Gmail SMTP** (100% FREE).

### Option 1: Gmail App Password (Recommended - FREE)

1. **Enable 2-Step Verification on your Gmail:**
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and turn it on

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "SET CAM"
   - Click "Generate"
   - Copy the 16-character password

3. **Add to Render Environment Variables:**
   - Go to your Render service
   - Click "Environment" tab
   - Add these variables:
     ```
     SMTP_HOST = smtp.gmail.com
     SMTP_PORT = 587
     SMTP_USER = your-email@gmail.com
     SMTP_PASS = (paste the 16-character app password)
     ```
   - Click "Save Changes"

4. **Wait for Render to redeploy** (automatic, 1-2 minutes)

### Option 2: Other Email Providers (Also FREE)

**Outlook/Hotmail:**
```
SMTP_HOST = smtp-mail.outlook.com
SMTP_PORT = 587
SMTP_USER = your-email@outlook.com
SMTP_PASS = your-password
```

**Yahoo:**
```
SMTP_HOST = smtp.mail.yahoo.com
SMTP_PORT = 587
SMTP_USER = your-email@yahoo.com
SMTP_PASS = your-app-password (generate at Yahoo Security settings)
```

## 🧪 Testing OTP Features

1. **Test Registration:**
   - Go to https://set-cam.web.app/register
   - Fill in your details
   - Click "Send OTP"
   - Check your email for 6-digit code
   - Enter code and verify
   - Complete registration

2. **Test Forgot Password:**
   - Go to https://set-cam.web.app/forgot-password
   - Enter your email
   - Click "Send OTP"
   - Check email for code
   - Enter code
   - Set new password

## ⚠️ Important Notes

- OTP codes expire after **10 minutes**
- You can resend OTP after **60 seconds** cooldown
- Emails are sent using free SMTP (no cost!)
- OTPs are stored securely in Firestore
- Used OTPs are automatically deleted

## 🔒 Security

- OTP codes are 6-digit random numbers
- Stored with expiration timestamp
- Verified status tracked
- Automatic cleanup after use
- No passwords stored in emails

## 📱 Email Templates

Users will receive professional emails with:
- 6-digit OTP code in large, clear font
- Purpose (registration or password reset)
- 10-minute expiration notice
- Branded SET CAM header

## 🚀 Deployment Status

✅ Backend: Render will auto-deploy from GitHub
✅ Frontend: Needs rebuild and redeploy

### To Deploy Frontend:
```powershell
cd "C:\Users\chest\Downloads\SET CAM\frontend"
npm run build
cd ..
firebase deploy --only hosting
```

## 🐛 Troubleshooting

**"Failed to send OTP":**
- Check SMTP credentials in Render
- Verify Gmail App Password is correct
- Check Render logs for errors

**"OTP expired":**
- OTPs expire after 10 minutes
- Click "Resend OTP" to get a new one

**"Invalid OTP":**
- Make sure you entered the correct 6-digit code
- Check for typos
- Try resending a new OTP

## 📊 Monitoring

Check Render logs to see:
- OTP sending status
- Email delivery confirmations
- Error messages if any

Access logs: Your Render service → Logs tab
