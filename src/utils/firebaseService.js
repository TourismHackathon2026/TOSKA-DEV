import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FEATURED_TREKS, WEATHER_DATA, ACTIVE_TREKKERS, ALERTS } from '../data/treks';

// ==========================================
// 1. User Profile Sync
// ==========================================

export async function syncUserToFirestore(firebaseUser) {
  if (!firebaseUser) return null;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    avatar: firebaseUser.photoURL || 'default-avatar.png',
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    userData.role = 'trekker'; // Default role
    userData.createdAt = serverTimestamp();
    await setDoc(userRef, userData);
  } else {
    // Merge updates but preserve role
    await setDoc(userRef, userData, { merge: true });
  }

  const updatedSnap = await getDoc(userRef);
  return updatedSnap.data();
}

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

export async function updateUserProfile(uid, profileData) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp()
  });
  const userSnap = await getDoc(userRef);
  return userSnap.data();
}

// ==========================================
// 2. Database Seeder (One-Time Run Helper)
// ==========================================

export async function seedFirestoreIfEmpty() {
  try {
    // 2.1 Seed Treks
    const treksCol = collection(db, 'treks');
    const treksSnap = await getDocs(treksCol);
    if (treksSnap.empty) {
      console.log('🌱 Seeding treks to Firestore...');
      for (const trek of FEATURED_TREKS) {
        await setDoc(doc(db, 'treks', trek.id), {
          ...trek,
          createdAt: serverTimestamp()
        });
      }
      console.log('✅ Treks seeded!');
    }

    // 2.2 Seed Weather
    const weatherCol = collection(db, 'weather_data');
    const weatherSnap = await getDocs(weatherCol);
    if (weatherSnap.empty) {
      console.log('🌱 Seeding weather to Firestore...');
      for (const w of WEATHER_DATA) {
        await addDoc(weatherCol, {
          ...w,
          updatedAt: serverTimestamp()
        });
      }
      console.log('✅ Weather seeded!');
    }

    // 2.3 Seed Active Trekkers
    const activeCol = collection(db, 'active_trekkers');
    const activeSnap = await getDocs(activeCol);
    if (activeSnap.empty) {
      console.log('🌱 Seeding active trekkers...');
      for (const t of ACTIVE_TREKKERS) {
        await setDoc(doc(db, 'active_trekkers', String(t.id)), {
          ...t,
          loggedAt: serverTimestamp()
        });
      }
    }

    // 2.4 Seed Live Trekkers for real‑time GPS
    const liveCol = collection(db, 'live_trekkers');
    const liveSnap = await getDocs(liveCol);
    if (liveSnap.empty) {
      console.log('🌱 Seeding live trekkers...');
      for (const t of ACTIVE_TREKKERS) {
        await setDoc(doc(db, 'live_trekkers', String(t.id)), {
          ...t,
          valid: t.name !== 'Pemba Sherpa', // mark Pemba Sherpa as invalid
          updatedAt: serverTimestamp()
        });
      }
    }

    // 2.4 Seed Alerts
    const alertsCol = collection(db, 'alerts');
    const alertsSnap = await getDocs(alertsCol);
    if (alertsSnap.empty) {
      console.log('🌱 Seeding alerts...');
      for (const a of ALERTS) {
        await setDoc(doc(db, 'alerts', String(a.id)), {
          ...a,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Failed to seed Firestore:', error);
  }
}

// ==========================================
// 3. Treks API
// ==========================================

export async function getTreksFromFirestore() {
  const treksCol = collection(db, 'treks');
  const treksSnap = await getDocs(treksCol);
  const treksList = [];
  treksSnap.forEach(doc => {
    treksList.push({ id: doc.id, ...doc.data() });
  });
  return treksList;
}

export async function getTrekDetails(id) {
  const docRef = doc(db, 'treks', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// ==========================================
// 4. Bookings API
// ==========================================

export async function createBookingInFirestore(bookingData) {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');

  const bookingsCol = collection(db, 'bookings');
  const docRef = await addDoc(bookingsCol, {
    userId: user.uid,
    trekId: bookingData.trekId,
    startDate: bookingData.startDate,
    groupSize: Number(bookingData.groupSize || 1),
    totalPrice: Number(bookingData.totalPrice),
    notes: bookingData.notes || '',
    status: 'pending',
    createdAt: serverTimestamp()
  });

  return { id: docRef.id, ...bookingData, status: 'pending' };
}

export async function getBookingsFromFirestore() {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');

  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  const bookings = [];
  snap.forEach(doc => {
    bookings.push({ id: doc.id, ...doc.data() });
  });
  return bookings;
}

export async function cancelBookingInFirestore(bookingId) {
  const docRef = doc(db, 'bookings', bookingId);
  await updateDoc(docRef, { status: 'cancelled' });
}

// ==========================================
// 5. SOS and Alerts (Real-Time Subscriptions)
// ==========================================

export async function sendSOSAlert(alertData) {
  const user = auth.currentUser;
  const uid = user ? user.uid : 'anonymous';
  const name = user ? (user.displayName || user.email) : 'Unknown Trekker';

  const sosCol = collection(db, 'sos_alerts');
  const docRef = await addDoc(sosCol, {
    userId: uid,
    userName: name,
    latitude: Number(alertData.latitude || 27.9881),
    longitude: Number(alertData.longitude || 86.9250),
    altitude: Number(alertData.altitude || 5000),
    message: alertData.message || 'SOS Emergency Alert triggered!',
    status: 'active',
    createdAt: serverTimestamp()
  });

  // Also publish to the active alert feed for Mission Control
  const alertsCol = collection(db, 'alerts');
  await addDoc(alertsCol, {
    type: 'sos',
    severity: 'critical',
    message: `SOS Emergency activated by ${name}! GPS Coordinates sent.`,
    time: 'Just now',
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

// Real-time listener for Active Trekkers map dots & list
export function subscribeToLiveTrekkers(onUpdate) {
  const colRef = collection(db, 'live_trekkers');
  return onSnapshot(colRef, (snapshot) => {
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    onUpdate(list);
  }, (err) => {
    console.error('Live trekkers subscription failed:', err);
  });
}

// Real-time listener for Critical Alert feed
export function subscribeToAlerts(onUpdate) {
  const colRef = collection(db, 'alerts');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    onUpdate(list);
  }, (err) => {
    console.error('Alerts subscription failed:', err);
  });
}

// ==========================================
// 6. Weather Conditions API
// ==========================================

export async function getLiveWeatherFromFirestore() {
  const colRef = collection(db, 'weather_data');
  const snap = await getDocs(colRef);
  const weather = [];
  snap.forEach(doc => {
    weather.push({ id: doc.id, ...doc.data() });
  });
  return weather;
}
