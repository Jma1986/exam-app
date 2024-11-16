import React from 'react';

export default function LoggedInView({ user, onSignOut, saveData }) {
  return (
    <section id="logged-in-view" className="w-full max-w-xs">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl">Welcome, {user?.displayName}</h1>
        <button
            id="save-data-btn"
            className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
            onClick={onSignOut}          
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}
