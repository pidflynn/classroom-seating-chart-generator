
export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export interface Student {
  id: string;
  name: string;
  nationality: string;
  englishAbility: 1 | 2 | 3 | 4 | 5;
  gender: Gender;
}

export interface Position {
  x: number;
  y: number;
}

// Allow any number for visual drag, but will be snapped to 0, 90, 180, 270 in state logic
export type Rotation = number; 

export interface StudentSlot {
  id: string; // e.g., tableId-slot-0
  studentId: string | null;
}

export interface Table extends Position {
  id: string;
  capacity: 1 | 2 | 4;
  rotation: Rotation;
  studentSlots: StudentSlot[];
}

export interface TeacherDesk extends Position {
  id: string;
}

export interface TableGroup {
  id: string;
  tableIds: string[];
  name?: string; // Optional name for the group
}

export interface ClassroomLayout {
  tables: Table[];
  teacherDesk: TeacherDesk | null;
  tableGroups: TableGroup[];
}

export interface AppSettings extends ClassroomLayout {
  className: string;
  students: Student[];
  // tableGroups is inherited from ClassroomLayout
}

export enum AlgorithmType {
  None = 'none',
  Randomized = 'randomized',
  MichaelsTriangle = 'michaels_triangle',
}

export interface ActiveRotationOperation {
  itemId: string; // Could be a single table ID or a temporary group ID
  itemType: 'table' | 'group'; // To differentiate handling
  pivot: Position; // Absolute screen coordinates for the pivot
  startMouseAngleDeg: number; // Initial angle of mouse relative to pivot
  originalRotations: Map<string, number>; // For groups, original rotation of each table
  currentVisualAngleDeg: number; // The current visual rotation being dragged (absolute)
}
