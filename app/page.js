"use client"
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import SignInView from "./componentes/SignInView";
import StudentView from "./componentes/StudentView";
import TeacherView from "./componentes/TeacherView";
import { authSignInWithGoogle, authSignOut, monitorAuthState } from "./componentes/auth_functions";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = monitorAuthState(setUser, setLoggedIn, setUserRole);
    return () => unsubscribe();
  }, []); // No incluimos `auth` como dependencia, ya que no cambiará
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {!loggedIn ? (
        <SignInView onSignIn={() => authSignInWithGoogle(setUser, setLoggedIn, setUserRole)} />
      ) : (
        userRole === 'alumno' ? (
          <StudentView user={user} onSignOut={() => authSignOut(setUser, setLoggedIn, setUserRole)} />
        ) : (
          <TeacherView user={user} onSignOut={() => authSignOut(setUser, setLoggedIn, setUserRole)} />
        )
      )}
    </div>
  );
}