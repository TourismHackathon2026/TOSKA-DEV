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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FEATURED_TREKS, WEATHER_DATA, ACTIVE_TREKKERS, ALERTS } from '../data/treks';

function getActiveUser() {
  if (auth?.currentUser) return auth.currentUser;
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('trailguard:demo-session');
    return stored ? JSON.parse(stored).user : null;
  } catch (error) {
    console.warn('Unable to read demo user from storage:', error.message);
    return null;
  }
}

// ==========================================
// 1. User Profile Sync
// ==========================================

function isAdminEmail(email) {
  if (!email) return false;
  const adminList = String(import.meta.env.VITE_FIREBASE_ADMIN_EMAILS || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(email.toLowerCase());
}

export async function syncUserToFirestore(firebaseUser) {
  if (!firebaseUser) return null;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const baseUserData = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    avatar: firebaseUser.photoURL || 'default-avatar.png',
    updatedAt: serverTimestamp(),
  };

  const isAdmin = isAdminEmail(firebaseUser.email);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...baseUserData,
      role: isAdmin ? 'admin' : 'trekker',
      createdAt: serverTimestamp(),
    });
  } else {
    const existingData = userSnap.data();
    const role = isAdmin ? 'admin' : (existingData?.role || 'trekker');
    await setDoc(userRef, {
      ...baseUserData,
      role,
    }, { merge: true });
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

export async function getUserByEmail(email) {
  if (!email) return null;
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', email.toLowerCase()));
  const snap = await getDocs(q);
  let user = null;
  snap.forEach((docSnap) => {
    user = { id: docSnap.id, ...docSnap.data() };
  });
  return user;
}

export async function createNotificationInFirestore(notificationData) {
  if (!notificationData) throw new Error('Notification data is required');
  const notificationsCol = collection(db, 'notifications');
  const payload = {
    title: notificationData.title || 'Notification',
    message: notificationData.message || '',
    type: notificationData.type || 'info',
    senderId: notificationData.senderId || null,
    senderName: notificationData.senderName || null,
    link: notificationData.link || null,
    groupId: notificationData.groupId || null,
    recipientIds: notificationData.recipientIds || [],
    isGlobal: notificationData.isGlobal === true,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(notificationsCol, payload);
  return { id: docRef.id, ...payload };
}

export function subscribeToNotifications(userId, onUpdate) {
  if (!db) {
    console.warn('Firestore not available — skipping notifications subscription.');
    return () => {};
  }

  const notificationsMap = new Map();
  const updateSnapshot = () => {
    const list = Array.from(notificationsMap.values()).sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    onUpdate(list);
  };

  const notificationsCol = collection(db, 'notifications');
  const globalQuery = query(notificationsCol, where('isGlobal', '==', true), orderBy('createdAt', 'desc'));
  const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
    snapshot.forEach((docSnap) => {
      notificationsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });
    updateSnapshot();
  }, (err) => {
    console.error('Global notifications subscription failed:', err);
  });

  const unsubscribePersonal = userId
    ? onSnapshot(query(notificationsCol, where('recipientIds', 'array-contains', userId), orderBy('createdAt', 'desc')), (snapshot) => {
      snapshot.forEach((docSnap) => {
        notificationsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      updateSnapshot();
    }, (err) => {
      console.error('Personal notifications subscription failed:', err);
    })
    : () => {};

  return () => {
    unsubscribeGlobal();
    unsubscribePersonal();
  };
}

export async function findGroupByIdentifier(identifier) {
  if (!identifier) return null;
  const normalized = String(identifier).trim();
  const groupRef = doc(db, 'groups', normalized);
  const docSnap = await getDoc(groupRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }

  const groupsCol = collection(db, 'groups');
  const nameQuery = query(groupsCol, where('name', '==', normalized));
  const snap = await getDocs(nameQuery);
  let group = null;
  snap.forEach((docSnap) => {
    group = { id: docSnap.id, ...docSnap.data() };
  });
  return group;
}

export async function joinGroupInFirestore(groupId, currentUser = getActiveUser()) {
  const user = currentUser || getActiveUser();
  if (!user) throw new Error('Authentication required');

  console.log('🔗 Joining group:', groupId);

  try {
    // Try Firestore first
    console.log('📝 Updating Firestore...');
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) throw new Error('Group not found');
    
    const group = groupSnap.data();
    const normalizedEmail = user.email?.toLowerCase();

    if (group.memberIds?.includes(user.uid)) {
      console.log('ℹ️ User already a member');
      return { id: groupSnap.id, ...group };
    }

    const member = {
      uid: user.uid,
      email: normalizedEmail,
      name: user.displayName || user.email?.split('@')[0] || 'Member',
      role: 'member',
    };

    const existingMembers = Array.isArray(group.members) ? group.members : [];
    const emailMatchIndex = normalizedEmail ? existingMembers.findIndex((memberItem) => memberItem.email?.toLowerCase() === normalizedEmail) : -1;
    const updatedMembers = [...existingMembers];

    if (emailMatchIndex >= 0) {
      updatedMembers[emailMatchIndex] = { ...updatedMembers[emailMatchIndex], ...member };
    } else {
      updatedMembers.push(member);
    }

    await updateDoc(groupRef, {
      members: updatedMembers,
      memberIds: arrayUnion(user.uid),
      memberEmails: arrayUnion(normalizedEmail),
      updatedAt: serverTimestamp(),
    });

    const updatedSnap = await getDoc(groupRef);
    console.log('✅ Joined group in Firestore');
    const updatedGroup = { id: updatedSnap.id, ...updatedSnap.data() };
    upsertGroupInLocalCache(updatedGroup);
    return updatedGroup;
  } catch (fallbackError) {
    console.warn('⚠️ Firestore join failed:', fallbackError.message);
    console.log('💾 Updating localStorage fallback...');
    
    const storedGroups = readStoredGroups();
    const groupIndex = storedGroups.findIndex((group) => group.id === groupId);
    if (groupIndex >= 0) {
      const existingGroup = storedGroups[groupIndex];
      if (!existingGroup.memberIds?.includes(user.uid)) {
        existingGroup.members = [
          ...(existingGroup.members || []),
          { uid: user.uid, email: user.email, name: user.displayName || user.email?.split('@')[0] || 'Member', role: 'member' }
        ];
        existingGroup.memberIds = [...new Set([...(existingGroup.memberIds || []), user.uid])];
        existingGroup.memberEmails = [...new Set([...(existingGroup.memberEmails || []), user.email?.toLowerCase()])];
        storedGroups[groupIndex] = existingGroup;
        writeStoredGroups(storedGroups);
        console.log('✅ Joined group in localStorage');
      }
      return existingGroup;
    }
    throw fallbackError;
  }
}

export async function leaveGroupInFirestore(groupId, currentUser = getActiveUser()) {
  const user = currentUser || getActiveUser();
  if (!user) throw new Error('Authentication required');

  console.log('👋 Leaving group:', groupId);

  try {
    // Try Firestore first
    console.log('📝 Updating Firestore...');
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) throw new Error('Group not found');
    
    const group = groupSnap.data();
    const normalizedEmail = user.email?.toLowerCase();

    const members = Array.isArray(group.members) ? group.members : [];
    const remainingMembers = members.filter((member) => member.uid !== user.uid && member.email?.toLowerCase() !== normalizedEmail);

    await updateDoc(groupRef, {
      members: remainingMembers,
      memberIds: arrayRemove(user.uid),
      memberEmails: arrayRemove(normalizedEmail),
      updatedAt: serverTimestamp(),
    });

    const updatedSnap = await getDoc(groupRef);
    console.log('✅ Left group in Firestore');
    const updatedGroup = { id: updatedSnap.id, ...updatedSnap.data() };
    upsertGroupInLocalCache(updatedGroup);
    return updatedGroup;
  } catch (fallbackError) {
    console.warn('⚠️ Firestore leave failed:', fallbackError.message);
    console.log('💾 Updating localStorage fallback...');
    
    const storedGroups = readStoredGroups();
    const groupIndex = storedGroups.findIndex((group) => group.id === groupId);
    if (groupIndex >= 0) {
      const existingGroup = storedGroups[groupIndex];
      existingGroup.members = (existingGroup.members || []).filter((member) => member.uid !== user.uid && member.email?.toLowerCase() !== user.email?.toLowerCase());
      existingGroup.memberIds = (existingGroup.memberIds || []).filter((memberId) => memberId !== user.uid);
      existingGroup.memberEmails = (existingGroup.memberEmails || []).filter((email) => email !== user.email?.toLowerCase());
      storedGroups[groupIndex] = existingGroup;
      writeStoredGroups(storedGroups);
      console.log('✅ Left group in localStorage');
      return existingGroup;
    }
    throw fallbackError;
  }
}

