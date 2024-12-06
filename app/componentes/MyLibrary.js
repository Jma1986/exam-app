import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase_auth';
import LinkButton from './LinkButton';
import { CiFileOn } from "react-icons/ci";
import { IconContext } from "react-icons";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { LuFileQuestion } from "react-icons/lu";
import { TiDocumentDelete, TiDelete } from "react-icons/ti";
import QuestionsBankView from './QuestionsBankView';
import ExamPreview from './ExamPreview';

export default function MyLibrary({ user, handleView, ...rest}) {

    const [examLibrary, setExamLibrary] = useState([]);
    const [examPreview, setExamPreview] = useState({});
    const [view, setView] = useState('exams');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const examSnapshot = await getDocs(collection(db, 'examenes_creados'));
                const classExams = examSnapshot.docs
                    .filter(doc => doc.data().createdBy === user?.email)
                    .map(doc => ({ id: doc.id, ...doc.data() }));
                setExamLibrary(classExams);
            } catch (error) {
                console.error('Error fetching exams:', error);
            }
        };
        fetchExams();   
    }, [user]);

    useEffect(() => {
        console.log(examPreview.questions); 
    }, [examPreview]);

    const handleDeleteExam = async (examId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this exam?");
        if (confirmDelete) {
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

    return (
        <div className='flex flex-grow justify-between '>
            <div className='w-2/12'>
                <h1 className=' font-bold text-gray-900 text-4xl bold mb-10'>My Library</h1>
                <button 
                    onClick={() => handleView('examCreation')}  // Llama a handleView al hacer clic
                    className='font-bold flex gap-2 items-baseline ml-4 border-l-2 border-l-blue-900 px-4 py-2 text-gray-800  mb-4 hover:border-l-4 transition-all ease-in-out'>
                    <BsFileEarmarkPlus />  Add Exams
                </button>

                <button 
                    onClick={() => handleView('createQuestions')}  // Llama a handleView al hacer clic
                    className='font-bold flex gap-2 items-baseline ml-4 border-l-2 border-l-blue-900 px-4 py-2 text-gray-800  mb-4 hover:border-l-4 transition-all ease-in-out'>
                    <LuFileQuestion /> Add questions
                </button>
            </div>
            <div className='w-9/12'>
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <LinkButton isActive={view === 'exams'} onClick={() => setView('exams')}>Exams</LinkButton>
                        <LinkButton isActive={view === 'questions'} onClick={() => setView('questions')}>Questions</LinkButton>
                    </div>
                    <div>
                    </div>
                </div>
                
                {view === 'exams' && ( // Muestra la lista de exámenes si la vista es 'exams'
                    <ul className='mt-6'>
                        {examLibrary.map((exam) => (
                            <div key={exam.id} className='flex pl-4 gap-4 h-14 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold group-hover:block'>
                                <div className='flex items-center gap-4'>
                                    <IconContext.Provider value={{ className: "text-3xl hover:font-bold group-hover:block" }}>
                                        <div>
                                            <CiFileOn />
                                        </div>
                                    </IconContext.Provider>
                                    <li
                                        onClick={() => {
                                            setView("examPreview");
                                            setExamPreview(exam);
                                        }}
                                        className="text-lg cursor-pointer"
                                    >
                                        {exam.title}
                                    </li>
                                </div>
                                <button
                                    onClick={() => handleDeleteExam(exam.id)}
                                >
                                    <IconContext.Provider value={{ className: "text-3xl text-red-400 mr-4 hover:text-red-800 hidden group-hover:block" }}>
                                        <div>
                                        <TiDelete />
                                        </div>
                                    </IconContext.Provider>
                                </button>
                            </div>
                        ))}
                    </ul>
                )}
                {view === 'questions' && ( // Muestra la lista de preguntas si la vista es 'questions'
                    <QuestionsBankView user={user}/>
                )}
                {view === 'examPreview' && (
                    <ExamPreview title={examPreview.title} description={examPreview.description} selectedQuestions={examPreview.questions}/>
                )}
            </div>
        </div>
    );
} 
