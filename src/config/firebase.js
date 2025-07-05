// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-f1dfe.firebaseapp.com",
  projectId: "chatapp-f1dfe",
  storageBucket: "chatapp-f1dfe.firebasestorage.app",
  messagingSenderId: "687873750238",
  appId: "1:687873750238:web:edf0d8fbda8a538e5c7e4f",
  measurementId: "G-PSKECJFMQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth();
export const db=getFirestore();
export const storage=getStorage();
