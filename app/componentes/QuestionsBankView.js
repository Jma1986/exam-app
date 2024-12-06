import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase_auth.js";

export default function QuestionsBankView({user, ...rest}) {
  const [questionsBank, setQuestionsBank] = useState({});
  const [fieldFilter, setFieldFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [fields, setFields] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Banco de preguntas"));
        const questions = {};
        const fieldsSet = new Set();
        const subjectsSet = new Set();

        querySnapshot.docs
        .filter(doc => doc.data().createdBy === user?.email)
        .forEach((doc) => {
          const { field, subject, question } = doc.data();
          fieldsSet.add(field);
          if (subject) subjectsSet.add(subject);
          const groupKey = field ? `${field}${subject ? ` - ${subject}` : ''}` : 'Uncategorized';

          if (!questions[groupKey]) {
            questions[groupKey] = [];
          }

          questions[groupKey].push(question);
        });

        setQuestionsBank(questions);
        setFields(Array.from(fieldsSet));
        setSubjects(Array.from(subjectsSet));
      } catch (error) {
        console.error("Error fetching questions: ", error);
      }
    };

    fetchQuestions();
  }, []);

  const filteredQuestionsBank = Object.entries(questionsBank).reduce((acc, [groupKey, questions]) => {
    if (
      (fieldFilter && !groupKey.includes(fieldFilter)) ||
      (subjectFilter && !groupKey.includes(subjectFilter))
    ) {
      return acc;
    }
    acc[groupKey] = questions;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-4 space-y-2">
        <div>
          <label className="block text-gray-700">Filter by Field:</label>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">All Fields</option>
            {fields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Filter by Subject:</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>
      {Object.keys(filteredQuestionsBank).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(filteredQuestionsBank).map(([groupKey, questions]) => (
            <div key={groupKey} className="bg-white p-4 shadow-md rounded">
              <h2 className="font-bold text-lg mb-2 text-gray-900">{groupKey}</h2>
              <ul className="list-disc pl-6 space-y-1">
                {questions.map((question, index) => (
                  <li key={index} className="text-gray-900">{question}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-900">No questions found in the bank.</p>
      )}
    </div>
  );
}
