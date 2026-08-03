import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE",
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1",
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "munchotella-d67f1"}.firebasestorage.app`,
  messagingSenderId: "123456789", // Optional if not using cloud messaging directly
  appId: "1:123456789:web:abcdef" // Mock appId, user should replace with real one later
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
auth.useDeviceLanguage(); // Important for OTP SMS localization

export { app, auth };
