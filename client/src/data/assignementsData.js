// src/data/assignmentsData.js
let assignments = [
  {
    id: 1,
    title: "Fractions Mastery Test",
    subject: "Mathematics",
    grade: 6,
    due: "2025-04-25",
    type: "exam",
    submitted: 28,
    total: 32,
    submittedBy: ["Amina Hassan", "John Kamau", "Fatuma Ali", "Peter Omondi"],
    status: "active",
    createdAt: "2025-04-10"
  },
  {
    id: 2,
    title: "Poetry Analysis Essay",
    subject: "English",
    grade: 7,
    due: "2025-04-18",
    type: "assignment",
    submitted: 18,
    total: 28,
    submittedBy: [],
    status: "overdue",
    createdAt: "2025-04-05"
  },
  {
    id: 3,
    title: "Energy Forms Project",
    subject: "Science",
    grade: 5,
    due: "2025-04-30",
    type: "project",
    submitted: 30,
    total: 30,
    submittedBy: [],
    status: "complete",
    createdAt: "2025-04-01"
  }
];

const updateStatus = (ass) => {
  const today = new Date().toISOString().split('T')[0];
  if (ass.submitted === ass.total && ass.total > 0) return 'complete';
  if (ass.due < today && ass.submitted < ass.total) return 'overdue';
  if (ass.due >= today) return 'active';
  return 'upcoming';
};

export const getAssignments = () => {
  return assignments.map(a => ({ ...a, status: updateStatus(a) }));
};

export const addAssignment = (assignment) => {
  const newAss = {
    ...assignment,
    id: Date.now(),
    submitted: 0,
    total: 0,
    submittedBy: [],
    createdAt: new Date().toISOString().split('T')[0]
  };
  assignments = [newAss, ...assignments];
  return newAss;
};

export const deleteAssignment = (id) => {
  assignments = assignments.filter(a => a.id !== id);
};
// Add this function
export const markMultipleSubmitted = (assignmentId, namesArray, total) => {
  assignments = assignments.map(a => {
    if (a.id === assignmentId) {
      return {
        ...a,
        submitted: a.submitted + namesArray.length,
        total: total > a.total ? total : a.total,
        submittedBy: [...(a.submittedBy || []), ...namesArray]
      };
    }
    return a;
  });
};
export const markSubmitted = (assignmentId, studentName, totalStudents) => {
  assignments = assignments.map(a => {
    if (a.id === assignmentId) {
      const newSubmitted = a.submitted + 1;
      return {
        ...a,
        submitted: newSubmitted,
        total: totalStudents > a.total ? totalStudents : a.total,
        submittedBy: [...a.submittedBy, studentName],
        status: updateStatus({ ...a, submitted: newSubmitted })
      };
    }
    return a;
  });
};