import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase_auth";
import { IconContext } from "react-icons";
import { MdGroups2, MdOutlineGroupAdd, MdOutlineGroupOff, MdPersonAdd, MdDelete } from "react-icons/md";

export default function MyClasses({ user, handleView }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [view, setView] = useState("classes");
  const [newStudentEmail, setNewStudentEmail] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, "clases"));
        const fetchedClasses = classSnapshot.docs
          .filter((doc) => doc.data().professor === user?.email)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [user]);

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      await deleteDoc(doc(db, "clases", classId));
      setClasses((prevClasses) => prevClasses.filter((cls) => cls.id !== classId));
      alert("Class deleted successfully");
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete the class. Please try again.");
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentEmail) return;
    try {
      const classRef = doc(db, "clases", selectedClass.id);
      await updateDoc(classRef, {
        students: arrayUnion(newStudentEmail),
      });
      setSelectedClass((prevClass) => ({
        ...prevClass,
        students: [...(prevClass.students || []), newStudentEmail],
      }));
      setNewStudentEmail("");
      alert("Student added successfully");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add the student. Please try again.");
    }
  };

  const handleDeleteStudent = async (studentEmail) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      const classRef = doc(db, "clases", selectedClass.id);
      await updateDoc(classRef, {
        students: arrayRemove(studentEmail),
      });
      setSelectedClass((prevClass) => ({
        ...prevClass,
        students: prevClass.students.filter((student) => student !== studentEmail),
      }));
      alert("Student removed successfully");
    } catch (error) {
      console.error("Error removing student:", error);
      alert("Failed to remove the student. Please try again.");
    }
  };

  return (
    <div className="flex flex-grow justify-between">
      {/* Sidebar */}
      <div className="w-2/12">
        <button onClick={() => setView("classes")}>
            <h1 className="font-bold text-gray-900 text-4xl mb-10 hover:text-blue-950">My Groups</h1>
        </button>
        {view === "classPreview" ? (
          <div className="mb-4">
            <input
              type="email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder="Student Email"
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleAddStudent}
              className="font-bold flex gap-2 items-center border-l-2 border-blue-900 px-4 py-2 text-gray-800 hover:border-l-4 transition-all ease-in-out"
            >
              <MdPersonAdd /> Add Student
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleView("classForm")}
            className="font-bold flex gap-2 items-baseline ml-4 border-l-2 border-blue-900 px-4 py-2 text-gray-800 mb-4 hover:border-l-4 transition-all ease-in-out"
          >
            <MdOutlineGroupAdd /> New Group
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-9/12">
        {view === "classes" && (
          <ul className="mt-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col pl-4 gap-4 border-b-2 border-t-2 border-gray-200 text-gray-800 group hover:font-bold"
              >
                {/* Class Details */}
                <div className="flex items-center gap-4 justify-between h-14">
                  <div className="flex items-center gap-4">
                    <IconContext.Provider value={{ className: "text-3xl" }}>
                      <MdGroups2 />
                    </IconContext.Provider>
                    <li
                      onClick={() => {
                        setSelectedClass(cls);
                        setView("classPreview");
                      }}
                      className="text-lg cursor-pointer"
                    >
                      {cls.name}
                    </li>
                  </div>

                  {/* Delete Button */}
                  <button onClick={() => handleDeleteClass(cls.id)}>
                    <IconContext.Provider value={{ className: "text-3xl text-red-400 mr-4 hover:text-red-800 hidden group-hover:block" }}>
                      <MdOutlineGroupOff title="Delete Group" />
                    </IconContext.Provider>
                  </button>
                </div>
              </div>
            ))}
          </ul>
        )}

        {view === "classPreview" && selectedClass && (
          <div className="w-9/12 ml-8 mt-4">
            <h2 className="font-bold text-xl mb-2">Students in {selectedClass.name}</h2>
            <ul className="list-disc ml-4">
              {Array.isArray(selectedClass.students) && selectedClass.students.length > 0 ? (
                selectedClass.students.map((student, index) => (
                  <li key={index} className="flex items-center justify-between text-gray-700">
                    {student}
                    <button onClick={() => handleDeleteStudent(student)}>
                      <IconContext.Provider value={{ className: "text-xl text-red-400 ml-4 hover:text-red-800" }}>
                        <MdDelete title="Delete Student" />
                      </IconContext.Provider>
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No students enrolled yet.</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
