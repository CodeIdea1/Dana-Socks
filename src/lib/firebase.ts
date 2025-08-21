// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// طباعة المتغيرات للتأكد من تحميلها
console.log('🔍 Environment variables check:');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Found ✓' : 'Missing ✗');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Found ✓' : 'Missing ✗');
console.log('Full API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// إذا لم تُحمّل المتغيرات، استخدم القيم مباشرة مؤقتاً
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAO9NfsAKt40n4E3Mipq8IdOB9pvsxJUJI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dana-socks.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dana-socks",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dana-socks.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "967973245549",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:967973245549:web:7ac4a30b74822177c4e564",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PX23Z0V0QV"
};

console.log('🔥 Firebase Config:', firebaseConfig);

// التحقق من صحة API Key
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 30) {
  console.error('❌ Invalid API Key:', firebaseConfig.apiKey);
  throw new Error('Invalid Firebase API Key');
}

// تهيئة Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

console.log('✅ Firebase app initialized successfully');

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;