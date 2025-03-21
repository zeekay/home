
import React from 'react';
import Terminal from './Terminal';

const TerminalContent: React.FC = () => {
  return (
    <Terminal 
      className="w-full h-full rounded-none" 
      customFontSize={14}
      customPadding={16}
      customTheme="dark"
    />
  );
};

export default TerminalContent;
