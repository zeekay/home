
import React from 'react';

interface WindowResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
}

const WindowResizeHandle: React.FC<WindowResizeHandleProps> = ({ onResizeStart }) => {
  return (
    <div 
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
      onMouseDown={onResizeStart}
    >
      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-400 border-r-[6px] border-r-gray-400 absolute bottom-1 right-1" />
    </div>
  );
};

export default WindowResizeHandle;
