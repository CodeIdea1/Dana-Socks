// lib/firebase.ts - حل مؤقت للنشر السريع
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAO9NfsAKt40n4E3Mipq8IdOB9pvsxJUJI",
  authDomain: "dana-socks.firebaseapp.com",
  projectId: "dana-socks",
  storageBucket: "dana-socks.appspot.com",
  messagingSenderId: "967973245549",
  appId: "1:967973245549:web:7ac4a30b74822177c4e564",
  measurementId: "G-PX23Z0V0QV"
};

// تهيئة Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;