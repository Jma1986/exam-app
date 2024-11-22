import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase_auth.js';

export default function ExamReview({ user }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [grades, setGrades] = useState({});

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

  const fetchExams = async (classId) => {
    try {
      const examSnapshot = await getDocs(collection(db, 'examenes_realizados'));
      const classExams = examSnapshot.docs
        .filter(doc => doc.data().classId === classId)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(classExams);
      setSelectedClass(classId);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchStudentExam = async (examId) => {
    try {
      const examDoc = exams.find(exam => exam.id === examId);
      setReviewData(examDoc);
      setSelectedExam(examId);
      setGrades(examDoc.responses.reduce((acc, response, index) => {
        acc[index] = { grade: 0, feedback: '' };
        return acc;
      }, {}));
    } catch (error) {
      console.error('Error fetching student exam:', error);
    }
  };

  const handleGradeChange = (questionIndex, value) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [questionIndex]: {
        ...prevGrades[questionIndex],
        grade: parseFloat(value)
      }
    }));
  };

  const handleFeedbackChange = (questionIndex, value) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [questionIndex]: {
        ...prevGrades[questionIndex],
        feedback: value
      }
    }));
  };

  const calculateTotalGrade = () => {
    const totalGrade = Object.values(grades).reduce((sum, { grade }) => sum + grade, 0);
    return (totalGrade / reviewData.responses.length).toFixed(1);
  };

  const handleSubmitReview = async () => {
    try {
      const evaluatedData = {
        ...reviewData,
        grades,
        totalGrade: calculateTotalGrade(),
        reviewedBy: user.email,
        reviewedAt: new Date(),
      };
      const classKey = selectedClass;
      await setDoc(doc(db, 'examenes_evaluados', classKey), {
        [selectedExam]: evaluatedData
      }, { merge: true });
      await deleteDoc(doc(db, 'examenes_realizados', selectedExam));
      setReviewData(null);
      setSelectedExam(null);
      alert('Exam reviewed successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <main className="flex-grow p-6">
        {!reviewData ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-700">Select Class to Review Exams</h2>
            <ul className="mb-4">
              {classes.map(cls => (
                <li key={cls.id} className="mb-2">
                  <button className="text-blue-600 hover:underline" onClick={() => fetchExams(cls.id)}>{cls.name}</button>
                </li>
              ))}
            </ul>
            {selectedClass && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-700">Exams in {classes.find(cls => cls.id === selectedClass)?.name}</h3>
                <ul>
                  {exams.map(exam => (
                    <li key={exam.id} className="mb-2">
                      <button className="text-blue-600 hover:underline" onClick={() => fetchStudentExam(exam.id)}>
                        {exam.examTitle} - {exam.studentName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 shadow-md rounded">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-800">{reviewData.examTitle}</h2>
              <div className="text-red-600 text-2xl font-bold">
                Nota: {calculateTotalGrade()}
              </div>
            </div>
            <p className="text-gray-700 mt-4">Descripción: {reviewData.description}</p>
            <p className="text-gray-700">Alumno: {students.find(student => student.email === reviewData.studentEmail)?.name || reviewData.studentEmail}</p>
            <p className="text-gray-700">Fecha del examen: {new Date(reviewData.startTime.seconds * 1000).toLocaleDateString()}</p>
            <p className="text-gray-700">Clase: {classes.find(cls => cls.id === reviewData.class)?.name}</p>
            <p className="text-gray-700">Hora de inicio: {new Date(reviewData.startTime.seconds * 1000).toLocaleTimeString()}</p>
            <p className="text-gray-700">Hora de fin: {new Date(reviewData.endTime.seconds * 1000).toLocaleTimeString()}</p>
            <p className="text-gray-700">Tiempo total: {((reviewData.endTime.seconds - reviewData.startTime.seconds) / 60).toFixed(0)} minutos</p>

            <div className="mt-6">
              {reviewData.responses.map((response, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <p className="font-bold text-gray-800">Pregunta {index + 1}: {response.question}</p>
                  <p className="text-gray-700">Respuesta del alumno: {response.answer}</p>
                  <label className="block mt-2 text-gray-700">
                    Nota:
                    <input
                      type="number"
                      value={grades[index]?.grade || ''}
                      onChange={(e) => handleGradeChange(index, e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                      min="0"
                      max="10"
                    />
                  </label>
                  <label className="block mt-2 text-gray-700">
                    Feedback (opcional):
                    <textarea
                      value={grades[index]?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(index, e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitReview}
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out mt-4"
            >
              Finalizar revisión
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
