import React from 'react';

interface DraggableItemProps {
  id: string;
  initialX: number;
  initialY: number;
  onDragStop: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
  itemType: string; // 'table' | 'teacherDesk'
  className?: string;
  containerId: string; // ID of the droppable container
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, initialX, initialY, onDragStop, children, itemType, className, containerId }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const dragData = {
      itemId: id,
      type: itemType,
      offsetX: offsetX,
      offsetY: offsetY,
      itemWidth: rect.width, // Actual rendered width of the element being dragged
      itemHeight: rect.height // Actual rendered height
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    // onDragStop is called by the container's onDrop handler
  };

  return (
    <div
      id={`draggable-${id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`absolute cursor-grab ${isDragging ? 'opacity-70 shadow-2xl scale-105' : ''} transition-all duration-100 ease-in-out ${className}`}
      style={{
        left: `${initialX}px`,
        top: `${initialY}px`,
        touchAction: 'none', 
      }}
    >
      {children}
    </div>
  );
};

export default DraggableItem;