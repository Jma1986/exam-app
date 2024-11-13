import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase_auth.js";

// Sign in with Google function
export function authSignInWithGoogle(setUser, setLoggedIn) {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in with Google");
      setUser(result.user);
      setLoggedIn(true);
    }).catch((error) => {
      console.error(error.message);
    });
}

// Sign out function
export function authSignOut(setUser, setLoggedIn) {
  signOut(auth)
    .then(() => {
      console.log("Signed out");
      setUser(null);
      setLoggedIn(false);
    }).catch((error) => {
      console.error(error.message);
    });
}

// Monitor authentication state
export function monitorAuthState(setUser, setLoggedIn) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
  });
}
