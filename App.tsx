
import React, { useState, useCallback, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Student, Table, TeacherDesk, AppSettings, AlgorithmType, StudentSlot, Rotation, TableGroup, Position, ActiveRotationOperation } from './types';
import { DEFAULT_CLASS_NAME, APP_TITLE, LAYOUT_EDITOR_ID, TABLE_SLOT_WIDTH, TABLE_SLOT_HEIGHT, TABLE_PADDING, TEACHER_DESK_WIDTH, TEACHER_DESK_HEIGHT } from './constants';
import LayoutEditor from './components/LayoutEditor';
import ControlsPanel from './components/ControlsPanel';
import StudentListDisplay from './components/StudentListDisplay';
import InstructionsModal from './components/InstructionsModal'; // Import the new modal
import { assignStudents } from './services/seatingAlgorithms';

const generateId = (prefix: string = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

const getInternalTableDimensions = (capacity: 1 | 2 | 4, rotation: Rotation) => {
  let w = 0, h = 0;
  const slotWidthWithPadding = TABLE_SLOT_WIDTH + 2 * TABLE_PADDING;
  const slotHeightWithPadding = TABLE_SLOT_HEIGHT + 2 * TABLE_PADDING;

  switch (capacity) {
    case 1:
      w = slotWidthWithPadding;
      h = slotHeightWithPadding;
      break;
    case 2: 
      w = slotWidthWithPadding * 2;
      h = slotHeightWithPadding;
      break;
    case 4: 
      w = slotWidthWithPadding * 2;
      h = slotHeightWithPadding * 2;
      break;
  }
  const currentRotation = rotation % 360;
  if (currentRotation === 90 || currentRotation === 270 || currentRotation === -90 || currentRotation === -270) {
    return { width: h, height: w };
  }
  return { width: w, height: h };
};


const App: React.FC = () => {
  const [className, setClassName] = useState<string>(DEFAULT_CLASS_NAME);
  const [students, setStudents] = useState<Student[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [teacherDesk, setTeacherDesk] = useState<TeacherDesk | null>(null);
  const [tableGroups, setTableGroups] = useState<TableGroup[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<'table' | 'teacherDesk' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [notification, setNotification] = useState<string | null>(null);
  const [activeRotationOp, setActiveRotationOp] = useState<ActiveRotationOperation | null>(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState<boolean>(true); // State for modal, now defaults to true


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification]);

  const handleSettingsLoad = useCallback((settings: AppSettings) => {
    setClassName(settings.className);
    setStudents(settings.students);
    setTables(settings.tables); 
    setTeacherDesk(settings.teacherDesk); 
    setTableGroups(settings.tableGroups || []);
    setSelectedItemIds([]); 
    setSelectedItemType(null);
    // setNotification('Settings loaded successfully.'); // Notification might be too early if instructions modal is open
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    const loadDefaultSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('./defaultSettings.json'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const settings = await response.json();
        handleSettingsLoad(settings as AppSettings);
      } catch (error) {
        console.error("Failed to load default settings:", error);
        setNotification("Error: Could not load default configuration. Starting with a blank slate.");
        handleSettingsLoad({
          className: DEFAULT_CLASS_NAME,
          students: [],
          tables: [],
          teacherDesk: null,
          tableGroups: [],
        } as AppSettings);
      }
    };
    loadDefaultSettings();
  }, [handleSettingsLoad]);


  const handleAddTable = useCallback((capacity: 1 | 2 | 4) => {
    const editorEl = document.getElementById(LAYOUT_EDITOR_ID);
    const editorRect = editorEl?.getBoundingClientRect();
    
    const {width: itemWidth, height: itemHeight} = getInternalTableDimensions(capacity, 0);

    const x = editorRect ? Math.random() * Math.max(0, editorRect.width - itemWidth) : 50;
    const y = editorRect ? Math.random() * Math.max(0, editorRect.height - itemHeight) : 50;

    const tableId = generateId('table');
    const studentSlots: StudentSlot[] = [];
    for (let i = 0; i < capacity; i++) {
      studentSlots.push({ id: `${tableId}-slot-${i}`, studentId: null });
    }
    const newTable: Table = { id: tableId, x, y, capacity, rotation: 0, studentSlots };
    setTables(prev => [...prev, newTable]);
    setNotification(`Table (capacity ${capacity}) added.`);
  }, []);

  const handleAddTeacherDesk = useCallback(() => {
     if (teacherDesk) {
        setNotification("Teacher desk already exists. Remove it first to add a new one.");
        return;
    }
    const editorEl = document.getElementById(LAYOUT_EDITOR_ID);
    const editorRect = editorEl?.getBoundingClientRect();
    const x = editorRect ? Math.random() * Math.max(0, editorRect.width - TEACHER_DESK_WIDTH) : 100;
    const y = editorRect ? Math.random() * Math.max(0, editorRect.height - TEACHER_DESK_HEIGHT) : 100;
    
    setTeacherDesk({ id: generateId('desk'), x, y });
    setNotification('Teacher desk added.');
  }, [teacherDesk]);

  const handleRemoveSelectedItems = useCallback(() => {
    if (selectedItemIds.length === 0) {
        setNotification('No items selected to remove.');
        return;
    }
    const removedTableIds = new Set<string>();
    const newTables = tables.filter(t => {
        if (selectedItemIds.includes(t.id)) {
            removedTableIds.add(t.id);
            return false;
        }
        return true;
    });
    setTables(newTables);

    if (teacherDesk && selectedItemIds.includes(teacherDesk.id)) {
        setTeacherDesk(null);
    }
    
    setTableGroups(prevGroups => 
        prevGroups.map(group => ({
            ...group,
            tableIds: group.tableIds.filter(id => !removedTableIds.has(id))
        })).filter(group => group.tableIds.length >= 1)
    );

    setSelectedItemIds([]);
    setSelectedItemType(null);
    setNotification(`${selectedItemIds.length} item(s) removed.`);
  }, [selectedItemIds, teacherDesk, tables]);
  

  const handleGroupSelectedTables = useCallback(() => {
    const selectedTablesToGroup = selectedItemIds.filter(id => tables.some(t => t.id === id));
    if (selectedTablesToGroup.length < 2) {
      setNotification("Please select at least two tables to group.");
      return;
    }

    const newGroupId = generateId('group');
    const newGroup: TableGroup = { id: newGroupId, tableIds: selectedTablesToGroup };

    setTableGroups(prevGroups => {
      const groupsWithoutSelectedTables = prevGroups.map(group => ({
        ...group,
        tableIds: group.tableIds.filter(id => !selectedTablesToGroup.includes(id))
      })).filter(group => group.tableIds.length > 0); 

      return [...groupsWithoutSelectedTables, newGroup];
    });

    setNotification(`Created a new group with ${selectedTablesToGroup.length} tables.`);
    setSelectedItemIds([]); 
  }, [selectedItemIds, tables]);

  const handleUngroupSelectedTables = useCallback(() => {
    const selectedTablesInGroups = selectedItemIds.filter(id => 
        tables.some(t => t.id === id) && tableGroups.some(g => g.tableIds.includes(id))
    );

    if (selectedTablesInGroups.length === 0) {
      setNotification("No selected tables are currently in a group.");
      return;
    }

    setTableGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        tableIds: group.tableIds.filter(id => !selectedTablesInGroups.includes(id))
      })).filter(group => group.tableIds.length >= 1) 
    );
    setNotification(`Ungrouped ${selectedTablesInGroups.length} table(s).`);
  }, [selectedItemIds, tables, tableGroups]);


  const handleUpdateTablePosition = useCallback((draggedTableId: string, newX: number, newY: number) => {
    setTables(prevTables => {
      const draggedTable = prevTables.find(t => t.id === draggedTableId);
      if (!draggedTable) return prevTables;

      const groupOfDraggedTable = tableGroups.find(g => g.tableIds.includes(draggedTableId));
      const editorEl = document.getElementById(LAYOUT_EDITOR_ID);
      const editorRect = editorEl?.getBoundingClientRect();

      if (!editorRect) return prevTables;

      if (groupOfDraggedTable) {
        const deltaX = newX - draggedTable.x;
        const deltaY = newY - draggedTable.y;
        
        return prevTables.map(t => {
          if (t.id === draggedTableId) {
            return { ...t, x: newX, y: newY };
          }
          if (groupOfDraggedTable.tableIds.includes(t.id)) {
            const { width: itemWidth, height: itemHeight } = getInternalTableDimensions(t.capacity, t.rotation);
            let updatedX = t.x + deltaX;
            let updatedY = t.y + deltaY;

            updatedX = Math.max(0, Math.min(updatedX, editorRect.width - itemWidth));
            updatedY = Math.max(0, Math.min(updatedY, editorRect.height - itemHeight));
            return { ...t, x: updatedX, y: updatedY };
          }
          return t;
        });
      } else {
        return prevTables.map(t => t.id === draggedTableId ? { ...t, x: newX, y: newY } : t);
      }
    });
  }, [tableGroups]);

  const handleUpdateTeacherDeskPosition = useCallback((id: string, x: number, y: number) => {
    setTeacherDesk(prevDesk => prevDesk && prevDesk.id === id ? { ...prevDesk, x, y } : prevDesk);
  }, []);
  
  const handleApplyAlgorithm = useCallback((algorithm: AlgorithmType) => {
    if (students.length === 0) {
      setNotification("Please load students first."); return;
    }
    if (tables.length === 0) {
      setNotification("Please add tables/desks to the layout first."); return;
    }
    setIsLoading(true);
    const tablesWithClearedAssignments = tables.map(table => ({
        ...table,
        studentSlots: table.studentSlots.map(slot => ({ ...slot, studentId: null }))
    }));

    setTimeout(() => { 
      try {
        const newTables = assignStudents(students, tablesWithClearedAssignments, algorithm, tableGroups);
        setTables(newTables);
        setNotification(`Seating arrangement applied using ${algorithm.replace(/_/g, ' ')} strategy.`);
      } catch (e) {
        console.error("Error applying algorithm:", e);
        setNotification("An error occurred while applying the seating algorithm.");
      } finally {
        setIsLoading(false);
      }
    }, 50); 
  }, [students, tables, tableGroups]);

  const handleClearAssignments = useCallback(() => {
    setTables(prevTables => prevTables.map(table => ({
      ...table,
      studentSlots: table.studentSlots.map(slot => ({ ...slot, studentId: null }))
    })));
    setNotification('All student assignments cleared.');
  }, []);

  const handleStudentsLoad = (loadedStudents: Student[]) => {
    setStudents(loadedStudents);
  };
  
  const currentSettings: AppSettings = {
    className, students, tables, teacherDesk, tableGroups,
  };
  
  const handleSelectTable = (id: string, event?: ReactMouseEvent<HTMLDivElement>) => {
    const isCtrlOrMetaPressed = event?.ctrlKey || event?.metaKey;
    if (isCtrlOrMetaPressed) {
      setSelectedItemIds(prevSelectedIds =>
        prevSelectedIds.includes(id)
          ? prevSelectedIds.filter(selectedId => selectedId !== id)
          : [...prevSelectedIds, id]
      );
    } else {
      setSelectedItemIds([id]);
    }
    setSelectedItemType('table'); 
  };

  const handleSelectTeacherDesk = (id: string, event?: ReactMouseEvent<HTMLDivElement>) => {
    setSelectedItemIds([id]);
    setSelectedItemType('teacherDesk');
  };

  const handleStartRotation = useCallback((itemId: string, itemType: 'table' | 'group', pivot: Position, initialAngleDeg: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const originalRotations = new Map<string, number>();
    if (itemType === 'table') {
        const table = tables.find(t => t.id === itemId);
        if (table) originalRotations.set(itemId, table.rotation);
    }

    setActiveRotationOp({
        itemId,
        itemType,
        pivot,
        startMouseAngleDeg: initialAngleDeg,
        originalRotations,
        currentVisualAngleDeg: originalRotations.get(itemId) || 0,
    });
  }, [tables]);

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!activeRotationOp) return;

      const currentMouseAngleDeg = Math.atan2(
        event.clientY - activeRotationOp.pivot.y,
        event.clientX - activeRotationOp.pivot.x
      ) * (180 / Math.PI);

      const deltaAngle = currentMouseAngleDeg - activeRotationOp.startMouseAngleDeg;
      const initialItemRotation = activeRotationOp.originalRotations.get(activeRotationOp.itemId) || 0;
      const newVisualAngle = initialItemRotation + deltaAngle;
      
      setActiveRotationOp(prev => prev ? { ...prev, currentVisualAngleDeg: newVisualAngle } : null);
    };

    const handleGlobalMouseUp = () => {
      if (!activeRotationOp) return;

      let finalAngle = activeRotationOp.currentVisualAngleDeg;
      let snappedRotation = Math.round(finalAngle / 90) * 90;
      snappedRotation = (snappedRotation % 360 + 360) % 360; 

      if (activeRotationOp.itemType === 'table') {
        setTables(prevTables =>
          prevTables.map(t =>
            t.id === activeRotationOp.itemId ? { ...t, rotation: snappedRotation } : t
          )
        );
      }
      
      setActiveRotationOp(null);
    };

    if (activeRotationOp) {
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [activeRotationOp]);


  const canGroupSelected = selectedItemIds.length >= 2 && selectedItemIds.every(id => tables.some(t => t.id === id));
  const canUngroupSelected = selectedItemIds.some(id => tableGroups.some(g => g.tableIds.includes(id)));

  if (isLoading && !notification?.startsWith("Error:") && !isInstructionsModalOpen) { 
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-sky-100 p-4 md:p-8 font-sans">
            <div className="text-2xl font-semibold text-slate-700">Loading Application...</div>
            <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-sky-100 p-4 md:p-8 font-sans" >
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-700 tracking-tight">{APP_TITLE}</h1>
        <p className="text-slate-500">Design your classroom: add desks, tables, and arrange students with ease.</p>
      </header>

      {notification && (
        <div className={`fixed top-5 right-5 ${notification.startsWith("Error:") ? 'bg-red-600' : 'bg-blue-600'} text-white p-3 rounded-lg shadow-md z-[1000] transition-opacity duration-300 animate-fadeInOut`}>
          {notification}
        </div>
      )}
      <style>{`
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <ControlsPanel
            className={className} onClassNameChange={setClassName}
            onAddTable={handleAddTable} onAddTeacherDesk={handleAddTeacherDesk}
            onRemoveSelectedItems={handleRemoveSelectedItems}
            canRemove={selectedItemIds.length > 0}
            onApplyAlgorithm={handleApplyAlgorithm} currentStudents={students}
            onStudentsLoad={handleStudentsLoad} 
            onSettingsLoad={handleSettingsLoad}
            currentSettings={currentSettings} isLoading={isLoading && !isInstructionsModalOpen} // Pass loading state considering modal
            onClearAssignments={handleClearAssignments}
            onGroupSelectedTables={handleGroupSelectedTables} canGroup={canGroupSelected}
            onUngroupSelectedTables={handleUngroupSelectedTables}
            canUngroup={canUngroupSelected}
            onOpenInstructions={() => setIsInstructionsModalOpen(true)} // Pass handler to open modal
          />
          <StudentListDisplay students={students} />
        </aside>

        <main className="lg:col-span-2 bg-white p-2 sm:p-4 rounded-xl shadow-2xl">
           <h2 className="text-xl font-semibold text-slate-700 mb-1 sm:mb-2 pl-2">Classroom Layout: <span className="text-indigo-600">{className}</span></h2>
           <p className="text-xs text-slate-500 mb-3 pl-2">Ctrl/Cmd+Click to multi-select tables. Click & drag rotation handle on selected table to rotate.</p>
          <LayoutEditor
            tables={tables} teacherDesk={teacherDesk} students={students}
            onUpdateTablePosition={handleUpdateTablePosition}
            onUpdateTeacherDeskPosition={handleUpdateTeacherDeskPosition}
            onSelectTable={handleSelectTable} onSelectTeacherDesk={handleSelectTeacherDesk}
            selectedItemIds={selectedItemIds}
            onStartRotation={handleStartRotation}
            activeRotationOp={activeRotationOp}
          />
        </main>
      </div>
      
      <InstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onClose={() => setIsInstructionsModalOpen(false)} 
      />

      <footer className="text-center mt-12 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Seating Chart Generator. Enhanced Edition.</p>
      </footer>
    </div>
  );
};

export default App;
