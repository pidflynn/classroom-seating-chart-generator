
import { Student, Table, Gender, AlgorithmType, StudentSlot, Rotation, TableGroup } from '../types';
import { ENGLISH_ABILITY_LOW, ENGLISH_ABILITY_STRONG_THRESHOLD_MIN, ENGLISH_ABILITY_STRONG_THRESHOLD_MAX } from '../constants';

// Helper to shuffle an array
function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper to get all available slots from a specific list of tables
function getAvailableSlotsFromTables(tables: Table[]): { tableId: string, slotId: string }[] {
  const slots: { tableId: string, slotId: string }[] = [];
  tables.forEach(table => {
    table.studentSlots.forEach(slot => {
      if (!slot.studentId) {
        slots.push({ tableId: table.id, slotId: slot.id });
      }
    });
  });
  return slots;
}

// Helper function to assign a list of students to a list of slots
function assignStudentsToSlots(
    students: Student[], 
    slots: { tableId: string, slotId: string }[], 
    tablesToUpdate: Table[], 
    assignedIds: Set<string>
): void {
    let studentIdx = 0;
    for (const slotToAssign of slots) {
        if (studentIdx >= students.length) break;
        const student = students[studentIdx];
        if (assignedIds.has(student.id)) { // Skip if student already assigned by a prior step (e.g. triangle)
            studentIdx++; // Move to next student, but don't consume slot yet
            continue; 
        }

        const table = tablesToUpdate.find(t => t.id === slotToAssign.tableId);
        const slotObj = table?.studentSlots.find(s => s.id === slotToAssign.slotId);
        if (slotObj && !slotObj.studentId) { // Double check slot is empty before assigning
            slotObj.studentId = student.id;
            assignedIds.add(student.id);
            studentIdx++;
        }
    }
}


export const assignStudents = (
  studentsToAssignInput: Student[],
  currentTables: Table[],
  algorithm: AlgorithmType,
  tableGroups: TableGroup[] // Added tableGroups
): Table[] => {
  let newTables = JSON.parse(JSON.stringify(currentTables)) as Table[];
  newTables.forEach(table => {
    table.studentSlots.forEach(slot => slot.studentId = null);
  });

  let unassignedStudents = shuffleArray([...studentsToAssignInput]);
  let assignedStudentIds = new Set<string>();

  // Identify grouped and ungrouped tables
  const allGroupedTableIds = new Set(tableGroups.flatMap(g => g.tableIds));
  const groupedTables = newTables.filter(t => allGroupedTableIds.has(t.id));
  const ungroupedTables = newTables.filter(t => !allGroupedTableIds.has(t.id));

  if (algorithm === AlgorithmType.Randomized) {
    // Prioritize grouped tables, then ungrouped
    let groupedSlots = shuffleArray(getAvailableSlotsFromTables(groupedTables));
    assignStudentsToSlots(unassignedStudents, groupedSlots, newTables, assignedStudentIds);

    let remainingStudentsForUngrouped = unassignedStudents.filter(s => !assignedStudentIds.has(s.id));
    let ungroupedSlots = shuffleArray(getAvailableSlotsFromTables(ungroupedTables));
    assignStudentsToSlots(remainingStudentsForUngrouped, ungroupedSlots, newTables, assignedStudentIds);

  } else if (algorithm === AlgorithmType.MichaelsTriangle) {
    let weakStudents = unassignedStudents.filter(s => s.englishAbility === ENGLISH_ABILITY_LOW && !assignedStudentIds.has(s.id));
    let strongStudentsPool = unassignedStudents.filter(s => 
        s.englishAbility >= ENGLISH_ABILITY_STRONG_THRESHOLD_MIN && 
        s.englishAbility <= ENGLISH_ABILITY_STRONG_THRESHOLD_MAX && !assignedStudentIds.has(s.id)
    );

    for (const weakStudent of weakStudents) {
      if (assignedStudentIds.has(weakStudent.id)) continue;

      let strong1: Student | undefined = strongStudentsPool.find(s => !assignedStudentIds.has(s.id) && s.id !== weakStudent.id && s.nationality === weakStudent.nationality);
      if (!strong1) continue;

      let strong2: Student | undefined = strongStudentsPool.find(s => !assignedStudentIds.has(s.id) && s.id !== weakStudent.id && s.id !== strong1!.id && s.nationality !== weakStudent.nationality);
      if (!strong2) continue;
      
      const triangleStudents = [weakStudent, strong1, strong2];
      let placedTriangle = false;

      // 1. Try to place in a table group
      for (const group of shuffleArray(tableGroups)) { // Shuffle groups for fairness
        const tablesInGroup = newTables.filter(t => group.tableIds.includes(t.id));
        const emptySlotsInGroup = getAvailableSlotsFromTables(tablesInGroup);
        if (emptySlotsInGroup.length >= 3) {
          assignStudentsToSlots(triangleStudents, shuffleArray(emptySlotsInGroup).slice(0,3), newTables, assignedStudentIds);
          placedTriangle = true;
          break;
        }
      }
      if (placedTriangle) continue;

      // 2. Try to place on a single ungrouped table
      const suitableUngroupedTables = ungroupedTables
        .filter(t => getAvailableSlotsFromTables([t]).length >= 3)
        .sort((a, b) => b.capacity - a.capacity);

      for (const table of suitableUngroupedTables) {
          const emptySlotsInTable = getAvailableSlotsFromTables([table]);
           assignStudentsToSlots(triangleStudents, shuffleArray(emptySlotsInTable).slice(0,3), newTables, assignedStudentIds);
           placedTriangle = true;
           break;
      }
      if (placedTriangle) continue;
      
      // 3. (Optional more complex: try combinations of ungrouped tables - keeping it simpler for now)
    }

    // Assign remaining students (not in triangles, or if triangles couldn't be placed)
    const studentsLeftToAssign = unassignedStudents.filter(s => !assignedStudentIds.has(s.id));
    
    // Fill grouped slots first
    let remainingGroupedSlots = shuffleArray(getAvailableSlotsFromTables(groupedTables)).filter(slot => {
        const table = newTables.find(t => t.id === slot.tableId);
        return table && table.studentSlots.find(s => s.id === slot.slotId && !s.studentId);
    });
    assignStudentsToSlots(studentsLeftToAssign, remainingGroupedSlots, newTables, assignedStudentIds);
    
    // Then fill ungrouped slots
    const studentsTrulyLeft = studentsLeftToAssign.filter(s => !assignedStudentIds.has(s.id));
    let remainingUngroupedSlots = shuffleArray(getAvailableSlotsFromTables(ungroupedTables)).filter(slot => {
        const table = newTables.find(t => t.id === slot.tableId);
        return table && table.studentSlots.find(s => s.id === slot.slotId && !s.studentId);
    });
    assignStudentsToSlots(studentsTrulyLeft, remainingUngroupedSlots, newTables, assignedStudentIds);


  } else { // AlgorithmType.None or fallback - simple fill across all tables
     let allAvailableSlots = shuffleArray(getAvailableSlotsFromTables(newTables));
     assignStudentsToSlots(unassignedStudents.filter(s=>!assignedStudentIds.has(s.id)), allAvailableSlots, newTables, assignedStudentIds);
  }
  
  return newTables;
};
