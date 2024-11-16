import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase_auth.js";

export default function QuestionForm() {
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
      const questionsSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
      const fieldsSet = new Set();
      const subjectsSet = new Set();

      questionsSnapshot.forEach((doc) => {
        fieldsSet.add(doc.data().field);
        subjectsSet.add(doc.data().subject);
      });

      setFieldOptions(Array.from(fieldsSet));
      setSubjectOptions(Array.from(subjectsSet));
    };

    fetchFieldsAndSubjects();
  }, []);

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
          response: q.response || null
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
    <form className="p-4 space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-2">
        <label>Field of Knowledge (Select or Create New)</label>
        <select
          value={field}
          onChange={(e) => {
            setField(e.target.value);
            setNewFieldVisible(e.target.value === 'create-new');
          }}
          className="p-2 border rounded"
          required
        >
          <option value="">Select a Field</option>
          {fieldOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
          <option value="create-new">Create New Field</option>
        </select>
        {newFieldVisible && (
          <input
            type="text"
            placeholder="Enter new field"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            className="p-2 border rounded"
            required
          />
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label>Subject (Optional)</label>
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setNewSubjectVisible(e.target.value === 'create-new');
          }}
          className="p-2 border rounded"
        >
          <option value="">Select a Subject</option>
          {subjectOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
          <option value="create-new">Create New Subject</option>
        </select>
        {newSubjectVisible && (
          <input
            type="text"
            placeholder="Enter new subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="p-2 border rounded"
          />
        )}
      </div>

      {questions.map((q, index) => (
        <div key={index} className="flex flex-col space-y-2 border-b pb-4 mb-4">
          <label>Question {index + 1}</label>
          <textarea
            value={q.question}
            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
            className="p-2 border rounded"
            placeholder="Enter the question"
            required
          />
          <textarea
            value={q.response}
            onChange={(e) => handleQuestionChange(index, 'response', e.target.value)}
            className="p-2 border rounded"
            placeholder="Optional response"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestionField}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all ease-in-out"
      >
        Add Another Question
      </button>

      <button
        type="button"
        onClick={removeLastQuestionField}
        className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition-all ease-in-out"
      >
        Remove Last Question
      </button>

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 transition-all ease-in-out"
      >
        Submit Questions
      </button>
    </form>
  );
}
