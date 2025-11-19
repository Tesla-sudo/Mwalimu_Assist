// src/data/attendanceData.js
let records = [];

export const getAttendanceRecords = () => records;

export const saveAttendanceRecord = (record) => {
  // Remove old record for same grade + date
  records = records.filter(r => !(r.grade === record.grade && r.date === record.date));
  const newRecord = { id: Date.now(), ...record };
  records = [newRecord, ...records];
  return newRecord;
};