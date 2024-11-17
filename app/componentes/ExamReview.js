import React from 'react';

export default function ExamReview({ exam }) {
return (
    <div className="w-full min-h-screen p-8">
        <h2 className="text-2xl text-gray-900 font-bold mb-6 text-center">{exam.examTitle}</h2>
        <div className="bg-white p-6 shadow-md rounded mb-8">
            <p className="text-gray-800 mb-4"><strong>Fecha de inicio:</strong> {new Date(exam.startTime.seconds * 1000).toLocaleString()}</p>
            <p className="text-gray-800 mb-4"><strong>Tiempo total del examen:</strong> {Math.floor(exam.totalTimeTaken / 60)} minutos y {(exam.totalTimeTaken % 60).toFixed(0)} segundos</p>
        </div>

        <div className="bg-gray-50 p-6 shadow-md rounded">
            <h3 className="text-xl font-bold mb-4">Preguntas y Respuestas:</h3>
            {exam.responses.map((response, index) => (
                <div key={index} className="mb-6">
                    <p className="text-gray-900 font-semibold mb-2">Pregunta {index + 1}: {response.question}</p>
                    <p className="text-gray-800 mb-2"><strong>Respuesta:</strong> {response.answer}</p>
                    <p className="text-gray-600 text-sm">Tiempo de respuesta: {Math.floor(response.timeTaken / 60)} minutos y {(response.timeTaken % 60).toFixed(0)} segundos</p>
                </div>
            ))}
        </div>
    </div>
);
}
