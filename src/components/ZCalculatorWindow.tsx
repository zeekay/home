import React, { useState, useCallback } from 'react';
import ZWindow from './ZWindow';

interface ZCalculatorWindowProps {
  onClose: () => void;
}

const ZCalculatorWindow: React.FC<ZCalculatorWindowProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, operation, previousValue]);

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = previousValue / inputValue;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, operation, previousValue]);

  const buttonClass = "flex items-center justify-center text-2xl font-light rounded-full transition-all active:scale-95";

  const numberButton = `${buttonClass} bg-[#505050] hover:bg-[#6a6a6a] text-white`;
  const operatorButton = `${buttonClass} bg-[#ff9f0a] hover:bg-[#ffb340] text-white`;
  const functionButton = `${buttonClass} bg-[#a5a5a5] hover:bg-[#c5c5c5] text-black`;

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.length > 9) {
      return num.toExponential(4);
    }
    return value;
  };

  return (
    <ZWindow
      title="Calculator"
      onClose={onClose}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={{ width: 240, height: 360 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-[#1c1c1c] select-none">
        {/* Display */}
        <div className="flex-shrink-0 h-24 flex items-end justify-end px-6 pb-2">
          <span className="text-white text-5xl font-light truncate">
            {formatDisplay(display)}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="flex-1 grid grid-cols-4 gap-[1px] p-[1px]">
          {/* Row 1 */}
          <button className={functionButton} onClick={clear}>
            {previousValue ? 'C' : 'AC'}
          </button>
          <button className={functionButton} onClick={toggleSign}>±</button>
          <button className={functionButton} onClick={inputPercent}>%</button>
          <button
            className={`${operatorButton} ${operation === '÷' && waitingForOperand ? 'bg-white text-[#ff9f0a]' : ''}`}
            onClick={() => performOperation('÷')}
          >÷</button>

          {/* Row 2 */}
          <button className={numberButton} onClick={() => inputDigit('7')}>7</button>
          <button className={numberButton} onClick={() => inputDigit('8')}>8</button>
          <button className={numberButton} onClick={() => inputDigit('9')}>9</button>
          <button
            className={`${operatorButton} ${operation === '×' && waitingForOperand ? 'bg-white text-[#ff9f0a]' : ''}`}
            onClick={() => performOperation('×')}
          >×</button>

          {/* Row 3 */}
          <button className={numberButton} onClick={() => inputDigit('4')}>4</button>
          <button className={numberButton} onClick={() => inputDigit('5')}>5</button>
          <button className={numberButton} onClick={() => inputDigit('6')}>6</button>
          <button
            className={`${operatorButton} ${operation === '-' && waitingForOperand ? 'bg-white text-[#ff9f0a]' : ''}`}
            onClick={() => performOperation('-')}
          >−</button>

          {/* Row 4 */}
          <button className={numberButton} onClick={() => inputDigit('1')}>1</button>
          <button className={numberButton} onClick={() => inputDigit('2')}>2</button>
          <button className={numberButton} onClick={() => inputDigit('3')}>3</button>
          <button
            className={`${operatorButton} ${operation === '+' && waitingForOperand ? 'bg-white text-[#ff9f0a]' : ''}`}
            onClick={() => performOperation('+')}
          >+</button>

          {/* Row 5 */}
          <button
            className={`${numberButton} col-span-2`}
            onClick={() => inputDigit('0')}
          >0</button>
          <button className={numberButton} onClick={inputDecimal}>.</button>
          <button className={operatorButton} onClick={calculate}>=</button>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZCalculatorWindow;
