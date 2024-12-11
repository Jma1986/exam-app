import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase_auth.js';

export default function ExamReview({ user, exam, handleView }) {
  const [grades, setGrades] = useState({});


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
    return (totalGrade / exam.responses.length).toFixed(1);
  };

  const handleSubmitReview = async () => {

    try {
      const evaluatedData = {
        ...exam,
        grades,
        totalGrade: calculateTotalGrade(),
        reviewedBy: user.email,
        reviewedAt: new Date(),
        isReviwed: true,
      };
    
      await setDoc(doc(db, 'examenes_realizados', exam.id), evaluatedData, { merge: true });
      alert('Review submitted successfully');
      handleView('reviewPending');
    } catch (error) {
      console.error('Error submitting review:', error);
    }


  };
  return (
    <div className="w-full min-h-screen flex flex-col">
      <main className="flex-grow p-6">
          <div className="bg-white p-6 shadow-md rounded">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-800">{exam.examTitle}</h2>
              <div className="text-red-600 text-2xl font-bold">
                Nota: {calculateTotalGrade()}
              </div>
            </div>
            <p className="text-gray-700 mt-4">Descripción: {exam.description}</p>
            <p className="text-gray-700">Alumno: {exam.studentName}</p>
            <p className="text-gray-700">Fecha del examen: {new Date(exam.startTime.seconds * 1000).toLocaleDateString()}</p>
            <p className="text-gray-700">Hora de inicio: {new Date(exam.startTime.seconds * 1000).toLocaleTimeString()}</p>
            <p className="text-gray-700">Hora de fin: {new Date(exam.endTime.seconds * 1000).toLocaleTimeString()}</p>
            <p className="text-gray-700">Tiempo total: {((exam.endTime.seconds - exam.startTime.seconds) / 60).toFixed(0)} minutos</p>

            <div className="mt-6">
              {exam.responses.map((response, index) => (
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
      </main>
    </div>
  );
}
