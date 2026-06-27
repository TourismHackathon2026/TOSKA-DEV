import admin from '../firebase-admin.js';
import { db } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };

    // Look up local user for backward compatibility with other routes
    const localUser = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(decodedToken.uid);
    if (localUser) {
      req.user = {
        id: localUser.id,
        email: localUser.email,
        role: localUser.role,
      };
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export { auth };
export default auth;
