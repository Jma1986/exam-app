import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider, db } from "../firebase_auth.js";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";

// Sign in with Google function
export function authSignInWithGoogle(setUser, setLoggedIn, setUserRole) {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      console.log("Signed in with Google");
      setUser(result.user);
      setLoggedIn(true);
      await saveData(result.user); // Save user data after successful sign-in
      const role = await getUserRole(result.user.email);
      setUserRole(role);
    }).catch((error) => {
      console.error(error.message);
    });
}

// Sign out function
export function authSignOut(setUser, setLoggedIn, setUserRole) {
  signOut(auth)
    .then(() => {
      console.log("Signed out");
      setUser(null);
      setLoggedIn(false);
      setUserRole(null);
    }).catch((error) => {
      console.error(error.message);
    });
}

// Monitor authentication state
export function monitorAuthState(setUser, setLoggedIn, setUserRole) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUser(user);
      setLoggedIn(true);
      const role = await getUserRole(user.email);
      setUserRole(role);
    } else {
      setUser(null);
      setLoggedIn(false);
      setUserRole(null);
    }
  });
}

// Save user data to Firestore
export async function saveData(user) {
  try {
    // Check if the user already exists in the database
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // User does not exist, add to the database
      const docRef = await addDoc(collection(db, "users"), {
        name: user.displayName,
        email: user.email,
        class: "null",
        role: "alumno"
      });
      console.log("Document written with ID: ", docRef.id);
    } else {
      console.log("User already exists in the database.");
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Get user role from Firestore
export async function getUserRole(email) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.role;
    }
    return null;
  } catch (e) {
    console.error("Error fetching user role: ", e);
    return null;
  }
}
