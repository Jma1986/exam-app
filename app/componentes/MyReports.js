import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth';
import LinkButton from './LinkButton';
import ExamReview from './ExamReview';
import { CiWarning } from "react-icons/ci";
import EvalPreview from './EvalPreview';



export default function MyReports({ user }) {

  const [reports, setReports] = useState([]);
  const [view, setView] = useState('reviewPending');
  const [examReview, setExamReview] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportSnapshot = await getDocs(collection(db, "examenes_realizados"));
        const fetchedReports = reportSnapshot.docs
          .filter((doc) => doc.data().professor === user?.email)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchReports();
  }, [user, view]);

const handleView = (view) => {
  setView(view);
}

  return (
    <div className='flex flex-grow justify-between'>

      <aside className='w-2/12'>
        <h1 className='font-bold text-gray-900 text-4xl mb-10'>My Reports</h1>

      </aside>
      <main className='w-9/12'>
        <div className='flex justify-between'>

          <div className='flex gap-2'>
            <LinkButton isActive={view === 'reviewPending'} onClick={() => setView('reviewPending')}>Pending</LinkButton>
            <LinkButton isActive={view === 'reviwed'} onClick={() => setView('reviwed')}>Reviwed</LinkButton>
          </div>
        </div>

        {view === 'reviewPending' && (() => {
          const filteredReports = reports.filter((exam) => exam.isReviwed === false);

          const groupedReports = filteredReports.reduce((groups, exam) => {
            const date = new Date(exam.startTime).toISOString().split('T')[0];
            const groupKey = `${exam.examTitle}-${date}`;

            if (!groups[groupKey]) {
              groups[groupKey] = [];
            }
            groups[groupKey].push(exam);

            return groups;
          }, {});

          const groupEntries = Object.entries(groupedReports);

          if (groupEntries.length === 0) {
            return <p>No hay exámenes pendientes de revisión</p>;
          }

          return (
            <ul className='mt-6'>
              {groupEntries.map(([groupKey, groupExams]) => (
                <li
                  key={groupKey}
                  className='flex flex-col pl-4 gap-4 items-start border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold'
                >
                  <div
                    className='flex items-center gap-4 cursor-pointer'
                    onClick={() => {
                      setExamReview(groupExams);
                      setView('examList');
                    }}
                  >
                    <span className='text-lg font-semibold'>{groupExams[0].examTitle}</span>
                    <span>{new Date(groupExams[0].startTime).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}

        {view === 'examList' && examReview && (
          <div>
            <h2 className='text-gray-800'>
              {examReview[0].examTitle} - {new Date(examReview[0].startTime).toLocaleDateString()}
            </h2>
            <ul className='text-gray-800'>
              {examReview.map((exam) => (
                <li key={exam.id} className="flex pl-4 gap-4 h-14 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold">
                  <button className='font-medium mr-2 hover:font-bold'
                    onClick={() => {
                      setView("examReview");
                      setExamReview(exam);
                    }}
                  >{exam.studentName}
                  </button>
                  <div className="flex">
                    <span className='text-sm text-gray-500 mr-2'>Submited: {new Date(exam.startTime).toLocaleTimeString()}</span>
                    <span className='text-red-600 flex gap-2 align-top'> {exam.warnings > 0 ? <CiWarning /> : ''}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button
              className='mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded'
              onClick={() => setView('reviewPending')}
            >
              Volver
            </button>
          </div>
        )}


        {view === 'reviwed' && (
          <ul className='mt-6'>
            {reports
              .filter((exam) => exam.isReviwed === true)
              .map((exam) => (
                <li
                  key={exam.id}
                  className='flex pl-4 gap-4 h-14 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold'>
                  <div className='flex items-center gap-4'>
                    <span
                      onClick={() => {
                        setView("evalPreview");
                        setExamReview(exam);
                      }}
                      className='text-lg cursor-pointer'
                    >
                      {exam.examTitle}
                    </span>
                    <span>{exam.startTime}</span>
                  </div>
                  <div className='flex items-center gap-4'>

                  </div>
                </li>
              ))}
          </ul>
        )}

        {view === 'examReview' && (
          <ExamReview user={user} exam={examReview} handleView={handleView}/>
        )}


        {view === 'evalPreview' && (
          <EvalPreview exam={examReview
          } />
        )
        }
      </main>
    </div>
  );
}