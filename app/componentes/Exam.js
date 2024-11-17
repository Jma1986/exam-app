import React, { useState, useEffect } from 'react';
import { collection, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase_auth.js';

export default function Exam({ exam, user, onFinish }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (exam && exam.questions) {
        try {
          const questionsPromises = exam.questions.map(async (questionId) => {
            const questionDoc = await getDoc(doc(db, 'Banco de preguntas', questionId));
            return { id: questionId, ...questionDoc.data() };
          });
          const fetchedQuestions = await Promise.all(questionsPromises);
          setQuestions(shuffleArray(fetchedQuestions));
          setCurrentQuestionIndex(0);
          setStartTime(Date.now());
        } catch (error) {
          console.error('Error fetching questions: ', error);
        }
      }
    };

    fetchQuestions();
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handlePasteRestriction);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handlePasteRestriction);
    };
  }, [exam]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, questions]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const newResponse = {
      question: currentQuestion.question,
      answer: answer,
      timeTaken: timeTaken,
    };

    setResponses((prevResponses) => [...prevResponses, newResponse]);

    try {
      const examDocRef = doc(db, 'examenes_realizados', exam.id + '_' + user.email);
      const examDoc = await getDoc(examDocRef);
      if (!examDoc.exists()) {
        // Crear un nuevo documento de examen si no existe
        await setDoc(examDocRef, {
          studentEmail: user?.email,
          examId: exam.id,
          examTitle: exam.title,
          professor: exam.createdBy,
          responses: [newResponse],
          startTime: new Date(startTime),
          completed: false,
          warnings: warningCount,
        });
      } else {
        // Actualizar el documento de examen existente
        await updateDoc(examDocRef, {
          responses: [...examDoc.data().responses, newResponse],
        });
      }
    } catch (error) {
      console.error('Error saving response: ', error);
    }

    setAnswer('');
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleFinishExam = async () => {
    const totalTimeTaken = (Date.now() - startTime) / 1000;

    try {
      const examDocRef = doc(db, 'examenes_realizados', exam.id + '_' + user.email);
      await updateDoc(examDocRef, {
        endTime: new Date(),
        totalTimeTaken: totalTimeTaken,
        studentEmail: user?.email,
        completed: true,
      });
      console.log('Exam finished successfully');
    } catch (error) {
      console.error('Error finishing exam: ', error);
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }

    onFinish();
  };

  const handleWindowBlur = async () => {
    alert('Por favor, regrese a la pantalla del examen. Cambiar de ventana se registrará.');
    setWarningCount((prev) => prev + 1);
    try {
      const examDocRef = doc(db, 'examenes_realizados', exam.id + '_' + user.email);
      await updateDoc(examDocRef, {
        warnings: warningCount + 1,
      });
    } catch (error) {
      console.error('Error updating warnings: ', error);
    }
  };

  const handlePasteRestriction = (e) => {
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      alert('No se permite pegar texto durante el examen.');
    }
  };

  if (!currentQuestion) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-xl text-gray-800">Cargando pregunta...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col p-6">
      <button
        className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out self-end"
        onClick={handleFinishExam}
      >
        Finalizar prueba
      </button>
      <div className="flex-grow flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Pregunta:</h2>
        <p className="text-gray-800 mb-4">{currentQuestion.question}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full max-w-lg p-2 border rounded mb-4"
          placeholder="Escribe tu respuesta aquí..."
          rows="4"
        />
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out"
          onClick={handleSubmitAnswer}
        >
          Enviar respuesta
        </button>
      </div>
    </div>
  );
}
