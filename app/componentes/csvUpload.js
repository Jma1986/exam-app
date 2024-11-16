// Import necessary dependencies
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth';

function CsvUpload() {
  const [fields, setFields] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [field, setField] = useState('');
  const [subject, setSubject] = useState('');
  const [newField, setNewField] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const fetchFieldsAndSubjects = async () => {
      const questionsSnapshot = await getDocs(collection(db, 'Banco de preguntas'));
      const fieldsSet = new Set();
      const subjectsSet = new Set();

      questionsSnapshot.forEach((doc) => {
        fieldsSet.add(doc.data().field);
        subjectsSet.add(doc.data().subject);
      });

      setFields(Array.from(fieldsSet));
      setSubjects(Array.from(subjectsSet));
    };

    fetchFieldsAndSubjects();
  }, []);

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target.result;
        processCsvData(csvContent);
      };
      reader.readAsText(file);
    }
  };

  const processCsvData = (csvContent) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;

        if (!data.length || !data[0].Pregunta) {
          setUploadStatus('Error: CSV must contain "pregunta" column.');
          return;
        }

        setCsvData(data);
        setUploadStatus(`${data.length} questions ready to be uploaded.`);
      },
      error: (error) => {
        setUploadStatus('Error parsing CSV file.');
        console.error('CSV Parse Error:', error);
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!field) {
      setUploadStatus('Error: Field is required.');
      return;
    }

    let successfulUploads = 0;
    for (const entry of csvData) {
      if (entry.Pregunta) {
        try {
          await addDoc(collection(db, 'Banco de preguntas'), {
            field: newField || field,
            subject: newSubject || subject,
            question: entry.Pregunta,
            response: entry.Respuesta || '',
          });
          successfulUploads++;
        } catch (error) {
          console.error('Error adding document: ', error);
        }
      }
    }

    setUploadStatus(`${successfulUploads} questions uploaded successfully.`);
  };

return (
    <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-800">Materia:</label>
                <select className="block w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700" value={field} onChange={(e) => setField(e.target.value)} required>
                    <option value="">Elige una materia</option>
                    {fields.map((f, index) => (
                        <option key={index} value={f}>{f}</option>
                    ))}
                    <option value="new">Añade una nueva materia</option>
                </select>
                {field === 'new' && (
                    <input type="text" placeholder="New Field" value={newField} onChange={(e) => { setNewField(e.target.value); setField('new'); }} className="block w-full mt-2 p-2 border border-gray-300 rounded-md" />
                )}
            </div>
            
            <div>
                <label className="block text-gray-800">Tema:</label>
                <select className="block w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Elige un tema</option>
                    {subjects.map((s, index) => (
                        <option key={index} value={s}>{s}</option>
                    ))}
                    <option value="new">añade un nuevo tema</option>
                </select>
                {subject === 'new' && (
                    <input type="text" placeholder="New Subject" value={newSubject} onChange={(e) => { setNewSubject(e.target.value); setSubject('new'); }} className="block w-full mt-2 p-2 border border-gray-300 rounded-md" />
                )}
            </div>
            
            <div>
                <label className="block text-gray-800">Sube un archivo .csv:</label>
                <input className="block w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-700" type="file" accept=".csv" onChange={handleCsvUpload} />
            </div>
            
            <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                Submit
            </button>
            
            {uploadStatus && <div className="mt-4 text-gray-800">{uploadStatus}</div>}
        </form>
    </div>
);
}

export default CsvUpload;
