import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase_auth';

export default function ExamPreview({ title, description, selectedClass, selectedQuestions }) {
  const [className, setClassName] = useState('');

  useEffect(() => {
    const fetchClassName = async () => {
      if (selectedClass) {
        try {
          const classDoc = await getDoc(doc(db, 'clases', selectedClass));
          if (classDoc.exists()) {
            setClassName(classDoc.data().name);
          } else {
            console.error('No such class found!');
          }
        } catch (error) {
          console.error('Error fetching class name:', error);
        }
      }
    };
    fetchClassName();
  }, [selectedClass]);

  const handleDownload = () => {
    let textContent = `Title: ${title || 'No title provided'}\n\n`;
    textContent += `Description: ${description || 'No description provided'}\n\n`;
    textContent += `Class: ${className || 'No class assigned'}\n\n`;
    textContent += 'Questions:\n';
    selectedQuestions.forEach((question, index) => {
      textContent += `${index + 1}. ${question.question}\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'exam'}.txt`;
    link.click();
  };

return (
    <div className="w-full max-w-3xl p-6 bg-white shadow-md rounded border m-4 relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">{title || 'No title provided'}</h2>
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700">Description</h3>
            <p className="text-base text-gray-800">{description || 'No description provided'}</p>
        </div>
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700">Class</h3>
            <p className="text-base text-gray-800">{className || 'No class assigned'}</p>
        </div>
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700">Questions</h3>
            <ul className="space-y-2">
                {selectedQuestions.length > 0 ? (
                    selectedQuestions.map((question, index) => (
                        <li key={index} className="text-base text-gray-800">
                            {index + 1}. {question.question}
                        </li>
                    ))
                ) : (
                    <p className="text-gray-700">No questions selected yet.</p>
                )}
            </ul>
        </div>
        <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md absolute bottom-4 right-4 hover:bg-blue-600 transition-all ease-in-out"
        >
            Download Exam Preview
        </button>
    </div>
);
}
