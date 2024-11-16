import React, { useState } from 'react';
import Image from 'next/image';
import QuestionForm from './QuestionForm';
import QuestionsBankView from './QuestionsBankView';
import CsvUpload from './csvUpload';
import ClassForm from './ClassForm';
import ExamCreation from './ExamCreation';

export default function TeacherView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  const toggleSubjectCollapse = (subject) => {
    setCollapsedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-blue-600 text-gray-900 p-4 flex items-center justify-between">
        {/* Navigation Buttons on the Left */}
        <nav className="flex items-center gap-4">
          <button
            className="bg-transparent text-gray-900 hover:bg-blue-500 px-3 py-2 rounded"
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className="bg-transparent text-gray-900 hover:bg-blue-500 px-3 py-2 rounded"
            onClick={() => setView('createQuestions')}
          >
            Create Questions
          </button>
          <button
            className="bg-transparent text-gray-900 hover:bg-blue-500 px-3 py-2 rounded"
            onClick={() => setView('uploadCsv')}
          >
            Upload csv
          </button>
          <button
            className="bg-transparent text-gray-900 hover:bg-blue-500 px-3 py-2 rounded"
            onClick={() => setView('questionsBank')}
          >
            Questions Bank
          </button>
          <button
            className="bg-transparent text-gray-900 hover:bg-blue-500 px-3 py-2 rounded"
            onClick={() => setView('examCreation')}
          >
            Crear examen
          </button>
  
        </nav>
        {/* User and Logout Button on the Right */}
        <div className="flex items-center gap-4">
          <span>{user?.displayName}</span>
          <button
            id="sign-out-btn"
            className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar on the Left */}
        <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto">
          <div className='w-full flex justify-between'>
            <h2 className="font-bold text-lg mb-4 text-gray-900">Clases</h2>
            <button 
                className='text-black h-full w-6 rounded-md bg-blue-500 hover:bg-blue-400 active:bg-blue-700 transition-all duration-150 trasnform hover:scale-95'
                onClick={() => setView('createClass')}>+</button>
          </div>
          <ul className="space-y-2">
            {/* Example subjects and exams - Replace with dynamic content in the future */}
            <li>
              <button
                className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
                onClick={() => toggleSubjectCollapse('Mathematics')}
              >
                Mathematics
              </button>
              {!collapsedSubjects['Mathematics'] && (
                <ul className="ml-4 mt-2 space-y-1">
                  <li>
                    <button className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
                      Exam 1
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
                      Exam 2
                    </button>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <button
                className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
                onClick={() => toggleSubjectCollapse('Physics')}
              >
                Physics
              </button>
              {!collapsedSubjects['Physics'] && (
                <ul className="ml-4 mt-2 space-y-1">
                  <li>
                    <button className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
                      Exam 1
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-grow p-6">
          {view === 'createQuestions' && <QuestionForm />}
          {view === 'questionsBank' && <QuestionsBankView />}
          {view === 'uploadCsv' && <CsvUpload />}
          {view === 'createClass' && <ClassForm user={user} />}
          {view === 'examCreation' && <ExamCreation user={user} />}
          {view === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900">Teacher Dashboard</h1>
              {/* Future dashboard component will go here */}
              <div className="bg-white p-4 shadow-md rounded">
                <p className="text-gray-900">Dashboard content will be added here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
