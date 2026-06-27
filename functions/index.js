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

// ==========================================
// GROUP MANAGEMENT FUNCTIONS
// ==========================================

// Create a new group with proper Firestore persistence
exports.createGroup = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { name, trek, members = [] } = data;
  const uid = context.auth.uid;
  const email = context.auth.token.email;

  // Validate input
  if (!name || !name.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Group name is required');
  }
  if (!trek || !trek.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Trek name is required');
  }

  try {
    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    // Normalize members
    const normalizedMembers = members.map(member => ({
      uid: member.uid || null,
      email: (member.email || '').toLowerCase(),
      name: member.name || member.email,
      role: member.role || 'member'
    }));

    // Build member lists
    const memberEmails = [...new Set([
      email.toLowerCase(),
      ...normalizedMembers.map(m => m.email).filter(Boolean)
    ])];

    const memberIds = [...new Set([
      uid,
      ...normalizedMembers.filter(m => m.uid).map(m => m.uid)
    ])];

    // Owner object
    const owner = {
      uid,
      email: email.toLowerCase(),
      name: userData.name || email.split('@')[0],
      role: 'owner'
    };

    // Create group in Firestore
    const groupRef = await admin.firestore().collection('groups').add({
      ownerId: uid,
      ownerEmail: email.toLowerCase(),
      name: name.trim(),
      trek: trek.trim(),
      members: [owner, ...normalizedMembers],
      memberIds,
      memberEmails,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Group created: ${groupRef.id} by ${uid}`);

    return {
      success: true,
      groupId: groupRef.id,
      group: {
        id: groupRef.id,
        name: name.trim(),
        trek: trek.trim(),
        members: [owner, ...normalizedMembers],
        memberIds,
        memberEmails,
        ownerId: uid,
        ownerEmail: email.toLowerCase()
      }
    };
  } catch (error) {
    console.error('❌ Failed to create group:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create group: ' + error.message);
  }
});

// Join an existing group
exports.joinGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { groupId } = data;
  const uid = context.auth.uid;
  const email = context.auth.token.email;

  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'Group ID is required');
  }

  try {
    const groupRef = admin.firestore().collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group not found');
    }

    const groupData = groupDoc.data();
    const normalizedEmail = email.toLowerCase();

    // Check if user already in group
    if (groupData.memberIds.includes(uid) || groupData.memberEmails.includes(normalizedEmail)) {
      return { success: true, message: 'Already a member' };
    }

    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    // Add user to group
    await groupRef.update({
      memberIds: admin.firestore.FieldValue.arrayUnion(uid),
      memberEmails: admin.firestore.FieldValue.arrayUnion(normalizedEmail),
      members: admin.firestore.FieldValue.arrayUnion({
        uid,
        email: normalizedEmail,
        name: userData.name || email.split('@')[0],
        role: 'member'
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ User ${uid} joined group ${groupId}`);

    return { success: true, message: 'Successfully joined group' };
  } catch (error) {
    console.error('❌ Failed to join group:', error);
    throw new functions.https.HttpsError('internal', 'Failed to join group: ' + error.message);
  }
});

// Leave a group
exports.leaveGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { groupId } = data;
  const uid = context.auth.uid;
  const email = context.auth.token.email;

  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'Group ID is required');
  }

  try {
    const groupRef = admin.firestore().collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group not found');
    }

    const groupData = groupDoc.data();
    const normalizedEmail = email.toLowerCase();

    // Prevent owner from leaving
    if (groupData.ownerId === uid) {
      throw new functions.https.HttpsError('permission-denied', 'Group owner cannot leave');
    }

    // Remove user from arrays
    const updatedMemberIds = groupData.memberIds.filter(id => id !== uid);
    const updatedMemberEmails = groupData.memberEmails.filter(e => e !== normalizedEmail);
    const updatedMembers = groupData.members.filter(m => m.uid !== uid && m.email !== normalizedEmail);

    await groupRef.update({
      memberIds: updatedMemberIds,
      memberEmails: updatedMemberEmails,
      members: updatedMembers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ User ${uid} left group ${groupId}`);

    return { success: true, message: 'Successfully left group' };
  } catch (error) {
    console.error('❌ Failed to leave group:', error);
    throw new functions.https.HttpsError('internal', 'Failed to leave group: ' + error.message);
  }
});

// Send group message
exports.sendGroupMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { groupId, text } = data;
  const uid = context.auth.uid;

  if (!groupId || !text) {
    throw new functions.https.HttpsError('invalid-argument', 'Group ID and message text are required');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    const messageRef = await admin.firestore()
      .collection('group_messages')
      .doc(groupId)
      .collection('messages')
      .add({
        senderId: uid,
        senderName: userData.name || 'User',
        text: text.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log(`✅ Message sent to group ${groupId}`);

    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send message: ' + error.message);
  }
});

// Send lost alert to group
exports.sendLostAlert = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { groupId } = data;
  const uid = context.auth.uid;

  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'Group ID is required');
  }

  try {
    const groupDoc = await admin.firestore().collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group not found');
    }

    const groupData = groupDoc.data();
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    // Create alert notification
    const alertRef = await admin.firestore().collection('notifications').add({
      type: 'group_lost_alert',
      groupId,
      senderId: uid,
      senderName: userData.name || 'User',
      title: '🚨 Lost Alert',
      message: `${userData.name || 'A member'} is reported lost in group ${groupData.name}`,
      recipientIds: groupData.memberIds,
      recipientEmails: groupData.memberEmails,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Lost alert sent in group ${groupId}`);

    return { success: true, alertId: alertRef.id };
  } catch (error) {
    console.error('❌ Failed to send lost alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send lost alert: ' + error.message);
  }
});

// Send found report
exports.sendFoundReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { groupId } = data;
  const uid = context.auth.uid;

  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'Group ID is required');
  }

  try {
    const groupDoc = await admin.firestore().collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group not found');
    }

    const groupData = groupDoc.data();
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    // Create found report notification
    const reportRef = await admin.firestore().collection('notifications').add({
      type: 'group_found_report',
      groupId,
      senderId: uid,
      senderName: userData.name || 'User',
      title: '✅ Found Report',
      message: `${userData.name || 'A member'} has been found safe in group ${groupData.name}`,
      recipientIds: groupData.memberIds,
      recipientEmails: groupData.memberEmails,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Found report sent in group ${groupId}`);

    return { success: true, reportId: reportRef.id };
  } catch (error) {
    console.error('❌ Failed to send found report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send found report: ' + error.message);
  }
});

