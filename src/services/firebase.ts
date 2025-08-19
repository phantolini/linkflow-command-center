
// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHrBrZ82HKPzBiNe1ZqsSth5cJxROJxzk",
  authDomain: "webkmt-40b44.firebaseapp.com",
  projectId: "webkmt-40b44",
  storageBucket: "webkmt-40b44.firebasestorage.app",
  messagingSenderId: "865748583121",
  appId: "1:865748583121:web:4f3f6352383946de46fbf0",
  measurementId: "G-GR8Q4Y853X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (optional - only if you're using Firebase emulators locally)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}