export async function createGroupMessageInFirestore(groupId, messageText) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');
  if (!groupId) throw new Error('Group ID is required');
  if (!messageText || !messageText.trim()) throw new Error('Message text is required');

  const messagePayload = {
    groupId,
    senderId: user.uid,
    senderName: user.displayName || user.email?.split('@')[0] || 'Member',
    text: messageText.trim(),
    createdAt: serverTimestamp(),
  };

  try {
    const messagesCol = collection(db, 'group_messages', groupId, 'messages');
    const docRef = await addDoc(messagesCol, messagePayload);
    const newMessage = { id: docRef.id, ...messagePayload };
    const cached = readStoredGroupMessages(groupId);
    cacheGroupMessages(groupId, [...cached, newMessage]);
    return newMessage;
  } catch (error) {
    console.warn('Firestore message send failed, caching locally:', error.message);
    const fallbackMessage = {
      id: `local-${Date.now()}`,
      groupId,
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0] || 'Member',
      text: messageText.trim(),
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      offline: true,
    };
    const cached = readStoredGroupMessages(groupId);
    cacheGroupMessages(groupId, [...cached, fallbackMessage]);
    return fallbackMessage;
  }
}

async function resolveLiveLocationSnapshot() {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude || 0,
        accuracy: position.coords.accuracy || 0,
        source: 'device',
      };
    } catch (error) {
      console.warn('Unable to read current geolocation:', error.message);
    }
  }

  const locationRef = doc(db, 'live_trekkers', getActiveUser()?.uid);
  const locationSnap = await getDoc(locationRef);
  const locationData = locationSnap.exists() ? locationSnap.data() : null;

  return locationData?.latitude && locationData?.longitude
    ? {
        latitude: Number(locationData.latitude),
        longitude: Number(locationData.longitude),
        altitude: Number(locationData.altitude || 0),
        accuracy: 0,
        source: 'tracker',
      }
    : null;
}

