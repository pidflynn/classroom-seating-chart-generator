
import React, { MouseEvent as ReactMouseEvent, useRef, useMemo } from 'react';
import { Table as TableType, Student, Position, ActiveRotationOperation } from '../types';
import { TABLE_SLOT_WIDTH, TABLE_SLOT_HEIGHT, TABLE_PADDING, SLOT_BORDER_WIDTH } from '../constants';
import DraggableItem from './DraggableItem';
import { RotateCcwIcon } from './icons'; 

interface TableProps {
  table: TableType;
  students: Student[]; 
  onMove: (id: string, x: number, y: number) => void;
  onClick: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  isSelected: boolean;
  layoutContainerId: string;
  onStartRotation: (itemId: string, itemType: 'table', pivot: Position, initialAngleDeg: number, event: ReactMouseEvent) => void;
  activeRotationOp: ActiveRotationOperation | null;
  selectedItemIds: string[];
}

const getStudentById = (studentId: string | null, students: Student[]): Student | null => {
  if (!studentId) return null;
  return students.find(s => s.id === studentId) || null;
};

export const getTableFrameDimensions = (capacity: 1 | 2 | 4) => {
    let numCols = 0;
    let numRows = 0;
    switch (capacity) {
        case 1: numCols = 1; numRows = 1; break;
        case 2: numCols = 2; numRows = 1; break;
        case 4: numCols = 2; numRows = 2; break;
    }
    // Gap approx from p-0.5 on slot container, means 2px if border > 0
    const interSlotGap = SLOT_BORDER_WIDTH > 0 ? 2 : 0; 
    const totalContentWidth = numCols * TABLE_SLOT_WIDTH + (numCols - 1) * interSlotGap;
    const totalContentHeight = numRows * TABLE_SLOT_HEIGHT + (numRows - 1) * interSlotGap;
    
    // Effective padding from p-1 on slot container = 4px per side. TABLE_PADDING constant is 5, so using p-1 equivalent.
    const slotContainerOuterPadding = 8; // 4px on each side for p-1

    const width = totalContentWidth + slotContainerOuterPadding;
    const height = totalContentHeight + slotContainerOuterPadding;
    return { width, height };
};


