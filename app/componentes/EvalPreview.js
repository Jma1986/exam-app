import React from 'react';

export default function EvalPreview({ exam }) {
  return (
    <div className="w-full min-h-screen flex flex-col p-6 ">
      <div className="flex justify-between mb-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 capitalize">{exam.examTitle}</h2>
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Nota: {exam?.totalGrade}</h2>
      </div>
      <p className="text-gray-800 mb-4"><span className='font-semibold'>Student:</span> {exam.studentName}</p>
      <p className="text-gray-800 mb-4"><span className='font-semibold'>Total time:</span> {exam.totalTimeTaken} segundos</p>
      <p className="text-gray-800 mb-4"><span className='font-semibold'>Warnings:</span> {exam.warnings}</p>
      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4"><span className='font-semibold'>Answers:</span></h3>
      <ul className="space-y-2">
        {exam.responses.map((response, index) => (
          <li key={index} className="p-4 bg-gray-100 hover:bg-gray-200 rounded text-gray-900">
            <div className="flex justify-between mb-2">
            <p className="text-lg  text-gray-900 mb-2"><span className='font-semibold'>Question:</span> {response.question}</p>
            <p className="text-blue-900 mb-2 mr-4 ml-10 text-xl font-bold">{exam?.grades?.[index]?.grade}</p>
            </div>
            <p className="text-gray-800 mb-2"><span className='font-semibold'>Answer:</span> {response.answer}</p>
            <p className="text-gray-800 mb-2"><span className='font-semibold'>Answer time:</span> {response.timeTaken} s</p>
            <p className="text-gray-800 mb-2 mt-6"><span className='font-semibold'>Feedback:</span> {exam?.grades?.[index]?.feedback}</p>
            
          </li>
        ))}
      </ul>
    </div>
  );
}