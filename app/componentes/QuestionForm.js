import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase_auth.js";
import CsvUpload from './csvUpload.js';

export default function QuestionForm({user, ...rest}) {
  const [questions, setQuestions] = useState([{ question: '', response: '' }]);
  const [field, setField] = useState('');
  const [newFieldVisible, setNewFieldVisible] = useState(false);
  const [newField, setNewField] = useState('');
  const [subject, setSubject] = useState('');
  const [newSubjectVisible, setNewSubjectVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [fieldOptions, setFieldOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  // Fetch existing fields and subjects from the database on component mount
  useEffect(() => {
    const fetchFieldsAndSubjects = async () => {
      try {
        const questionsSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
        const fieldsSet = new Set();
        const subjectsSet = new Set();

        questionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdBy === user?.email) { // Filtrar por usuario actual
            fieldsSet.add(data.field);
            subjectsSet.add(data.subject);
          }
        });

        setFieldOptions(Array.from(fieldsSet));
        setSubjectOptions(Array.from(subjectsSet));
      } catch (error) {
        console.error('Error fetching fields and subjects:', error);
      }
    };

    fetchFieldsAndSubjects();
  }, [user]);

  const handleQuestionChange = (index, key, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][key] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestionField = () => {
    setQuestions([...questions, { question: '', response: '' }]);
  };

  const removeLastQuestionField = () => {
    if (questions.length > 1) {
      setQuestions(questions.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedField = newFieldVisible ? newField : field;
    const selectedSubject = newSubjectVisible ? newSubject : subject;

    try {
      const questionsCollection = collection(db, "Banco de preguntas");
      for (let q of questions) {
        await addDoc(questionsCollection, {
          field: selectedField,
          subject: selectedSubject || null,
          question: q.question,
          response: q.response || null,
          createdBy: user.email,
          isPublic: false
        });
      }
      console.log("Questions added successfully");
      // Reset form
      setQuestions([{ question: '', response: '' }]);
      setField('');
      setNewField('');
      setNewFieldVisible(false);
      setSubject('');
      setNewSubject('');
      setNewSubjectVisible(false);
    } catch (error) {
      console.error("Error adding questions: ", error);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row">
      <form className="p-4 space-y-6 bg-white shadow-md rounded-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-900">Añadir preguntas manualmente</h2>
        <div className="flex flex-col space-y-3">
          <label className="font-semibold text-gray-700">Departamento o materia</label>
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setNewFieldVisible(e.target.value === 'create-new');
            }}
            className="p-3 text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
            required
          >
            <option value="">Selecciona</option>
            {fieldOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="create-new">+ Crear nuevo</option>
          </select>
          {newFieldVisible && (
            <input
              type="text"
              placeholder="Enter new field"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              className="p-3  text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500"
              required
            />
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <label className="font-semibold text-gray-700">Tema o proyecto (Optional)</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setNewSubjectVisible(e.target.value === 'create-new');
            }}
            className="p-3  text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="">Selecciona</option>
            {subjectOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="create-new">+ Crear nuevo</option>
          </select>
          {newSubjectVisible && (
            <input
              type="text"
              placeholder="Enter new subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="p-3  text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500"
            />
          )}
        </div>

        {questions.map((q, index) => (
          <div key={index} className="flex flex-col space-y-3 border-b pb-4 mb-4">
            <label className="font-semibold text-gray-700">Pregunta {index + 1}</label>
            <textarea
              value={q.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="p-3  text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500"
              placeholder="Escribe la pregunta aquí..."
              required
            />
            <textarea
              value={q.response}
              onChange={(e) => handleQuestionChange(index, 'response', e.target.value)}
              className="p-3  text-gray-500 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500"
              placeholder="Escríbe la respuesta aquí..."
            />
          </div>
        ))}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={addQuestionField}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition-all ease-in-out"
          >
            + Añadir pregunta
          </button>

          <button
            type="button"
            onClick={removeLastQuestionField}
            className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition-all ease-in-out"
          >
            Eliminar ultimo
          </button>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-all ease-in-out"
          >
            Enviar preguntas
          </button>
        </div>
      </form>
      <div className="w-full md:w-1/3 pl-0 md:ml-12  md:pt-3 p4 space-y-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold pl-4 mt-4 text-gray-900">Subir archivo .csv</h2>
        <CsvUpload user={user} />
      </div>
    </div>
  );
}
