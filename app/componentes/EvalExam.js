import React from 'react';

export default function EvalExam({ exam }) {
  return (
    <div className="w-full min-h-screen flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-4">Evaluación del Examen</h2>
      <p className="text-gray-800 mb-4">Nombre del Estudiante: {exam.studentName}</p>
      <p className="text-gray-800 mb-4">Email del Estudiante: {exam.studentEmail}</p>
      <p className="text-gray-800 mb-4">Título del Examen: {exam.examTitle}</p>
      <p className="text-gray-800 mb-4">Tiempo Total: {exam.totalTimeTaken} segundos</p>
      <p className="text-gray-800 mb-4">Advertencias: {exam.warnings}</p>
      <h3 className="text-xl font-bold mb-4">Respuestas:</h3>
      <ul className="space-y-2">
        {exam.responses.map((response, index) => (
          <li key={index} className="p-4 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
            <p className="text-lg font-semibold text-gray-900">Pregunta: {response.question}</p>
            <p className="text-gray-800 mb-2">Respuesta: {response.answer}</p>
            <p className="text-gray-800 mb-2">Tiempo tomado: {response.timeTaken} segundos</p>
          </li>
        ))}
      </ul>
    </div>
  );
}