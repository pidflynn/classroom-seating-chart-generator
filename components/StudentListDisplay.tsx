
import React from 'react';
import { Student, Gender } from '../types';

interface StudentListDisplayProps {
  students: Student[];
}

const StudentListDisplay: React.FC<StudentListDisplayProps> = ({ students }) => {
  if (students.length === 0) {
    return <p className="text-gray-600 italic">No students loaded yet. Upload an Excel/CSV file.</p>;
  }

  const getGenderLabel = (gender: Gender) => {
    switch (gender) {
      case Gender.Male: return 'M';
      case Gender.Female: return 'F';
      case Gender.Other: return 'O';
      default: return '?';
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Student Roster ({students.length})</h3>
      <ul className="divide-y divide-gray-200">
        {students.map((student) => (
          <li key={student.id} className="py-3 px-1 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">{student.name}</span>
              <div className="text-sm text-gray-600 space-x-2">
                <span>{student.nationality}</span>
                <span>Lvl: {student.englishAbility}</span>
                <span>{getGenderLabel(student.gender)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentListDisplay;