export async function createGroupLostAlert(groupId) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');
  if (!groupId) throw new Error('Group ID is required');

  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');

  const group = groupSnap.data();
  const memberIds = (group.memberIds || []).filter((memberId) => memberId && memberId !== user.uid);
  const locationData = await resolveLiveLocationSnapshot();
  const locationText = locationData?.latitude && locationData?.longitude
    ? `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`
    : 'live location not currently shared';
  const locationUrl = locationData?.latitude && locationData?.longitude
    ? `https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`
    : null;

  const message = `${user.displayName || user.email?.split('@')[0] || 'A member'} has triggered a lost alert and needs help. Live location: ${locationText}${locationUrl ? ` (${locationUrl})` : ''}.`;

  const notificationPayload = {
    title: 'Lost alert',
    message,
    type: 'group_lost_alert',
    senderId: user.uid,
    senderName: user.displayName || user.email?.split('@')[0] || 'Member',
    link: '/dashboard',
    groupId,
    recipientIds: memberIds,
    isGlobal: false,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'notifications'), notificationPayload);
    await createGroupMessageInFirestore(groupId, message);
    return { id: docRef.id, ...notificationPayload, location: locationData };
  } catch (error) {
    console.warn('Lost alert notification fallback:', error.message);
    await createGroupMessageInFirestore(groupId, message);
    return { id: `local-alert-${Date.now()}`, ...notificationPayload, location: locationData, offline: true };
  }
}

export async function createGroupFoundReportInFirestore(groupId, note = 'A found report has been filed for this group.') {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');
  if (!groupId) throw new Error('Group ID is required');

  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');

  const group = groupSnap.data();
  const memberIds = (group.memberIds || []).filter((memberId) => memberId && memberId !== user.uid);
  const message = `${user.displayName || user.email?.split('@')[0] || 'A member'} has reported a found update: ${note}`;

  const notificationPayload = {
    title: 'Found report',
    message,
    type: 'group_found_report',
    senderId: user.uid,
    senderName: user.displayName || user.email?.split('@')[0] || 'Member',
    link: '/dashboard',
    groupId,
    recipientIds: memberIds,
    isGlobal: false,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'notifications'), notificationPayload);
    return { id: docRef.id, ...notificationPayload };
  } catch (error) {
    console.warn('Found report notification fallback:', error.message);
    return { id: `local-found-${Date.now()}`, ...notificationPayload, offline: true };
  }
}

