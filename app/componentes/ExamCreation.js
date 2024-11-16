import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth.js';
import ExamPreview from './ExamPreview';

export default function ExamCreation({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [availableFields, setAvailableFields] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [fieldFilter, setFieldFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  // Fetch available classes created by the current professor
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'clases'));
        const classes = classSnapshot.docs
          .filter(doc => doc.data().professor === user?.email)
          .map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(classes);
        setAvailableClasses(classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, [user]);

  // Fetch available questions from the database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
        const fetchedQuestions = questionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(fetchedQuestions);

        // Extract unique fields and subjects from questions
        const fields = [...new Set(fetchedQuestions.map(q => q.field))];
        const subjects = [...new Set(fetchedQuestions.map(q => q.subject))];
        setAvailableFields(fields);
        setAvailableSubjects(subjects);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  // Handle selecting/deselecting questions
  const toggleQuestionSelection = (question) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // Handle creating a new exam
  const handleCreateExam = async () => {
    // Validate inputs
    if (!title) {
      setMessage('Please provide an exam title.');
      return;
    }
    if (!selectedClass) {
      setMessage('Please select a class to assign the exam to.');
      return;
    }
    if (selectedQuestions.length === 0) {
      setMessage('Please select at least one question for the exam.');
      return;
    }

    // Add exam to the database
    try {
      await addDoc(collection(db, 'examenes_creados'), {
        title,
        description,
        class: selectedClass,
        questions: selectedQuestions.map(q => q.id),
        createdBy: user?.email,
      });
      setMessage('Exam created successfully!');
      setTitle('');
      setDescription('');
      setSelectedClass('');
      setSelectedQuestions([]);
    } catch (error) {
      setMessage(`Error creating exam: ${error.message}`);
    }
  };

  // Filter questions by field and subject
  const filteredQuestions = questions.filter((question) => {
    return (
      (fieldFilter === '' || question.field === fieldFilter) &&
      (subjectFilter === '' || question.subject === subjectFilter)
    );
  });

  // Pagination logic for questions
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

  // Filter questions by field and subject
useEffect(() => {
    setCurrentPage(0); // Reset page when filters change
  }, [fieldFilter, subjectFilter]);
  
  return (
    <div className="flex space-x-4">
    <div className="w-full max-w-lg p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create a New Exam</h2>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Exam Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
          placeholder="Enter exam title"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
          placeholder="Enter exam description"
          rows="3"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Assign to Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
        >
          <option value="">Select a class</option>
          {availableClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Filter Questions by Field</label>
        <select
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
        >
          <option value="">Select a field</option>
          {availableFields.map((field, index) => (
            <option key={index} value={field}>{field}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Filter Questions by Subject</label>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full p-2 border rounded text-gray-700"
        >
          <option value="">Select a subject</option>
          {availableSubjects.map((subject, index) => (
            <option key={index} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-900 text-sm font-bold mb-2">Select Questions</label>
        <div className="space-y-2">
          {paginatedQuestions.map((question) => (
            <button
              key={question.id}
              className={`w-full text-left p-2 border rounded text-gray-800 ${selectedQuestions.includes(question) ? 'bg-green-200' : 'bg-gray-100'}`}
              onClick={() => toggleQuestionSelection(question)}
            >
              {question.question}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-10">
          <button
            onClick={handlePreviousPage}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out"
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-md">{currentPage}</div>
          <button
            onClick={handleNextPage}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out"
            disabled={(currentPage + 1) * questionsPerPage >= filteredQuestions.length}
          >
            Next
          </button>
        </div>
      </div>
      <button
        onClick={handleCreateExam}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out mt-4"
      >
        Create Exam
      </button>
    </div>
          <ExamPreview title={title} description={description} selectedClass={selectedClass} selectedQuestions={selectedQuestions} />
    </div>
  );
}