import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE",
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebaseapp.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1",
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebasestorage.app`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "949904130254",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:949904130254:web:7ad2c03fcc0331f9cc109f",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PG9HXCGDR6"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

auth.useDeviceLanguage();

export { app, auth, db };