export function subscribeToGroupMessages(groupId, onUpdate) {
  const cachedMessages = readStoredGroupMessages(groupId);
  if (cachedMessages.length > 0) {
    onUpdate(cachedMessages);
  }

  if (!db || !groupId) {
    return () => {};
  }

  const messagesCol = collection(db, 'group_messages', groupId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
    onUpdate(list);
    cacheGroupMessages(groupId, list);
  }, (err) => {
    console.error('Group messages subscription failed:', err);
    const fallbackMessages = readStoredGroupMessages(groupId);
    if (fallbackMessages.length > 0) {
      onUpdate(fallbackMessages);
    }
  });
}

export function subscribeToGroupNotifications(groupId, onUpdate) {
  if (!db || !groupId) {
    return () => {};
  }

  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, where('groupId', '==', groupId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
    onUpdate(list);
  }, (err) => {
    console.error('Group notifications subscription failed:', err);
  });
}

export async function createTrailRegistrationInFirestore(registrationData) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');

  const trekName = registrationData.trekName || registrationData.trek || 'Unknown route';
  const payload = {
    userId: user.uid,
    userName: user.displayName || user.email?.split('@')[0] || 'Trekker',
    userEmail: user.email,
    trekId: registrationData.trekId || null,
    trekName,
    startDate: registrationData.startDate || '',
    notes: registrationData.notes || '',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const registrationsCol = collection(db, 'trail_registrations');
    const docRef = await addDoc(registrationsCol, payload);
    return { id: docRef.id, ...registrationData, trekName, status: 'active' };
  } catch (error) {
    console.warn('Trail registration fallback:', error.message);
    const fallbackRegistration = {
      id: `registration-${Date.now()}`,
      ...registrationData,
      trekName,
      status: 'active',
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) },
    };
    const stored = readStoredTrailRegistrations();
    writeStoredTrailRegistrations([fallbackRegistration, ...stored]);
    return fallbackRegistration;
  }
}

export function subscribeToUserTrailRegistrations(onUpdate) {
  const activeUser = getActiveUser();
  if (!db || !activeUser) {
    const stored = readStoredTrailRegistrations();
    onUpdate(stored.filter((item) => item.userId === activeUser?.uid));
    return () => {};
  }
  const colRef = collection(db, 'trail_registrations');
  const q = query(colRef, where('userId', '==', activeUser.uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
    onUpdate(list);
  }, (err) => {
    console.error('Trail registration subscription failed:', err);
  });
}

export function subscribeToTrailRegistrations(onUpdate) {
  if (!db) {
    console.warn('Firestore not available — skipping trail registrations subscription.');
    return () => {};
  }
  const colRef = collection(db, 'trail_registrations');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
    onUpdate(list);
  }, (err) => {
    console.error('Trail registrations subscription failed:', err);
  });
}

export async function updateUserLiveLocation(locationData) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');

  const trackerRef = doc(db, 'live_trekkers', user.uid);
  await setDoc(trackerRef, {
    userId: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Trekker',
    trek: locationData.trek || 'Unknown route',
    latitude: Number(locationData.latitude || 0),
    longitude: Number(locationData.longitude || 0),
    altitude: Number(locationData.altitude || 0),
    battery: Number(locationData.battery || 100),
    status: locationData.status || 'active',
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return true;
}

export async function stopUserLiveTracking() {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');

  const trackerRef = doc(db, 'live_trekkers', user.uid);
  await setDoc(trackerRef, {
    status: 'offline',
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return true;
}

function getGroupStorageKey() {
  return 'trailguard:groups';
}

function getTrailRegistrationsStorageKey() {
  return 'trailguard:trail-registrations';
}

function readStoredTrailRegistrations() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getTrailRegistrationsStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to read stored trail registrations:', error.message);
    return [];
  }
}

function writeStoredTrailRegistrations(registrations) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getTrailRegistrationsStorageKey(), JSON.stringify(registrations));
  } catch (error) {
    console.warn('Unable to write stored trail registrations:', error.message);
  }
}

