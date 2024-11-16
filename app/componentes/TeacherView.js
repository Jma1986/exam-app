import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth';
import QuestionForm from './QuestionForm';
import QuestionsBankView from './QuestionsBankView';
import CsvUpload from './csvUpload';
import ClassForm from './ClassForm';
import ExamCreation from './ExamCreation';
import ExamPreview from './ExamPreview';

export default function TeacherView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [collapsedClasses, setCollapsedClasses] = useState({});
  const [classesData, setClassesData] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchClassesAndExams = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'clases'));
        const classes = classSnapshot.docs
          .filter(doc => doc.data().professor === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setClassesData(classes);

        const examSnapshot = await getDocs(collection(db, 'examenes_creados'));
        const exams = examSnapshot.docs
          .filter(doc => doc.data().createdBy === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setExamsData(exams);

        const questionSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
        const fetchedQuestions = questionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching classes, exams, and questions:', error);
      }
    };
    fetchClassesAndExams();
  }, [user]);

  const toggleClassCollapse = (classId) => {
    setCollapsedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setView('examPreview');
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
            Crear preguntas
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
                className='text-black h-full w-6 rounded-md bg-blue-500 hover:bg-blue-400 active:bg-blue-700 transition-all duration-150 transform hover:scale-95'
                onClick={() => setView('createClass')}>+</button>
          </div>
          <ul className="space-y-2">
            {classesData.map((cls) => (
              <li key={cls.id}>
                <button
                  className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
                  onClick={() => toggleClassCollapse(cls.id)}
                >
                  {cls.name}
                </button>
                {!collapsedClasses[cls.id] && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {examsData
                      .filter(exam => exam.class === cls.id)
                      .map((exam) => (
                        <li key={exam.id}>
                          <button 
                            className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-900"
                            onClick={() => handleExamClick(exam)}
                          >
                            {exam.title}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-grow p-6">
          {view === 'createQuestions' && <QuestionForm />}
          {view === 'questionsBank' && <QuestionsBankView />}
          {view === 'createClass' && <ClassForm user={user} />}
          {view === 'examCreation' && <ExamCreation user={user} />}
          {view === 'examPreview' && selectedExam && (
            <ExamPreview
              title={selectedExam.title}
              description={selectedExam.description}
              selectedClass={selectedExam.class}
              selectedQuestions={selectedExam.questions.map(id => questions.find(q => q.id === id))}
            />
          )}
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
