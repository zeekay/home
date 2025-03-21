
import React, { useState } from 'react';
import MacWindow from './MacWindow';
import Terminal from './Terminal';

interface MacTerminalWindowProps {
  onClose: () => void;
}

const MacTerminalWindow: React.FC<MacTerminalWindowProps> = ({ onClose }) => {
  const [customFontSize, setCustomFontSize] = useState(14);
  const [customPadding, setCustomPadding] = useState(16);
  const [customTheme, setCustomTheme] = useState('dark');

  return (
    <MacWindow
      title="Terminal – bash"
      onClose={onClose}
      initialPosition={{ x: 50, y: 50 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="terminal"
      className="z-50"
    >
      <Terminal 
        className="w-full h-full rounded-none" 
        customFontSize={customFontSize}
        customPadding={customPadding}
        customTheme={customTheme}
      />
    </MacWindow>
  );
};

export default MacTerminalWindow;
