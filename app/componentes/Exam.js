import React, { useState, useEffect } from 'react';
import { collection, getDoc, doc, updateDoc, setDoc, arrayRemove } from 'firebase/firestore';
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

  const [examDocId, setExamDocId] = useState(null);
  const [showEndScreen, setShowEndScreen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const examRef = doc(db, 'examenes_creados', exam.id);
        const examSnapshot = await getDoc(examRef);

        if (examSnapshot.exists()) {
          const questionsArray = examSnapshot.data().questions || [];
          setQuestions(shuffleArray(questionsArray));
          setStartTime(Date.now());
        } else {
          console.error('No se encontró el examen con el id especificado.');
        }
      } catch (error) {
        console.error('Error fetching exam questions:', error);
      }
    };

    fetchQuestions();
  }, [exam]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const createExamDoc = async () => {
      try {
        const docRef = doc(collection(db, 'examenes_realizados'));
        const initialData = {
          studentEmail: user?.email ?? 'no-email@example.com',
          studentName: user?.displayName ?? 'Unknown Student',
          examId: exam?.id ?? 'unknown-exam-id',
          examTitle: exam?.title ?? 'Untitled Exam',
          professor: exam?.createdBy ?? 'Unknown Professor',
          responses: [],
          startTime: new Date().toISOString(),
          completed: false,
          warnings: 0,
          isReviwed: false,
        };

        await setDoc(docRef, initialData);
        setExamDocId(docRef.id);
      } catch (error) {
        console.error('Error creando el documento de examen:', error);
      }
    };

    if (startTime && user && exam) {
      createExamDoc();
    }
  }, [startTime, user, exam]);

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !examDocId) return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const newResponse = {
      question: currentQuestion,
      answer: answer,
      timeTaken: timeTaken,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    try {
      const examDocRef = doc(db, 'examenes_realizados', examDocId);
      await updateDoc(examDocRef, {
        responses: updatedResponses,
      });
      console.log(`Documento actualizado con ID: ${examDocId}`);
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
    }

    setAnswer('');

    // Remover la pregunta actual del estado de preguntas
    const remainingQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
    setQuestions(remainingQuestions);

    if (remainingQuestions.length > 0) {
      setCurrentQuestionIndex(0); // Reiniciar índice a la siguiente pregunta
    } else {
      handleFinishExam(); // Finalizar examen si no quedan preguntas
    }
  };

  const handleFinishExam = async () => {
    if (!examDocId) return;

    const totalTimeTaken = (Date.now() - startTime) / 1000;

    try {
      const examDocRef = doc(db, 'examenes_realizados', examDocId);
      await updateDoc(examDocRef, {
        endTime: new Date().toISOString(),
        totalTimeTaken: totalTimeTaken,
        completed: true,
      });

      // Actualizar el documento "examenes_creados"
      const examCreatedRef = doc(db, 'examenes_creados', exam.id);
      await updateDoc(examCreatedRef, {
        assignedTo: arrayRemove(user?.email),
      });

      console.log('Exam finished successfully');
    } catch (error) {
      console.error('Error finishing exam:', error);
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }

    setShowEndScreen(true);
    setTimeout(() => {
      setShowEndScreen(false);
      onFinish();
    }, 5000);
  };

  const handleWindowBlur = async () => {
    if (!examDocId) return;

    alert('Por favor, regrese a la pantalla del examen. Cambiar de ventana se registrará.');
    const newWarnings = warningCount + 1;
    setWarningCount(newWarnings);

    try {
      const examDocRef = doc(db, 'examenes_realizados', examDocId);
      await updateDoc(examDocRef, {
        warnings: newWarnings,
      });
    } catch (error) {
      console.error('Error updating warnings:', error);
    }
  };

  const handlePasteRestriction = (e) => {
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      alert('No se permite pegar texto durante el examen.');
    }
  };

  useEffect(() => {
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handlePasteRestriction);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handlePasteRestriction);
    };
  }, []);

  if (showEndScreen) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-green-100">
        <p className="text-2xl font-bold text-green-800">Examen finalizado. Gracias por participar.</p>
      </div>
    );
  }

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
        <p className="text-gray-800 mb-4">{currentQuestion}</p>
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
