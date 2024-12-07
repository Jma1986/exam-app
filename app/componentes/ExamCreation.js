import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth.js';
import ExamPreview from './ExamPreview';

export default function ExamCreation({ user }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [message, setMessage] = useState('');
    const [availableFields, setAvailableFields] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [fieldFilter, setFieldFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isPublic, setIsPublic] = useState(false); // Nuevo estado para controlar si el examen es público o privado
    const questionsPerPage = 5;


    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const questionSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
                const fetchedQuestions = questionSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(question => question.createdBy === user?.email); // Filtrar por usuario actual
    
                setQuestions(fetchedQuestions);
    
                const fields = [...new Set(fetchedQuestions.map(q => q.field))];
                const subjects = [...new Set(fetchedQuestions.map(q => q.subject))];
                setAvailableFields(fields);
                setAvailableSubjects(subjects);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, [user]);
    

    const toggleQuestionSelection = (question) => {
        if (selectedQuestions.includes(question)) {
            setSelectedQuestions(selectedQuestions.filter(q => q !== question));
        } else {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    const handleCreateExam = async () => {
        if (!title) {
            setMessage('Please provide an exam title.');
            return;
        }
        if (selectedQuestions.length === 0) {
            setMessage('Please select at least one question for the exam.');
            return;
        }

        try {
            await addDoc(collection(db, 'examenes_creados'), {
                title,
                description,
                questions: selectedQuestions.map(q => q.question),
                createdBy: user?.email,
                state: "unasigned",
                isPublic, // Guardar el estado de si el examen es público o privado
            });
            setMessage('Exam created successfully!');
            setTitle('');
            setDescription('');
            setSelectedQuestions([]);
            setIsPublic(false); // Restablecer a privado como predeterminado
        } catch (error) {
            setMessage(`Error creating exam: ${error.message}`);
        }
    };

    const filteredQuestions = questions.filter((question) => {
        return (
            (fieldFilter === '' || question.field === fieldFilter) &&
            (subjectFilter === '' || question.subject === subjectFilter)
        );
    });

    const paginatedQuestions = filteredQuestions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    );

    const handleNextPage = () => {
        if ((currentPage + 1) * questionsPerPage < filteredQuestions.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        setCurrentPage(0);
    }, [fieldFilter, subjectFilter]);

    return (
        <div className="flex flex-grow flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-2/3 p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Create a New Exam</h2>
                {message && <div className="mb-4 text-red-600 font-semibold">{message}</div>}
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Exam Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter exam title"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter exam description"
                        rows="3"
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Filter Questions by Field</label>
                    <select
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                        className="w-full p-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a field</option>
                        {availableFields.map((field, index) => (
                            <option key={index} value={field}>{field}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Filter Questions by Subject</label>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full p-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a subject</option>
                        {availableSubjects.map((subject, index) => (
                            <option key={index} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Select Questions</label>
                    <div className="space-y-2">
                        {paginatedQuestions.map((question) => (
                            <button
                                key={question.id}
                                className={`w-full text-left p-3 border rounded-lg text-gray-900 ${selectedQuestions.includes(question) ? 'bg-green-200' : 'bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                onClick={() => toggleQuestionSelection(question)}
                            >
                                {question.question}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handlePreviousPage}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all ease-in-out disabled:opacity-50"
                            disabled={currentPage === 0}
                        >
                            Previous
                        </button>
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md">{currentPage + 1}</div>
                        <button
                            onClick={handleNextPage}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all ease-in-out disabled:opacity-50"
                            disabled={(currentPage + 1) * questionsPerPage >= filteredQuestions.length}
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-900 text-sm font-semibold mb-2">Exam Visibility</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsPublic(false)}
                            className={`px-4 py-2 rounded-lg shadow-md ${!isPublic ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-900'} transition-all ease-in-out`}
                        >
                            Private
                        </button>
                        <button
                            onClick={() => setIsPublic(true)}
                            className={`px-4 py-2 rounded-lg shadow-md ${isPublic ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-900'} transition-all ease-in-out`}
                        >
                            Public
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleCreateExam}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all ease-in-out mt-6"
                >
                    Create Exam
                </button>
            </div>
            <ExamPreview title={title} description={description} selectedClass={selectedClass} selectedQuestions={selectedQuestions} />
        </div>
    );
}
