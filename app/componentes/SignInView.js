import Image from "next/image";
import React from 'react';

export default function SignInView({ onSignIn }) {
  return (
    <section id="logged-out-view" className="w-full max-w-xs">
      <div className="bg-yellow-400 rounded-xl p-6 flex flex-col items-center gap-8">
        <h1 className="font-calistoga text-6xl text-center">XABEC</h1>
        <Image src="/fondoWeb1.png" alt="XABEC logo" width="300" height="300" />

        <div className="w-full flex items-center justify-center">
          <button
            id="sign-in-with-google-btn"
            className="flex items-center justify-center rounded border-0 shadow-md hover:shadow-none transition-all ease-in-out"
            onClick={onSignIn}
          >
            <Image src="/web_light_sq_ctn.svg" alt="Google logo" width="200" height="200" />
          </button>
        </div>
      </div>
    </section>
  );
}
