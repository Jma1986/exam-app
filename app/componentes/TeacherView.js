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
import ExamReview from './ExamReview';
import EvalExam from './EvalExam';
import LinkButton from './LinkButton';
import MyLibrary from './MyLibrary';
import MyClasses from './MyClasses';

export default function TeacherView({ user, onSignOut }) {
  const [view, setView] = useState('dashboard');
  const [collapsedClasses, setCollapsedClasses] = useState({});
  const [collapsedExams, setCollapsedExams] = useState({});
  const [classesData, setClassesData] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [evaluatedExamsData, setEvaluatedExamsData] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudentExam, setSelectedStudentExam] = useState(null);
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

        const evaluatedSnapshot = await getDocs(collection(db, 'examenes_evaluados'));
        const evaluatedExams = evaluatedSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});
        setEvaluatedExamsData(evaluatedExams);

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

  const toggleExamCollapse = (examId) => {
    setCollapsedExams((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setView('examPreview');
  };

  const handleStudentExamClick = (studentExam) => {
    setSelectedStudentExam(studentExam);
    setView('evalExam');
  };

  const handleView = (view) => {
    console.log('Changing view to:', view);
    setView(view);  // Ahora establece la vista directamente
};
  

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full  text-gray-900 p-4 flex items-center justify-between mb-10">
        {/* Navigation Buttons on the Left */}
        <nav className="flex items-center gap-4">
        <LinkButton isActive={view === 'classes'} onClick={() => setView('classes')}>
            My Groups
          </LinkButton>
          <LinkButton isActive={view === 'dashboard'} onClick={() => setView('dashboard')}>
            My Library
          </LinkButton>

          <LinkButton
            isActive={view === 'examReview'}
            onClick={() => setView('examReview')}
          >
            My Reports
            </LinkButton>

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
      <div className="flex justify-center ">
        {/* Main Dashboard Area */}
        <main className=" flex p-6 w-5/6 ">
          {view === 'createQuestions' && <QuestionForm user={user}/>}
          {view === 'questionsBank' && <QuestionsBankView />}
          {view === 'classForm' && <ClassForm user={user} />}
          {view === 'examCreation' && <ExamCreation user={user} />}
          {view === 'examReview' && (<ExamReview user={user}/>)}
          {view === 'classes' && (<MyClasses user={user} handleView={handleView}/>)}
          {view === 'examPreview' && selectedExam && (
            <ExamPreview
              title={selectedExam.title}
              description={selectedExam.description}
              selectedClass={selectedExam.class}
              selectedQuestions={selectedExam.questions.map(id => questions.find(q => q.id === id))}
            />
          )}
          {view === 'evalExam' && selectedStudentExam && (
            <EvalExam examData={selectedStudentExam} />
          )}
          {view === 'dashboard' && (<MyLibrary user={user} handleView={handleView}/>)}
        </main>
      </div>
    </div>
  );
}
