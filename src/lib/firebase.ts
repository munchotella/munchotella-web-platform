import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE",
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1",
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebasestorage.app`,
  messagingSenderId: "123456789", 
  appId: "1:123456789:web:abcdef" 
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
auth.useDeviceLanguage(); 

export { app, auth, db };
