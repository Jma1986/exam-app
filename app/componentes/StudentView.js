import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase_auth.js";

export default function StudentView({ user, onSignOut }) {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [examDocRef, setExamDocRef] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [responses, setResponses] = useState([]);

  // Function to start the exam
  const handleStartExam = () => {
    setExamStarted(true);
    setStartTime(Date.now());
    fetchRandomQuestion();
  };

  // Function to fetch a random question from the database
  const fetchRandomQuestion = async () => {
    try {
      const questionsSnapshot = await getDocs(collection(db, "Banco de preguntas"));
      const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Error fetching random question: ", error);
    }
  };

  // Function to handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const timeTaken = Date.now() - questionStartTime;
    const newResponse = {
      question: currentQuestion.question,
      answer: answer,
      timeTaken: timeTaken,
    };

    setResponses((prevResponses) => [...prevResponses, newResponse]);

    try {
      if (!examDocRef) {
        // Create a new exam document if it doesn't exist
        const docRef = await addDoc(collection(db, "examenes"), {
          studentName: user.displayName,
          responses: [newResponse],
          startTime: new Date(startTime),
        });
        setExamDocRef(docRef);
      } else {
        // Update the existing exam document
        await updateDoc(examDocRef, {
          responses: [...responses, newResponse],
        });
      }
    } catch (error) {
      console.error("Error saving response: ", error);
    }

    // Clear the answer and fetch a new question
    setAnswer('');
    fetchRandomQuestion();
  };

  // Function to handle finishing the exam
  const handleFinishExam = async () => {
    if (!examDocRef) return;

    const totalTimeTaken = Date.now() - startTime;

    try {
      await updateDoc(examDocRef, {
        endTime: new Date(),
        totalTimeTaken: totalTimeTaken,
      });
      console.log("Exam finished successfully");
    } catch (error) {
      console.error("Error finishing exam: ", error);
    }

    // Reset state
    setExamStarted(false);
    setCurrentQuestion(null);
    setAnswer('');
    setExamDocRef(null);
    setStartTime(null);
    setQuestionStartTime(null);
    setResponses([]);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-blue-600 text-gray-900 p-4 flex items-center justify-between">
        <span>{user?.displayName}</span>
        <button
          id="sign-out-btn"
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
          onClick={onSignOut}
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-grow items-center justify-center p-6">
        {!examStarted ? (
          <button
            className="bg-green-500 text-white px-6 py-3 rounded shadow-md hover:bg-green-600 transition-all ease-in-out"
            onClick={handleStartExam}
          >
            Comenzar prueba
          </button>
        ) : (
          <div className="w-full max-w-lg p-4 border rounded shadow-md bg-white">
            {currentQuestion && (
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Pregunta:</h2>
                <p className="text-gray-800 mb-4">{currentQuestion.question}</p>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  placeholder="Escribe tu respuesta aquí..."
                  rows="4"
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out mr-2"
                  onClick={handleSubmitAnswer}
                >
                  Enviar respuesta
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out fixed bottom-4 right-4" onClick={handleFinishExam}
                >
                  Finalizar prueba
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
