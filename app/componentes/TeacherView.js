import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth';
import QuestionForm from './QuestionForm';
import QuestionsBankView from './QuestionsBankView';
import ClassForm from './ClassForm';
import ExamCreation from './ExamCreation';
import ExamPreview from './ExamPreview';
import ExamReview from './ExamReview';
import EvalExam from './EvalExam';
import LinkButton from './LinkButton';
import MyLibrary from './MyLibrary';
import MyClasses from './MyClasses';
import { PiSignOutFill } from "react-icons/pi";
import { capitalize } from '@/utils/customFunctions';


export default function TeacherView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState({ classes: {}, exams: {} });
  const [data, setData] = useState({
    classes: [],
    exams: [],
    evaluatedExams: {},
    questions: [],
  });
  const [selected, setSelected] = useState({ exam: null, studentExam: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classSnapshot, examSnapshot, evaluatedSnapshot, questionSnapshot] = await Promise.all([
          getDocs(collection(db, 'clases')),
          getDocs(collection(db, 'examenes_creados')),
          getDocs(collection(db, 'examenes_evaluados')),
          getDocs(collection(db, 'Banco de preguntas')),
        ]);

        setData({
          classes: classSnapshot.docs
            .filter(doc => doc.data().professor === user?.email)
            .map(doc => ({ id: doc.id, ...doc.data() })),

          exams: examSnapshot.docs
            .filter(doc => doc.data().createdBy === user?.email)
            .map(doc => ({ id: doc.id, ...doc.data() })),

          evaluatedExams: evaluatedSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {}),

          questions: questionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  const toggleCollapse = (type, id) => {
    setCollapsed(prev => ({
      ...prev,
      [type]: { ...prev[type], [id]: !prev[type][id] },
    }));
  };

  const changeView = (newView) => {
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case 'createQuestions':
        return <QuestionForm user={user} />;
      case 'questionsBank':
        return <QuestionsBankView />;
      case 'classForm':
        return <ClassForm user={user} />;
      case 'examCreation':
        return <ExamCreation user={user} />;
      case 'examReview':
        return <ExamReview user={user} />;
      case 'classes':
        return <MyClasses user={user} handleView={changeView} />;
      case 'examPreview':
        return (
          selected.exam && (
            <ExamPreview
              title={selected.exam.title}
              description={selected.exam.description}
              selectedClass={selected.exam.class}
              selectedQuestions={selected.exam.questions.map(id => data.questions.find(q => q.id === id))}
            />
          )
        );
      case 'evalExam':
        return selected.studentExam && <EvalExam examData={selected.studentExam} />;
      default:
        return <MyLibrary user={user} handleView={changeView} />;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full text-gray-900 p-4 flex items-center justify-between mb-10">
        <nav className="flex items-center gap-4">
          <LinkButton isActive={view === 'classes'} onClick={() => changeView('classes')}>
            My Groups
          </LinkButton>
          <LinkButton isActive={view === 'dashboard'} onClick={() => changeView('dashboard')}>
            My Library
          </LinkButton>
          <LinkButton isActive={view === 'examReview'} onClick={() => changeView('examReview')}>
            My Reports
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

      {/* Main Content */}
      <div className="flex justify-center">
        <main className="flex p-6 w-5/6">{renderView()}</main>
      </div>
    </div>
  );
}
