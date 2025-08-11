
import React, { MouseEvent as ReactMouseEvent } from 'react';
import { TeacherDesk as TeacherDeskType } from '../types';
import { TEACHER_DESK_WIDTH, TEACHER_DESK_HEIGHT } from '../constants';
import DraggableItem from './DraggableItem';

interface TeacherDeskProps {
  desk: TeacherDeskType;
  onMove: (id: string, x: number, y: number) => void;
  onClick: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  isSelected: boolean;
  layoutContainerId: string;
}

const TeacherDesk: React.FC<TeacherDeskProps> = ({ desk, onMove, onClick, isSelected, layoutContainerId }) => {
  const borderColor = isSelected ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-700';

  return (
    <div 
      // Removed data-item-id and data-item-type
      style={{ position: 'absolute', left: `${desk.x}px`, top: `${desk.y}px` }}
      onClick={(e: ReactMouseEvent<HTMLDivElement>) => onClick(desk.id, e)}
    >
      <DraggableItem
        id={desk.id}
        initialX={0} 
        initialY={0} 
        onDragStop={(id, x, y) => onMove(id, desk.x + x, desk.y + y)}
        itemType="teacherDesk"
        containerId={layoutContainerId}
        className={`border-2 ${borderColor} bg-amber-200 rounded-lg shadow-lg flex items-center justify-center p-2 hover:shadow-xl transition-shadow text-sm font-medium text-amber-800`}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
              width: `${TEACHER_DESK_WIDTH}px`,
              height: `${TEACHER_DESK_HEIGHT}px`,
          }}
        >
          Teacher's Desk
        </div>
      </DraggableItem>
    </div>
  );
};

export default TeacherDesk;
