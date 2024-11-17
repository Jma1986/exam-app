import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth.js';
import Exam from './Exam';
import ExamReview from './ExamReview.js';

export default function StudentView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [collapsedCompletedExams, setCollapsedCompletedExams] = useState(false);
  const [assignedExams, setAssignedExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Fetch classes where the student is registered
        const classesSnapshot = await getDocs(collection(db, 'clases'));
        const studentClasses = classesSnapshot.docs
          .filter(doc => doc.data().students.includes(user?.email))
          .map(doc => doc.id);

        // Fetch assigned exams for the student's classes
        const assignedSnapshot = await getDocs(collection(db, 'examenes_creados'));
        const assigned = assignedSnapshot.docs
          .filter(doc => studentClasses.includes(doc.data().class))
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setAssignedExams(assigned);

        // Fetch completed exams by the student
        const completedSnapshot = await getDocs(collection(db, 'examenes_realizados'));
        const completed = completedSnapshot.docs
          .filter(doc => doc.data().studentEmail === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setCompletedExams(completed);

        // Remove completed exams from assigned exams
        const completedExamIds = completed.map(exam => exam.examId);
        setAssignedExams(prevAssignedExams => prevAssignedExams.filter(exam => !completedExamIds.includes(exam.id)));
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };
    fetchExams();
  }, [user, view]);

  const toggleCompletedExamsCollapse = () => {
    setCollapsedCompletedExams(prev => !prev);
  };

  const handleEnterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.error('Error attempting to enable full-screen mode:', err));
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen().catch((err) => console.error('Error attempting to enable full-screen mode:', err));
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari y Opera
      elem.webkitRequestFullscreen().catch((err) => console.error('Error attempting to enable full-screen mode:', err));
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen().catch((err) => console.error('Error attempting to enable full-screen mode:', err));
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {view === 'exam' && currentExam ? (
        <Exam exam={currentExam} user={user} onFinish={() => {
          setCurrentExam(null);
          setView('pendingExams');
        }} />
      ) : (
        <>
          {/* Header */}
          <header className="w-full bg-blue-600 text-gray-900 p-4 flex items-center justify-between">
            <span>{user?.displayName}</span>
            <button
              id="sign-out-btn"
              className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </header>

          {/* Main Content */}
          <div className="flex flex-grow">
            {/* Sidebar on the Left */}
            <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto">
              <div className="mb-6">
                <button
                  className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900 font-bold"
                  onClick={() => setView('pendingExams')}
                >
                  Pruebas pendientes
                </button>
              </div>

              <div className="mt-6">
                <button
                  className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900 font-bold"
                  onClick={toggleCompletedExamsCollapse}
                >
                   Pruebas realizadas
                </button>
                {!collapsedCompletedExams && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {completedExams.map(exam => (
                      <li key={exam.id}
                          onClick={() => {
                            setCurrentExam(exam);
                            setView('ExamReview') }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
                        {exam.examTitle}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>

            {/* Main Dashboard Area */}
            <main className="flex-grow p-6">
              <div className="bg-white p-4 shadow-md rounded">
                {view === 'ExamReview' && (<ExamReview exam={currentExam}/>)}
                {view === 'pendingExams' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Pruebas pendientes</h2>
                    <ul className="space-y-2">
                      {assignedExams.map(exam => (
                        <li key={exam.id} className="p-4 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
                          <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                          <p className="text-gray-800 mb-2">{exam.description}</p>
                          <button
                            className="bg-green-500 text-white px-6 py-3 rounded shadow-md hover:bg-green-600 transition-all ease-in-out"
                            onClick={() => {
                              setCurrentExam(exam);
                              setView('exam');
                              handleEnterFullscreen();
                            }}
                          >
                            Comenzar prueba
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
