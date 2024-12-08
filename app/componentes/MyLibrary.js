import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase_auth';
import LinkButton from './LinkButton';
import { CiFileOn } from "react-icons/ci";
import { IconContext } from "react-icons";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { LuFileQuestion } from "react-icons/lu";
import { TiDelete, TiCancel } from "react-icons/ti";
import { MdOutlineAssignmentInd, MdAssignmentTurnedIn } from "react-icons/md";
import QuestionsBankView from './QuestionsBankView';
import ExamPreview from './ExamPreview';
import { arrayUnion } from 'firebase/firestore';

export default function MyLibrary({ user, handleView }) {
  const [examLibrary, setExamLibrary] = useState([]);
  const [examPreview, setExamPreview] = useState({});
  const [view, setView] = useState('exams');
  const [classes, setClasses] = useState([]);
  const [showClassSelection, setShowClassSelection] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examSnapshot = await getDocs(collection(db, 'examenes_creados'));
        const userExams = examSnapshot.docs
          .filter(doc => doc.data().createdBy === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setExamLibrary(userExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, [user, examPreview]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'clases'));
        const userClasses = classSnapshot.docs
          .filter(doc => doc.data().professor === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(userClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [user]);

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteDoc(doc(db, 'examenes_creados', examId));
        setExamLibrary(prevExams => prevExams.filter(exam => exam.id !== examId));
        alert('Exam deleted successfully');
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete the exam. Please try again.');
      }
    }
  };

  const handleAssignExam = async (examId, classId) => {
    try {
        const selectedClass = classes.find(cls => cls.id === classId);
        if (selectedClass) {
            const studentEmails = selectedClass.students || [];
            const examRef = doc(db, 'examenes_creados', examId);

            // Usar arrayUnion para agregar sin sobrescribir
            await updateDoc(examRef, {
                assignedTo: arrayUnion(...studentEmails)
            });

            alert(`Exam assigned to ${selectedClass.name}`);
            setShowClassSelection(null);
        } else {
            alert('Class not found.');
        }
    } catch (error) {
        console.error('Error assigning exam:', error);
        alert('Failed to assign the exam. Please try again.');
    }
};


  return (
    <div className='flex flex-grow justify-between'>
      <aside className='w-2/12'>
        <h1 className='font-bold text-gray-900 text-4xl mb-10'>My Library</h1>
        <button 
          onClick={() => handleView('examCreation')} 
          className='font-bold flex gap-2 items-baseline ml-4 border-l-2 border-l-blue-900 px-4 py-2 text-gray-800 mb-4 hover:border-l-4 transition-all ease-in-out'
        >
          <BsFileEarmarkPlus /> Add Exams
        </button>
        <button 
          onClick={() => handleView('createQuestions')} 
          className='font-bold flex gap-2 items-baseline ml-4 border-l-2 border-l-blue-900 px-4 py-2 text-gray-800 mb-4 hover:border-l-4 transition-all ease-in-out'
        >
          <LuFileQuestion /> Add Questions
        </button>
      </aside>

      <main className='w-9/12'>
        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <LinkButton isActive={view === 'exams'} onClick={() => setView('exams')}>Exams</LinkButton>
            <LinkButton isActive={view === 'questions'} onClick={() => setView('questions')}>Questions</LinkButton>
          </div>
        </div>

        {view === 'exams' && (
          <ul className='mt-6'>
            {examLibrary.map((exam) => (
              <li 
                key={exam.id} 
                className='flex pl-4 gap-4 h-14 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold'>
                <div className='flex items-center gap-4'>
                  <IconContext.Provider value={{ className: "text-3xl" }}>
                    <CiFileOn />
                  </IconContext.Provider>
                  <span
                    onClick={() => {
                      setView("examPreview");
                      setExamPreview(exam);
                    }}
                    className='text-lg cursor-pointer'
                  >
                    {exam.title}
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                <button onClick={() => setShowClassSelection(exam.id)} className=' text-blue-600 hover:underline' title='Assign exam'>
                    <MdOutlineAssignmentInd />
                  </button>
                  {exam.assignedTo.length > 0 ? <IconContext.Provider value={{ className: "text-green-600" }}>
                     <MdAssignmentTurnedIn title='Has assigments'/>
                  </IconContext.Provider> :
                  <IconContext.Provider value={{ className: "text-gray-400" }}>
                  <MdAssignmentTurnedIn title='No assigments' />
               </IconContext.Provider>}
                  <button onClick={() => handleDeleteExam(exam.id)}>
                    <IconContext.Provider value={{ className: "text-xl text-red-400 mr-4 hover:text-red-800 " }}>
                      <TiDelete />
                    </IconContext.Provider>
                  </button>
                  
                </div>
              </li>
            ))}
          </ul>
        )}

        {showClassSelection && (
          <div className='fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center'>
            <div className='bg-white p-6 rounded-md w-1/3'>
            <div className='flex justify-between mb-4'>
              <h2 className='text-xl font-bold  text-gray-900'>Select a Class</h2>
              <button 
                onClick={() => setShowClassSelection(null)} 
                className=' text-red-500 text-xl hover:underline'>
                <TiCancel />
              </button>
            </div>
              <ul>
                {classes.map((cls) => (
                  <li key={cls.id} className='mb-2'>
                    <button 
                      onClick={() => handleAssignExam(showClassSelection, cls.id)} 
                      className='text-gray-500 hover:text-gray-800 hover:font-bold'
                    >
                      {cls.name}
                    </button>
                  </li>
                ))}
              </ul>
              
            </div>
          </div>
        )}

        {view === 'questions' && <QuestionsBankView user={user} />}

        {view === 'examPreview' && (
          <ExamPreview 
            title={examPreview.title} 
            description={examPreview.description} 
            selectedQuestions={examPreview.questions} 
            assignedTo={examPreview.assignedTo}
          />
        )}
      </main>
    </div>
  );
}
