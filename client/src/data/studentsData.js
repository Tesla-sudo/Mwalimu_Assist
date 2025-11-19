// src/data/studentsData.js
let students = [
  // Your real students go here
  { id: 1, name: "Amina Hassan", grade: 7, adm: "7001" },
  { id: 2, name: "John Kamau", grade: 7, adm: "7002" },
  { id: 3, name: "Fatuma Ali", grade: 7, adm: "7003" },
  { id: 4, name: "Peter Omondi", grade: 6, adm: "6001" },
  { id: 5, name: "Grace Wanjiku", grade: 6, adm: "6002" },
];

export const getStudents = () => students;

export const getStudentsByGrade = (grade) => {
  const gradeNum = parseInt(grade);
  return students.filter(s => s.grade === gradeNum);
};

export const addStudent = (student) => {
  const newStudent = { id: Date.now(), ...student };
  students = [...students, newStudent];
  return newStudent;
};

export const deleteStudent = (id) => {
  students = students.filter(s => s.id !== id);
};