import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase_auth';
import LinkButton from './LinkButton';
import EvalPreview from './EvalPreview';



export default function StudentDashboard({ user }) {

  const [reports, setReports] = useState([]);
  const [view, setView] = useState('reviewPending');
  const [examReview, setExamReview] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportSnapshot = await getDocs(collection(db, "examenes_realizados"));
        const fetchedReports = reportSnapshot.docs
          .filter((doc) => doc.data().studentEmail === user?.email)
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

        {view === 'reviewPending' && (
            <ul className='mt-6'>
              {reports
              .filter((exam) => exam.isReviwed === false)
              .map((exam) => (
                <li
                  key={exam.id}
                  className='flex pl-4 gap-4 h-12 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold'
                >
                  <div
                    className='flex items-center gap-4 cursor-pointer  hover:font-bold'
                    onClick={() => {
                      setExamReview(exam);
                      setView('evalPreview');
                    }}
                  >{exam.examTitle}
                  </div>
                  <div>{new Date(exam.startTime).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>)}

   
        {view === 'reviwed' && (
          <ul className='mt-6'>
            {reports
              .filter((exam) => exam.isReviwed === true)
              .map((exam) => (
                <li
                  key={exam.id}
                  className='flex pl-4 gap-4 h-12 items-center border-b-2 border-t-2 border-gray-200 text-gray-800 justify-between group hover:font-bold'>
                  <div className='flex items-center gap-4'>
                    <span
                      onClick={() => {
                        setExamReview(exam);
                        setView("evalPreview");
                      }}
                      className='text-base cursor-pointer capitalize'
                    >
                      {exam.examTitle}
                    </span>

                  </div>
                  <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                </li>
              ))}
          </ul>
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