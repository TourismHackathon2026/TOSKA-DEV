import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  if (!admin.apps.length) {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
      || join(__dirname, 'service-account.json');
    
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('🔥 Firebase Admin initialized with service account');
    } catch (fileErr) {
      admin.initializeApp();
      console.log('🔥 Firebase Admin initialized with default credentials');
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

export default admin;
