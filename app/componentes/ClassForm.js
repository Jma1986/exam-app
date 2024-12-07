import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase_auth.js';

export default function ClassForm({ user }) {
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState('');
  const [message, setMessage] = useState('');

  // Function to handle creating a new class
  const handleCreateClass = async () => {
    // Validate inputs
    if (!className) {
      setMessage('Please provide a class name.');
      return;
    }

    if (!students) {
      setMessage('Please provide at least one student email.');
      return;
    }

    // Split student emails and validate
    const studentEmails = students.split(',').map(email => email.trim());
    const invalidEmails = studentEmails.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      setMessage(`Invalid email(s) found: ${invalidEmails.join(', ')}`);
      return;
    }

    // Add class to the database
    try {
      await addDoc(collection(db, 'clases'), {
        name: className,
        students: studentEmails,
        professor: user?.email,
      });
      setMessage('Class created successfully!');
      setClassName('');
      setStudents('');
    } catch (error) {
      setMessage(`Error creating class: ${error.message}`);
    }
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create a New Class</h2>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
          placeholder="Enter class name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Student Emails (comma separated)</label>
        <textarea
          value={students}
          onChange={(e) => setStudents(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
          placeholder="Enter student emails, separated by commas"
          rows="4"
        />
      </div>
      <button
        onClick={handleCreateClass}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out"
      >
        Create Class
      </button>
    </div>
  );
}
