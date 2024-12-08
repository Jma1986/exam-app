import {useState, useEffect } from 'react';

export default function MyReports({ user }) {

    const [reports, setReports] = useState([]);

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
      }, [user]);

    return (    
        <div>
            <h1>My Reports</h1>
            <p>My Reports</p>
        </div>
    );
}