const TableComponent: React.FC<TableProps> = ({ 
    table, students, onMove, onClick, isSelected, layoutContainerId,
    onStartRotation, activeRotationOp, selectedItemIds
}) => {
  const tableRef = useRef<HTMLDivElement>(null); // Ref for the outer positioned div

  const isBeingRotated = activeRotationOp?.itemId === table.id && activeRotationOp?.itemType === 'table';
  const displayRotation = isBeingRotated ? activeRotationOp.currentVisualAngleDeg : table.rotation;
  
  const { width: unrotatedWidth, height: unrotatedHeight } = getTableFrameDimensions(table.capacity);

  const handleRotationMouseDown = (event: ReactMouseEvent) => {
    event.stopPropagation(); // Prevent card selection click
    
    if (tableRef.current) {
        const tableElementForPivot = tableRef.current.querySelector(':scope > div > div'); // Targeting the visual table div
        if (tableElementForPivot) {
            const tableRect = tableElementForPivot.getBoundingClientRect();
            // Pivot is the center of the unrotated table in screen coordinates
            const pivotX = tableRect.left + tableRect.width / 2;
            const pivotY = tableRect.top + tableRect.height / 2;

            const initialMouseAngleDeg = Math.atan2(
                event.clientY - pivotY,
                event.clientX - pivotX
            ) * (180 / Math.PI);
            
            onStartRotation(table.id, 'table', { x: pivotX, y: pivotY }, initialMouseAngleDeg, event);
        }
    }
  };
  
  const renderSlots = () => {
    let slotLayoutClasses = '';
    switch (table.capacity) {
      case 1: slotLayoutClasses = 'flex items-center justify-center'; break;
      case 2: slotLayoutClasses = 'grid grid-cols-2'; break;
      case 4: slotLayoutClasses = 'grid grid-cols-2 grid-rows-2'; break;
    }

    // Using p-1 on slot container, which is 4px.
    const slotContainerPaddingClass = `p-1`; 

    return (
      <div 
        className={`w-full h-full ${slotLayoutClasses} gap-0.5 ${slotContainerPaddingClass}`} // gap-0.5 = 2px
      >
        {table.studentSlots.map((slot) => {
          const student = getStudentById(slot.studentId, students);
          const slotBgColor = student ? 'bg-blue-100' : 'bg-gray-100';
          const currentDisplayRotationForText = displayRotation % 360;
          const isTableVerticalForText = currentDisplayRotationForText === 90 || currentDisplayRotationForText === 270 || currentDisplayRotationForText === -90 || currentDisplayRotationForText === -270;
          
          const slotInternalPadding = 2; // p-0.5 for each slot

          const contentWrapperStyle: React.CSSProperties = {
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            width: isTableVerticalForText ? `${TABLE_SLOT_HEIGHT - slotInternalPadding * 2}px` : '100%',
            height: isTableVerticalForText ? `${TABLE_SLOT_WIDTH - slotInternalPadding * 2}px` : '100%',
            transformOrigin: 'center center',
          };

          if (isTableVerticalForText) {
            if (currentDisplayRotationForText === 90 || currentDisplayRotationForText === -270) {
                 contentWrapperStyle.transform = 'rotate(90deg)';
            } else if (currentDisplayRotationForText === 270 || currentDisplayRotationForText === -90) {
                 contentWrapperStyle.transform = 'rotate(-90deg)';
            }
          } else if (currentDisplayRotationForText === 180 || currentDisplayRotationForText === -180) {
             contentWrapperStyle.transform = 'rotate(180deg)';
          }


          return (
            <div
              key={slot.id}
              className={`${slotBgColor} border border-gray-300 rounded flex items-center justify-center p-0.5 overflow-hidden`} 
              style={{ width: `${TABLE_SLOT_WIDTH}px`, height: `${TABLE_SLOT_HEIGHT}px` }}
              title={student ? `${student.name}\n${student.nationality}\nEng: ${student.englishAbility} | ${student.gender}` : 'Empty Slot'}
            >
              <div style={contentWrapperStyle}>
                {student ? (
                  <>
                    <div className="font-semibold truncate w-full leading-tight" style={{fontSize: '0.85rem', marginBottom: '1px'}}>{student.name}</div>
                    <div className="text-gray-600 truncate w-full leading-tight" style={{fontSize: '0.72rem', marginBottom: '1px'}}>{student.nationality}</div>
                    <div className="text-gray-500 leading-tight" style={{fontSize: '0.65rem'}}>L:{student.englishAbility} G:{student.gender.substring(0,1).toUpperCase()}</div>
                  </>
                ) : (
                  <span className="text-gray-400 text-[0.78rem]">Empty</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      style={{ position: 'absolute', left: `${table.x}px`, top: `${table.y}px` }}
      onClick={(e: ReactMouseEvent<HTMLDivElement>) => { if (!isBeingRotated) onClick(table.id, e); }}
      ref={tableRef} 
    >
      <DraggableItem
        id={table.id}
        initialX={0} 
        initialY={0} 
        onDragStop={(id, deltaX, deltaY) => onMove(id, table.x + deltaX, table.y + deltaY)} 
        itemType="table"
        containerId={layoutContainerId}
        className="cursor-grab" // Minimal styling on DraggableItem itself
      >
        {/* This child div gets the border and rotation */}
        <div
          className={`border-2 ${isSelected ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-400'} rounded-md shadow-md bg-white hover:shadow-lg transition-shadow flex items-center justify-center`}
          style={{
            width: `${unrotatedWidth}px`,
            height: `${unrotatedHeight}px`,
            transform: `rotate(${displayRotation}deg)`,
            transformOrigin: 'center center',
            overflow: 'hidden', // Important for rotated content
          }}
        >
          {renderSlots()}
        </div>
      </DraggableItem>
      {isSelected && !activeRotationOp && selectedItemIds && selectedItemIds.length === 1 && selectedItemIds[0] === table.id && (
         <div 
            onMouseDown={handleRotationMouseDown}
            className="absolute top-1 right-1 p-1 bg-blue-500 text-white rounded-full cursor-alias hover:bg-blue-700 shadow-lg z-10"
            title="Rotate table"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </div>
        )}
    </div>
  );
};

export default TableComponent;