function getGroupMessagesStorageKey(groupId) {
  return `trailguard:group-messages:${groupId}`;
}

function readStoredGroups() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getGroupStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to read stored groups:', error.message);
    return [];
  }
}

function writeStoredGroups(groups) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getGroupStorageKey(), JSON.stringify(groups));
  } catch (error) {
    console.warn('Unable to write stored groups:', error.message);
  }
}

function readStoredGroupMessages(groupId) {
  if (typeof window === 'undefined' || !groupId) return [];
  try {
    const raw = window.localStorage.getItem(getGroupMessagesStorageKey(groupId));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to read stored group messages:', error.message);
    return [];
  }
}

function writeStoredGroupMessages(groupId, messages) {
  if (typeof window === 'undefined' || !groupId) return;
  try {
    window.localStorage.setItem(getGroupMessagesStorageKey(groupId), JSON.stringify(messages));
  } catch (error) {
    console.warn('Unable to write stored group messages:', error.message);
  }
}

function cacheGroupMessages(groupId, messages) {
  if (!groupId || !Array.isArray(messages)) return;
  writeStoredGroupMessages(groupId, messages);
}

function normalizeGroup(group) {
  if (!group || typeof group !== 'object') return group;
  const normalizedEmails = Array.isArray(group.memberEmails)
    ? Array.from(new Set(group.memberEmails.map((email) => String(email).toLowerCase().trim()).filter(Boolean)))
    : [];
  const normalizedIds = Array.isArray(group.memberIds)
    ? Array.from(new Set(group.memberIds.filter(Boolean)))
    : [];
  const normalizedMembers = Array.isArray(group.members)
    ? group.members.map((member) => ({
        uid: member.uid || null,
        email: member.email?.toLowerCase?.() || '',
        name: member.name || member.email || 'Member',
        role: member.role || 'member',
      }))
    : [];

  return {
    ...group,
    memberEmails: normalizedEmails,
    memberIds: normalizedIds,
    members: normalizedMembers,
  };
}

function upsertGroupInLocalCache(group) {
  if (typeof window === 'undefined' || !group?.id) return;
  const normalized = normalizeGroup(group);
  const storedGroups = readStoredGroups();
  const existingIndex = storedGroups.findIndex((item) => item.id === normalized.id);
  if (existingIndex >= 0) {
    storedGroups[existingIndex] = normalized;
  } else {
    storedGroups.unshift(normalized);
  }
  writeStoredGroups(storedGroups);
}

function removeGroupFromLocalCache(groupId) {
  if (typeof window === 'undefined' || !groupId) return;
  const storedGroups = readStoredGroups().filter((group) => group.id !== groupId);
  writeStoredGroups(storedGroups);
}

function cacheGroupsLocally(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return;
  groups.forEach((group) => upsertGroupInLocalCache(group));
}

