// firebase_auth.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// FIREBASE SETUP
const firebaseConfig = {
  apiKey: "AIzaSyBjOnik-44b3t6HqNAPN_iy13yyVcPZR0c",
  authDomain: "exam-app-eb456.firebaseapp.com",
  projectId: "exam-app-eb456",
  storageBucket: "exam-app-eb456.firebasestorage.app",
  messagingSenderId: "829429204380",
  appId: "1:829429204380:web:76c71948fce530ac1a7459"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
