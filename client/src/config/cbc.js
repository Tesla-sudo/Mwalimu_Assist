export const CBC_GRADE_LEVELS = [
  { id: 'lower-primary', grades: [1, 2, 3], name: 'Lower Primary (Grades 1-3)' },
  { id: 'upper-primary', grades: [4, 5, 6], name: 'Upper Primary (Grades 4-6)' },
  { id: 'junior-secondary', grades: [7, 8, 9], name: 'Junior Secondary (Grades 7-9)' }
];

export const CBC_SUBJECTS = {
  'lower-primary': ['English', 'Kiswahili', 'Mathematics', 'Environmental Activities', 'Hygiene & Nutrition', 'Religious Activities', 'Movement & Creative Activities'],
  'upper-primary': ['English', 'Kiswahili', 'Mathematics', 'Science & Technology', 'Social Studies', 'Agriculture', 'Home Science', 'Religious Education'],
  'junior-secondary': ['English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Health Education', 'Pre-Technical & Pre-Career', 'Social Studies', 'Religious Education', 'Business Studies']
};

export const getSubjectsForGrades = (selectedGrades) => {
  const levelIds = CBC_GRADE_LEVELS.find(level => 
    selectedGrades.some(g => level.grades.includes(g))
  )?.id || 'lower-primary';  // Default fallback
  return CBC_SUBJECTS[levelIds] || [];
};