import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth.js';
import Exam from './Exam';
import ExamReview from './ExamReview.js';
import LinkButton from './LinkButton';
import { capitalize } from '@/utils/customFunctions';
import { PiSignOutFill } from 'react-icons/pi';

export default function StudentView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({
    groups: [],
    assignedExams: [],
    completedExams: [],
  });
  const [currentExam, setCurrentExam] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesSnapshot = await getDocs(collection(db, 'clases'));
        const studentClasses = classesSnapshot.docs
          .filter(doc => doc.data().students.includes(user?.email))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const [assignedSnapshot, completedSnapshot] = await Promise.all([
          getDocs(collection(db, 'examenes_creados')),
          getDocs(collection(db, 'examenes_realizados')),
        ]);

        const assigned = assignedSnapshot.docs
          .filter(doc => doc.data().assignedTo?.includes(user?.email))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const completed = completedSnapshot.docs
          .filter(doc => doc.data().studentEmail === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const completedExamIds = completed.map(exam => exam.examId);
        setData({
          groups: studentClasses,
          assignedExams: assigned,
          completedExams: completed,
        });
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchData();
  }, [user, view]);

  const changeView = (newView) => {
    setView(newView);
  };

  return (
    <div className={`w-full min-h-screen flex flex-col ${view === 'exam' ? 'exam-mode' : ''}`}>
      {/* Header */}
      {view !== 'exam' && (
        <header className="w-full text-gray-900 p-4 flex items-center justify-between mb-10">
          <nav className="flex items-center gap-4">
            <LinkButton isActive={view === 'groups'} onClick={() => changeView('groups')}>
              Grupos
            </LinkButton>
            <LinkButton isActive={view === 'pendingExams'} onClick={() => changeView('pendingExams')}>
              Pruebas pendientes
            </LinkButton>
            <LinkButton isActive={view === 'dashboard'} onClick={() => changeView('dashboard')}>
              Dashboard
            </LinkButton>
          </nav>
          <div className="flex items-center gap-4">
            <span>{capitalize(user?.displayName)}</span>
            <button
              id="sign-out-btn"
              className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
              onClick={onSignOut}
            >
              <PiSignOutFill className="text-xl" />
            </button>
          </div>
        </header>
      )}

      <main className={`flex justify-center ${view === 'exam' ? 'w-full h-full' : ''}`}>
        <div className={`p-6 ${view !== 'exam' ? 'w-5/6' : 'w-full h-full'}`}>
          {/* Groups view */}
          {view === 'groups' && (
            <div>
              <h1 className='text-gray-900 text-2xl mb-6'>Grupos</h1>
              {data.groups.map(group => (
                <li key={group.id} className="pl-4 gap-4 h-16 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 list-none">
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{group.name}</h3>
                  <p className="text-xs text-gray-900">{`Invited by: ${group.professor}`}</p>
                </li>
              ))}
            </div>
          )}

          {/* PendingExams view */}
          {view === 'pendingExams' && (
            <div>
              <ul className="space-y-2">
                {data.assignedExams.map(exam => (
                  <li key={exam.id} className="p-4 bg-gray-100 rounded text-gray-900">
                    <div className='flex justify-between'>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-gray-800 mb-2">{exam.description}</p>
                        <p className="text-gray-800 mb-2 text-xs">{`Assigned by: ${exam.createdBy}`}</p>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-6 py-3 rounded shadow-md hover:bg-blue-700 transition-all ease-in-out"
                        onClick={() => {
                          setCurrentExam(exam);
                          setView('exam');
                          document.documentElement.requestFullscreen?.().catch(err => console.error('Error enabling fullscreen:', err));
                        }}
                      >
                        Comenzar prueba
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dashboard view */}
          {view === 'dashboard' && (
            <h1>dashboard</h1>
          )}

          {/* Exam view */}
          {view === 'exam' && currentExam && (
            <Exam
              exam={currentExam}
              user={user}
              onFinish={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen?.().catch(err => console.error('Error exiting fullscreen:', err));
                }
                setCurrentExam(null);
                setView('pendingExams');
              }}
            />
          )}

          {/* Exam review */}
          {view === 'ExamReview' && currentExam && (
            <ExamReview exam={currentExam} />
          )}
        </div>
      </main>
    </div>
  );
}
