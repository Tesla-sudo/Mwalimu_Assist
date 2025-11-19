// src/config/cbc.js
export const CBC_GRADE_LEVELS = [
  { id: "lower", name: "Lower Primary", grades: [1, 2, 3] },
  { id: "upper", name: "Upper Primary", grades: [4, 5, 6] },
  { id: "junior", name: "Junior Secondary", grades: [7, 8, 9] }
];

export const ALL_CBC_SUBJECTS = [
  // Core
  "English", "Kiswahili", "Mathematics", "Science and Technology", "Social Studies",
  "Religious Education (CRE/IRE/HRE)", "Creative Arts", "Physical Education",

  // Junior Secondary (Grade 7-9)
  "Integrated Science", "Health Education", "Life Skills Education",
  "Pre-Technical Studies", "Business Studies", "Agriculture", "Home Science",
  "Computer Science", "Visual Arts", "Performing Arts", "Foreign Languages (French/German)",
  "Kenya Sign Language", "Indigenous Languages"
];

export const getSubjectsForGrades = (grades = []) => {
  if (grades.length === 0) return [];
  const hasJunior = grades.some(g => g >= 7);
  const base = ["English", "Kiswahili", "Mathematics", "Science and Technology", "Social Studies", "Religious Education (CRE/IRE/HRE)", "Creative Arts"];
  const juniorExtras = hasJunior ? ALL_CBC_SUBJECTS.filter(s => !base.includes(s)) : [];
  return [...new Set([...base, ...juniorExtras])];
};