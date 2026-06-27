// functions/index.js
// Cloud Function to handle SOS alerts from Realtime Database
// This function listens for new SOS entries under /sos/{uid}/{pushId}
// and notifies admins and group members via email (Nodemailer) and FCM.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transport using Firebase Functions config variables.
// Set these via: firebase functions:config:set mail.username="you@gmail.com" mail.password="yourPwd"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().mail.username,
    pass: functions.config().mail.password,
  },
});

// Topic that all group members subscribe to for SOS alerts.
const SOS_TOPIC = 'sos-alerts';

exports.handleSOS = functions.database.ref('sos/{uid}/{pushId}').onCreate(async (snap, context) => {
  const { lat, lng, timestamp } = snap.val();
  const uid = context.params.uid;

  const locationUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const humanTime = new Date(timestamp).toLocaleString();
  const message = `🚨 SOS ALERT 🚨\nUser ID: ${uid}\nLocation: ${locationUrl}\nTime: ${humanTime}`;

  // 1️⃣ Email to admin(s)
  try {
    await transporter.sendMail({
      from: `"Smart Trekking" <${functions.config().mail.username}>`,
      to: 'admin@example.com, team@example.com', // <-- replace with real admin emails
      subject: 'SOS Alert Triggered',
      text: message,
    });
    console.log('✅ SOS email sent');
  } catch (err) {
    console.error('❌ Failed to send SOS email', err);
  }

  // 2️⃣ Push notification to all group members via FCM topic
  const payload = {
    notification: {
      title: 'SOS Alert',
      body: `User ${uid} needs help!`,
    },
    data: {
      uid: uid,
      lat: String(lat),
      lng: String(lng),
      timestamp: String(timestamp),
    },
  };
  try {
    await admin.messaging().sendToTopic(SOS_TOPIC, payload);
    console.log('✅ SOS FCM notification sent');
  } catch (err) {
    console.error('❌ Failed to send SOS FCM', err);
  }

  return null; // indicate completion
});