export async function createGroupInFirestore(groupData, currentUser = getActiveUser()) {
  const user = currentUser || getActiveUser();
  if (!user) {
    console.error('❌ Authentication required for group creation');
    throw new Error('Authentication required');
  }

  console.log('📦 Creating group:', groupData.name);

  const ownerEmail = user.email?.toLowerCase();

  // Resolve members' uids from email if not provided
  const resolvedMembers = await Promise.all(
    (groupData.members || []).map(async (member) => {
      let uid = member.uid;
      const email = member.email?.toLowerCase();
      let name = member.name || email;
      if (!uid && email) {
        try {
          const profile = await getUserByEmail(email);
          if (profile) {
            uid = profile.uid;
            name = profile.name || email;
          }
        } catch (e) {
          console.warn('Failed to resolve user by email', email, e);
        }
      }
      return {
        uid: uid || null,
        email,
        name,
        role: member.role || 'member',
      };
    })
  );

  const owner = {
    uid: user.uid,
    email: ownerEmail,
    name: user.displayName || user.email?.split('@')[0] || 'Owner',
    role: 'owner',
  };

  const allMembers = [owner, ...resolvedMembers];

  const memberEmails = [...new Set(allMembers.map((m) => m.email).filter(Boolean))];
  const memberIds = [...new Set(allMembers.map((m) => m.uid).filter(Boolean))];

  const groupData_formatted = {
    ownerId: user.uid,
    ownerEmail,
    name: groupData.name,
    trek: groupData.trek,
    members: allMembers,
    memberIds,
    memberEmails,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // First, try Firestore direct write (skip Cloud Functions for now)
  try {
    console.log('📝 Writing to Firestore...');
    const groupsCol = collection(db, 'groups');
    const docRef = await addDoc(groupsCol, groupData_formatted);
    console.log('✅ Group created in Firestore:', docRef.id);

    const createdGroup = { id: docRef.id, ...groupData_formatted };
    upsertGroupInLocalCache(createdGroup);
    return createdGroup;
  } catch (firestoreError) {
    console.warn('⚠️ Firestore write failed:', firestoreError.message);

    // Fallback to localStorage only
    console.log('💾 Using localStorage fallback...');
    const fallbackGroup = {
      id: `group-${Date.now()}`,
      ownerId: user.uid,
      ownerEmail,
      name: groupData.name,
      trek: groupData.trek,
      members: allMembers,
      memberIds,
      memberEmails,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    const storedGroups = readStoredGroups();
    storedGroups.unshift(fallbackGroup);
    writeStoredGroups(storedGroups);
    console.log('✅ Group created in localStorage:', fallbackGroup.id);

    return fallbackGroup;
  }
}

export async function getUserGroupsFromFirestore(currentUserEmail = null, currentUser = getActiveUser()) {
  const user = currentUser || getActiveUser();
  const emailToMatch = currentUserEmail?.toLowerCase?.() || user?.email?.toLowerCase?.();
  const uidToMatch = user?.uid || null;

  if (!user && !emailToMatch) {
    console.warn('⚠️ No authenticated user, loading anonymous groups from localStorage');
    return readStoredGroups().filter((group) => group.memberIds?.includes('anonymous') || group.members?.some((member) => member.uid === 'anonymous'));
  }

  console.log('📂 Loading groups for user:', emailToMatch || user?.email);
  const normalizedEmail = emailToMatch;
  const groupsMap = new Map();

  try {
    console.log('🔍 Querying Firestore for groups...');
    const groupsCol = collection(db, 'groups');
    const queries = [];

    if (uidToMatch) {
      queries.push(query(groupsCol, where('memberIds', 'array-contains', uidToMatch)));
    }
    if (normalizedEmail) {
      queries.push(query(groupsCol, where('memberEmails', 'array-contains', normalizedEmail)));
    }

    for (const groupQuery of queries) {
      const snap = await getDocs(groupQuery);
      snap.forEach((docSnap) => {
        groupsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
    }

    let groups = Array.from(groupsMap.values()).map((group) => normalizeGroup(group));
    console.log(`📊 Total groups from Firestore: ${groups.length}`);

    if (groups.length > 0) {
      cacheGroupsLocally(groups);
      return groups;
    }
  } catch (firestoreError) {
    console.warn('⚠️ Firestore query failed:', firestoreError.message);
  }

  const storedGroups = readStoredGroups();
  const userGroups = storedGroups.filter((group) =>
    (user && group.memberIds?.includes(user.uid)) ||
    (normalizedEmail && group.memberEmails?.includes(normalizedEmail)) ||
    (normalizedEmail && group.members?.some(
      (member) =>
        member.email?.toLowerCase() === normalizedEmail ||
        (user && member.uid === user.uid)
    ))
  );

  console.log(`📦 Loaded ${userGroups.length} groups from localStorage`);
  return userGroups.map((group) => normalizeGroup(group));
}

export async function updateGroupInFirestore(groupId, updateData) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');

  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');
  const group = groupSnap.data();
  if (group.ownerId !== user.uid) throw new Error('Only the group owner can update this group');

  await updateDoc(groupRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
  const updated = await getDoc(groupRef);
  const updatedGroup = { id: updated.id, ...updated.data() };
  upsertGroupInLocalCache(updatedGroup);
  return updatedGroup;
}

export async function addMemberToGroup(groupId, memberEmail, currentUser = getActiveUser()) {
  const user = currentUser || getActiveUser();
  if (!user) throw new Error('Authentication required');
  if (!groupId) throw new Error('Group ID is required');
  if (!memberEmail || !memberEmail.trim()) throw new Error('Member email is required');

  const normalizedEmail = memberEmail.toLowerCase().trim();
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');
  const group = groupSnap.data();

  const currentMembers = Array.isArray(group.members) ? group.members : [];
  const normalizedEmails = Array.isArray(group.memberEmails) ? group.memberEmails.map((email) => String(email).toLowerCase().trim()) : [];

  if (normalizedEmails.includes(normalizedEmail) || currentMembers.some((m) => m.email?.toLowerCase() === normalizedEmail)) {
    return { id: groupSnap.id, ...group };
  }

  let memberUid = null;
  let memberName = normalizedEmail;
  try {
    const profile = await getUserByEmail(normalizedEmail);
    if (profile) {
      memberUid = profile.uid;
      memberName = profile.name || normalizedEmail;
    }
  } catch (err) {
    console.warn('Unable to resolve member by email:', err.message);
  }

  const newMember = {
    uid: memberUid,
    email: normalizedEmail,
    name: memberName,
    role: 'member',
  };

  const updatedMembers = [...currentMembers, newMember];
  const updatedMemberIds = Array.from(new Set([...(group.memberIds || []), ...(memberUid ? [memberUid] : [])].filter(Boolean)));
  const updatedMemberEmails = Array.from(new Set([...(group.memberEmails || []), normalizedEmail].filter(Boolean)));

  await updateDoc(groupRef, {
    members: updatedMembers,
    memberIds: updatedMemberIds,
    memberEmails: updatedMemberEmails,
    updatedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(groupRef);
  const updatedGroup = { id: updatedSnap.id, ...updatedSnap.data() };
  upsertGroupInLocalCache(updatedGroup);
  return updatedGroup;
}

export async function deleteGroupInFirestore(groupId) {
  const user = getActiveUser();
  if (!user) throw new Error('Authentication required');

  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) throw new Error('Group not found');
    const group = groupSnap.data();
    if (group.ownerId !== user.uid) throw new Error('Only the group owner can delete this group');

    await deleteDoc(groupRef);
    removeGroupFromLocalCache(groupId);
    return true;
  } catch (error) {
    console.warn('Firestore group delete failed, using local fallback:', error.message);
    const storedGroups = readStoredGroups().filter((group) => group.id !== groupId);
    writeStoredGroups(storedGroups);
    return true;
  }
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
  const user = getActiveUser();
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
  const user = getActiveUser();
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
  const user = getActiveUser();
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
    status: 'open',
    resolved: false,
    alertType: 'sos',
    createdAt: serverTimestamp(),
  });

  const alertsCol = collection(db, 'alerts');
  await addDoc(alertsCol, {
    type: 'sos',
    severity: 'critical',
    message: `SOS Emergency activated by ${name}! GPS coordinates sent.`,
    time: 'Just now',
    createdAt: serverTimestamp(),
  });

  await createNotificationInFirestore({
    title: 'SOS Alert',
    message: `SOS alert triggered by ${name}. Immediate response required.`,
    type: 'sos',
    senderId: uid !== 'anonymous' ? uid : null,
    senderName: name,
    isGlobal: true,
    link: '/dashboard',
    alertId: docRef.id,
  });

  try {
    const { api } = await import('./api');
    await api.sendSOS({
      latitude: Number(alertData.latitude || 27.9881),
      longitude: Number(alertData.longitude || 86.9250),
      altitude: Number(alertData.altitude || 5000),
      message: alertData.message || 'SOS Emergency Alert triggered!',
    });
  } catch (err) {
    console.warn('Backend SOS sync failed:', err);
  }

  return docRef.id;
}

export function subscribeToSOSAlerts(onUpdate) {
  if (!db) {
    console.warn('Firestore not available — skipping SOS alerts subscription.');
    return () => {};
  }
  const colRef = collection(db, 'sos_alerts');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdate(list);
  }, (err) => {
    console.error('SOS alerts subscription failed:', err);
  });
}

export async function resolveSOSAlertInFirestore(alertId) {
  const alertRef = doc(db, 'sos_alerts', alertId);
  await updateDoc(alertRef, {
    status: 'resolved',
    resolved: true,
    resolvedAt: serverTimestamp(),
  });
  return true;
}

// Real-time listener for Active Trekkers map dots & list
export function subscribeToLiveTrekkers(onUpdate) {
  if (!db) {
    console.warn('Firestore not available — skipping live trekkers subscription.');
    return () => {};
  }
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
  if (!db) {
    console.warn('Firestore not available — skipping alerts subscription.');
    return () => {};
  }
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
