
import React, { MouseEvent as ReactMouseEvent } from 'react';
import { Table as TableType, TeacherDesk as TeacherDeskType, Student, Position, ActiveRotationOperation } from '../types';
import { LAYOUT_EDITOR_ID } from '../constants';
import TableComponent from './Table'; 
import TeacherDeskComponent from './TeacherDesk';

interface LayoutEditorProps {
  tables: TableType[];
  teacherDesk: TeacherDeskType | null;
  students: Student[];
  onUpdateTablePosition: (id: string, x: number, y: number) => void;
  onUpdateTeacherDeskPosition: (id: string, x: number, y: number) => void;
  onSelectTable: (id: string, event?: ReactMouseEvent<HTMLDivElement>) => void;
  onSelectTeacherDesk: (id: string, event?: ReactMouseEvent<HTMLDivElement>) => void;
  selectedItemIds: string[];
  onStartRotation: (itemId: string, itemType: 'table', pivot: Position, initialAngleDeg: number, event: ReactMouseEvent) => void;
  activeRotationOp: ActiveRotationOperation | null;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({
  tables,
  teacherDesk,
  students,
  onUpdateTablePosition,
  onUpdateTeacherDeskPosition,
  onSelectTable,
  onSelectTeacherDesk,
  selectedItemIds,
  onStartRotation,
  activeRotationOp
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (activeRotationOp) return; // Don't allow dropping items while a rotation is active
    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString || !editorRef.current) return;

    try {
        const itemData = JSON.parse(itemDataString) as {
            itemId: string;
            type: 'table' | 'teacherDesk';
            offsetX: number;
            offsetY: number;
            itemWidth: number; 
            itemHeight: number; 
        };
        
        const editorRect = editorRef.current.getBoundingClientRect();
        const dropXInEditor = e.clientX - editorRect.left;
        const dropYInEditor = e.clientY - editorRect.top;

        let newX = dropXInEditor - itemData.offsetX;
        let newY = dropYInEditor - itemData.offsetY;
        
        newX = Math.max(0, Math.min(newX, editorRect.width - itemData.itemWidth));
        newY = Math.max(0, Math.min(newY, editorRect.height - itemData.itemHeight));

        if (itemData.type === 'table') {
            onUpdateTablePosition(itemData.itemId, newX, newY);
        } else if (itemData.type === 'teacherDesk' && teacherDesk && teacherDesk.id === itemData.itemId) {
            onUpdateTeacherDeskPosition(itemData.itemId, newX, newY);
        }
    } catch (error) {
        console.error("Error processing drop data:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    if (!activeRotationOp) { // Only allow dropping if not rotating
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  return (
    <div
      id={LAYOUT_EDITOR_ID}
      ref={editorRef}
      className="w-full h-[600px] bg-white border-2 border-gray-400 rounded-lg shadow-inner relative overflow-auto select-none"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {tables.map((table) => (
        <TableComponent
          key={table.id}
          table={table}
          students={students} 
          onMove={onUpdateTablePosition}
          onClick={(id, event) => onSelectTable(id, event)}
          isSelected={selectedItemIds.includes(table.id)}
          layoutContainerId={LAYOUT_EDITOR_ID}
          onStartRotation={onStartRotation}
          activeRotationOp={activeRotationOp}
          selectedItemIds={selectedItemIds} // Pass selectedItemIds here
        />
      ))}
      {teacherDesk && (
        <TeacherDeskComponent
          desk={teacherDesk}
          onMove={onUpdateTeacherDeskPosition}
          onClick={(id, event) => onSelectTeacherDesk(id, event)}
          isSelected={selectedItemIds.includes(teacherDesk.id)}
          layoutContainerId={LAYOUT_EDITOR_ID}
        />
      )}
       <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/70 p-1 rounded">Drag items to position. Ctrl/Cmd+Click to select multiple.</div>
    </div>
  );
};

export default LayoutEditor;
