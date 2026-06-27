# Firebase Setup Guide for TrailGuard

This guide covers deploying Firebase Cloud Functions and Firestore security rules for the group management system.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI if you haven't already
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Ensure you have a Firebase project created at [firebase.google.com](https://firebase.google.com)

3. **Authentication**: Login to Firebase from the CLI
   ```bash
   firebase login
   ```

## Project Structure

```
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── functions/
│   ├── index.js          # Cloud Functions for group management & SOS alerts
│   └── package.json      # Cloud Functions dependencies
├── src/
│   ├── firebase.js       # Firebase SDK initialization
│   └── utils/
│       └── firebaseService.js  # Client-side Firestore operations
```

## 1. Initialize Firebase Project

In the project root directory, run:

```bash
firebase init
```

Select these options when prompted:
- **Features**: Firestore, Functions
- **Project**: Select your existing Firebase project
- **Firestore location**: us-central1 (or closest to your users)
- **JavaScript**: Yes
- **Install dependencies**: Yes (when asked for functions)

## 2. Deploy Firestore Security Rules

The `firestore.rules` file contains security rules for your Firestore database.

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

**What these rules protect:**
- Users can only access their own user document
- Group members can only read groups they're part of
- Only group owners can modify or delete groups
- All authenticated users can create groups
- Messages are readable by group members only
- Sensitive data is protected from unauthorized access

## 3. Install Cloud Functions Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

Key dependencies:
- `firebase-admin`: Server-side Firebase SDK
- `firebase-functions`: Cloud Functions runtime
- `nodemailer`: For sending emails (SOS alerts)

## 4. Configure Email Service (Optional)

For SOS alert email notifications, set up Nodemailer config:

```bash
firebase functions:config:set mail.username="your-email@gmail.com" mail.password="your-app-password"
```

**For Gmail users:**
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password above

## 5. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This deploys:
- `createGroup`: Create new groups with members
- `joinGroup`: Join an existing group by ID
- `leaveGroup`: Leave a group (except owners)
- `sendGroupMessage`: Send messages to group
- `sendLostAlert`: Send lost/missing alerts
- `sendFoundReport`: Send found/safe status reports
- `handleSOS`: Automated SOS alert handling

## 6. Verify Deployment

Check if functions and rules deployed successfully:

```bash
firebase deploy --only firestore:rules,functions
```

List deployed functions:
```bash
firebase functions:list
```

## Group System Architecture

### Firebase Collections

```
groups/
├── {groupId}
    ├── ownerId: string
    ├── ownerEmail: string
    ├── name: string
    ├── trek: string
    ├── members: array
    ├── memberIds: array
    ├── memberEmails: array
    ├── createdAt: timestamp
    └── updatedAt: timestamp

group_messages/
├── {groupId}/
    ├── messages/
        ├── {messageId}
            ├── senderId: string
            ├── senderName: string
            ├── text: string
            └── createdAt: timestamp

notifications/
├── {notificationId}
    ├── type: 'group_lost_alert' | 'group_found_report'
    ├── groupId: string
    ├── senderId: string
    ├── senderName: string
    ├── title: string
    ├── message: string
    ├── recipientIds: array
    ├── recipientEmails: array
    └── createdAt: timestamp
```

### Key Features

1. **Email-based Invitations**: Users can be invited by email before they sign up
2. **Real-time Sync**: Messages and alerts sync instantly across all members
3. **Security**: Firestore rules ensure users can only access groups they're members of
4. **Offline Support**: Client-side caching with localStorage fallback
5. **Lost/Found Alerts**: Special notification system for emergency coordination

## Troubleshooting

### "Authentication required" error
- Ensure user is logged in before creating groups
- Check Firebase Auth configuration in `.env`

### Firestore sync skipped errors
- Verify `.env` credentials are correct
- Check Firestore security rules are deployed
- Ensure internet connection is active

### Cloud Functions not working
- Run `firebase deploy --only functions` again
- Check function logs: `firebase functions:log`
- Verify Cloud Functions API is enabled in Google Cloud Console

### Groups not appearing after creation
- Check Firestore data in Firebase Console
- Verify user email matches in memberEmails array
- Check browser localStorage under `trailguard:groups`

## Local Development (Emulator)

For local testing without Firebase:

```bash
firebase emulators:start
```

This will start local emulators for Firestore, Functions, and Auth.

## Monitoring

Monitor function execution and errors:

```bash
firebase functions:log
```

View Firestore database in Firebase Console:
https://console.firebase.google.com

## Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Next Steps

1. Deploy security rules and functions
2. Test group creation in the app
3. Verify groups appear in Firebase Console
4. Monitor function logs for any errors
5. Adjust security rules if needed based on your use cases

## Support

For Firebase documentation:
- https://firebase.google.com/docs
- https://cloud.google.com/firestore/docs
- https://firebase.google.com/docs/functions

For TrailGuard issues:
- Check browser console for errors
- Review Firebase function logs
- Verify Firestore rules are deployed correctly
