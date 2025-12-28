import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ZWindow from './ZWindow';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { Copy, Check, ChevronDown, History, X } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type CalculatorMode = 'basic' | 'scientific' | 'programmer' | 'converter';
type AngleUnit = 'deg' | 'rad';
type NumberBase = 'bin' | 'oct' | 'dec' | 'hex';
type WordSize = 8 | 16 | 32 | 64;

interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

interface ConversionCategory {
  name: string;
  units: { id: string; name: string; symbol: string; factor: number }[];
}

// ============================================================================
// Constants
// ============================================================================

const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    name: 'Length',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', factor: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', factor: 1609.344 },
    ],
  },
  {
    name: 'Area',
    units: [
      { id: 'mm2', name: 'Square mm', symbol: 'mm2', factor: 0.000001 },
      { id: 'cm2', name: 'Square cm', symbol: 'cm2', factor: 0.0001 },
      { id: 'm2', name: 'Square m', symbol: 'm2', factor: 1 },
      { id: 'km2', name: 'Square km', symbol: 'km2', factor: 1000000 },
      { id: 'in2', name: 'Square in', symbol: 'in2', factor: 0.00064516 },
      { id: 'ft2', name: 'Square ft', symbol: 'ft2', factor: 0.092903 },
      { id: 'ac', name: 'Acre', symbol: 'ac', factor: 4046.86 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', factor: 10000 },
    ],
  },
  {
    name: 'Volume',
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', factor: 1 },
      { id: 'm3', name: 'Cubic m', symbol: 'm3', factor: 1000 },
      { id: 'gal', name: 'US Gallon', symbol: 'gal', factor: 3.78541 },
      { id: 'qt', name: 'US Quart', symbol: 'qt', factor: 0.946353 },
      { id: 'pt', name: 'US Pint', symbol: 'pt', factor: 0.473176 },
      { id: 'cup', name: 'US Cup', symbol: 'cup', factor: 0.236588 },
      { id: 'floz', name: 'US Fl Oz', symbol: 'fl oz', factor: 0.0295735 },
    ],
  },
  {
    name: 'Weight',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { id: 'g', name: 'Gram', symbol: 'g', factor: 0.001 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 't', name: 'Metric Ton', symbol: 't', factor: 1000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
      { id: 'lb', name: 'Pound', symbol: 'lb', factor: 0.453592 },
      { id: 'st', name: 'Stone', symbol: 'st', factor: 6.35029 },
    ],
  },
  {
    name: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius', symbol: 'C', factor: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: 'F', factor: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', factor: 1 },
    ],
  },
  {
    name: 'Time',
    units: [
      { id: 'ms', name: 'Millisecond', symbol: 'ms', factor: 0.001 },
      { id: 's', name: 'Second', symbol: 's', factor: 1 },
      { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
      { id: 'hr', name: 'Hour', symbol: 'hr', factor: 3600 },
      { id: 'day', name: 'Day', symbol: 'day', factor: 86400 },
      { id: 'wk', name: 'Week', symbol: 'wk', factor: 604800 },
      { id: 'mo', name: 'Month (30d)', symbol: 'mo', factor: 2592000 },
      { id: 'yr', name: 'Year (365d)', symbol: 'yr', factor: 31536000 },
    ],
  },
  {
    name: 'Speed',
    units: [
      { id: 'mps', name: 'Meters/sec', symbol: 'm/s', factor: 1 },
      { id: 'kph', name: 'km/hour', symbol: 'km/h', factor: 0.277778 },
      { id: 'mph', name: 'Miles/hour', symbol: 'mph', factor: 0.44704 },
      { id: 'fps', name: 'Feet/sec', symbol: 'ft/s', factor: 0.3048 },
      { id: 'kn', name: 'Knot', symbol: 'kn', factor: 0.514444 },
    ],
  },
  {
    name: 'Data',
    units: [
      { id: 'b', name: 'Bit', symbol: 'b', factor: 1 },
      { id: 'B', name: 'Byte', symbol: 'B', factor: 8 },
      { id: 'KB', name: 'Kilobyte', symbol: 'KB', factor: 8192 },
      { id: 'MB', name: 'Megabyte', symbol: 'MB', factor: 8388608 },
      { id: 'GB', name: 'Gigabyte', symbol: 'GB', factor: 8589934592 },
      { id: 'TB', name: 'Terabyte', symbol: 'TB', factor: 8796093022208 },
    ],
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

const formatNumber = (num: number, precision = 10): string => {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Handle very small numbers
  if (Math.abs(num) < 1e-10 && num !== 0) {
    return num.toExponential(precision - 1);
  }

  // Handle very large numbers
  if (Math.abs(num) >= 1e10) {
    return num.toExponential(precision - 1);
  }

  // Regular formatting with thousands separator
  const formatted = parseFloat(num.toPrecision(precision));
  return formatted.toLocaleString('en-US', { maximumFractionDigits: 10 });
};

const formatWithThousands = (value: string): string => {
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return value;

  const parts = value.split('.');
  const intPart = parts[0].replace(/,/g, '');
  const decPart = parts[1];

  const formattedInt = parseInt(intPart).toLocaleString('en-US');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

const parseDisplayValue = (display: string): number => {
  return parseFloat(display.replace(/,/g, ''));
};

const convertBase = (value: number, toBase: NumberBase): string => {
  const int = Math.floor(Math.abs(value));
  const isNeg = value < 0;
  let result: string;

  switch (toBase) {
    case 'bin': result = int.toString(2); break;
    case 'oct': result = int.toString(8); break;
    case 'hex': result = int.toString(16).toUpperCase(); break;
    default: result = int.toString(10);
  }

  return isNeg ? `-${result}` : result;
};

const applyWordSize = (value: number, wordSize: WordSize): number => {
  const mask = BigInt(2 ** wordSize) - BigInt(1);
  return Number(BigInt(Math.floor(value)) & mask);
};

const convertTemperature = (value: number, from: string, to: string): number => {
  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case 'f': celsius = (value - 32) * 5/9; break;
    case 'k': celsius = value - 273.15; break;
    default: celsius = value;
  }

  // Convert from Celsius to target
  switch (to) {
    case 'f': return celsius * 9/5 + 32;
    case 'k': return celsius + 273.15;
    default: return celsius;
  }
};

// ============================================================================
// Component Props
// ============================================================================

interface ZCalculatorWindowProps {
  onClose: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

const ZCalculatorWindow: React.FC<ZCalculatorWindowProps> = ({ onClose }) => {
  // ----- State -----
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  // Memory
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState(false);

  // Scientific mode
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [isSecondFn, setIsSecondFn] = useState(false);

  // Programmer mode
  const [numberBase, setNumberBase] = useState<NumberBase>('dec');
  const [wordSize, setWordSize] = useState<WordSize>(64);

  // Converter mode
  const [convCategory, setConvCategory] = useState(0);
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [convInput, setConvInput] = useState('0');

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Clipboard
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // ----- Computed values -----
  const currentCategory = CONVERSION_CATEGORIES[convCategory];

  const conversionResult = useMemo(() => {
    if (mode !== 'converter') return '0';

    const inputVal = parseFloat(convInput) || 0;
    const fromUnitData = currentCategory.units[fromUnit];
    const toUnitData = currentCategory.units[toUnit];

    // Special handling for temperature
    if (currentCategory.name === 'Temperature') {
      const result = convertTemperature(inputVal, fromUnitData.id, toUnitData.id);
      return formatNumber(result);
    }

    // Standard conversion via base unit
    const baseValue = inputVal * fromUnitData.factor;
    const result = baseValue / toUnitData.factor;
    return formatNumber(result);
  }, [mode, convInput, convCategory, fromUnit, toUnit, currentCategory]);

  // Programmer mode display values
  const programmerDisplays = useMemo(() => {
    if (mode !== 'programmer') return { bin: '0', oct: '0', dec: '0', hex: '0' };

    const value = applyWordSize(parseDisplayValue(display), wordSize);
    return {
      bin: convertBase(value, 'bin'),
      oct: convertBase(value, 'oct'),
      dec: convertBase(value, 'dec'),
      hex: convertBase(value, 'hex'),
    };
  }, [display, mode, wordSize]);

  // ASCII display for programmer mode
  const asciiChar = useMemo(() => {
    if (mode !== 'programmer') return '';
    const value = parseDisplayValue(display);
    if (value >= 32 && value <= 126) {
      return String.fromCharCode(value);
    }
    return '';
  }, [display, mode]);

  // ----- Callbacks -----

  const clearAll = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setJustCalculated(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback((digit: string) => {
    // Validate digit for current base in programmer mode
    if (mode === 'programmer') {
      const validDigits: Record<NumberBase, string> = {
        bin: '01',
        oct: '01234567',
        dec: '0123456789',
        hex: '0123456789ABCDEF',
      };
      if (!validDigits[numberBase].includes(digit.toUpperCase())) return;
    }

    if (waitingForOperand || justCalculated) {
      setDisplay(digit);
      setWaitingForOperand(false);
      setJustCalculated(false);
    } else {
      const raw = display.replace(/,/g, '');
      setDisplay(raw === '0' ? digit : formatWithThousands(raw + digit));
    }
  }, [display, waitingForOperand, justCalculated, mode, numberBase]);

  const inputDecimal = useCallback(() => {
    if (mode === 'programmer') return; // No decimals in programmer mode

    if (waitingForOperand || justCalculated) {
      setDisplay('0.');
      setWaitingForOperand(false);
      setJustCalculated(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, justCalculated, mode]);

  const toggleSign = useCallback(() => {
    const value = parseDisplayValue(display);
    setDisplay(formatNumber(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseDisplayValue(display);
    if (previousValue !== null && operation) {
      // Percentage of previous value
      setDisplay(formatNumber((previousValue * value) / 100));
    } else {
      setDisplay(formatNumber(value / 100));
    }
  }, [display, previousValue, operation]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseDisplayValue(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${formatNumber(inputValue)} ${nextOperation}`);
    } else if (operation && !waitingForOperand) {
      const currentValue = previousValue;
      let result: number;

      switch (operation) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case 'x': result = currentValue * inputValue; break;
        case '/': result = inputValue !== 0 ? currentValue / inputValue : NaN; break;
        case 'x^y': result = Math.pow(currentValue, inputValue); break;
        case 'mod': result = currentValue % inputValue; break;
        case 'AND': result = applyWordSize(currentValue & inputValue, wordSize); break;
        case 'OR': result = applyWordSize(currentValue | inputValue, wordSize); break;
        case 'XOR': result = applyWordSize(currentValue ^ inputValue, wordSize); break;
        case '<<': result = applyWordSize(currentValue << inputValue, wordSize); break;
        case '>>': result = applyWordSize(currentValue >>> inputValue, wordSize); break;
        default: result = inputValue;
      }

      setDisplay(formatNumber(result));
      setPreviousValue(result);
      setExpression(`${formatNumber(result)} ${nextOperation}`);
    } else {
      setExpression(`${formatNumber(previousValue)} ${nextOperation}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setJustCalculated(false);
  }, [display, operation, previousValue, waitingForOperand, wordSize]);

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;

    const inputValue = parseDisplayValue(display);
    let result: number;

    switch (operation) {
      case '+': result = previousValue + inputValue; break;
      case '-': result = previousValue - inputValue; break;
      case 'x': result = previousValue * inputValue; break;
      case '/': result = inputValue !== 0 ? previousValue / inputValue : NaN; break;
      case 'x^y': result = Math.pow(previousValue, inputValue); break;
      case 'mod': result = previousValue % inputValue; break;
      case 'AND': result = applyWordSize(previousValue & inputValue, wordSize); break;
      case 'OR': result = applyWordSize(previousValue | inputValue, wordSize); break;
      case 'XOR': result = applyWordSize(previousValue ^ inputValue, wordSize); break;
      case '<<': result = applyWordSize(previousValue << inputValue, wordSize); break;
      case '>>': result = applyWordSize(previousValue >>> inputValue, wordSize); break;
      default: return;
    }

    const fullExpression = `${formatNumber(previousValue)} ${operation} ${formatNumber(inputValue)}`;

    // Add to history
    setHistory(prev => [{
      id: Date.now().toString(),
      expression: fullExpression,
      result: formatNumber(result),
      timestamp: new Date(),
    }, ...prev.slice(0, 99)]);

    setDisplay(formatNumber(result));
    setExpression(`${fullExpression} =`);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    setJustCalculated(true);
  }, [display, operation, previousValue, wordSize]);

  // Scientific functions
  const applyScientific = useCallback((fn: string) => {
    const value = parseDisplayValue(display);
    let result: number;

    switch (fn) {
      // Trig functions
      case 'sin':
        result = angleUnit === 'deg' ? Math.sin(toRadians(value)) : Math.sin(value);
        break;
      case 'cos':
        result = angleUnit === 'deg' ? Math.cos(toRadians(value)) : Math.cos(value);
        break;
      case 'tan':
        result = angleUnit === 'deg' ? Math.tan(toRadians(value)) : Math.tan(value);
        break;
      case 'asin':
        result = angleUnit === 'deg' ? toDegrees(Math.asin(value)) : Math.asin(value);
        break;
      case 'acos':
        result = angleUnit === 'deg' ? toDegrees(Math.acos(value)) : Math.acos(value);
        break;
      case 'atan':
        result = angleUnit === 'deg' ? toDegrees(Math.atan(value)) : Math.atan(value);
        break;
      case 'sinh':
        result = Math.sinh(value);
        break;
      case 'cosh':
        result = Math.cosh(value);
        break;
      case 'tanh':
        result = Math.tanh(value);
        break;
      case 'asinh':
        result = Math.asinh(value);
        break;
      case 'acosh':
        result = Math.acosh(value);
        break;
      case 'atanh':
        result = Math.atanh(value);
        break;

      // Logarithms
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'log2':
        result = Math.log2(value);
        break;

      // Powers and roots
      case 'x^2':
        result = value * value;
        break;
      case 'x^3':
        result = value * value * value;
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'cbrt':
        result = Math.cbrt(value);
        break;
      case 'e^x':
        result = Math.exp(value);
        break;
      case '10^x':
        result = Math.pow(10, value);
        break;
      case '2^x':
        result = Math.pow(2, value);
        break;
      case '1/x':
        result = 1 / value;
        break;

      // Other
      case '!':
        result = factorial(Math.floor(value));
        break;
      case '|x|':
        result = Math.abs(value);
        break;
      case 'rand':
        result = Math.random();
        break;

      default:
        return;
    }

    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
    setIsSecondFn(false);
  }, [display, angleUnit]);

  const insertConstant = useCallback((constant: string) => {
    let value: number;
    switch (constant) {
      case 'pi': value = Math.PI; break;
      case 'e': value = Math.E; break;
      default: return;
    }
    setDisplay(formatNumber(value));
    setWaitingForOperand(true);
  }, []);

  // Memory functions
  const memoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
  }, []);

  const memoryRecall = useCallback(() => {
    setDisplay(formatNumber(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const memoryAdd = useCallback(() => {
    setMemory(prev => prev + parseDisplayValue(display));
    setHasMemory(true);
  }, [display]);

  const memorySubtract = useCallback(() => {
    setMemory(prev => prev - parseDisplayValue(display));
    setHasMemory(true);
  }, [display]);

  const memoryStore = useCallback(() => {
    setMemory(parseDisplayValue(display));
    setHasMemory(true);
  }, [display]);

  // Programmer mode functions
  const bitwiseNot = useCallback(() => {
    const value = parseDisplayValue(display);
    const result = applyWordSize(~value, wordSize);
    setDisplay(formatNumber(result));
  }, [display, wordSize]);

  // Copy to clipboard
  const copyResult = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(display.replace(/,/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error('Failed to copy');
    }
  }, [display]);

  // Use history entry
  const useHistoryEntry = useCallback((entry: HistoryEntry) => {
    setDisplay(entry.result.replace(/,/g, ''));
    setShowHistory(false);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Keyboard shortcuts for mode switching
  useKeyboardShortcuts({
    shortcuts: [
      { key: '1', meta: true, action: () => setMode('basic'), description: 'Basic mode' },
      { key: '2', meta: true, action: () => setMode('scientific'), description: 'Scientific mode' },
      { key: '3', meta: true, action: () => setMode('programmer'), description: 'Programmer mode' },
      { key: '4', meta: true, action: () => setMode('converter'), description: 'Converter mode' },
      { key: 'c', meta: true, action: copyResult, description: 'Copy result' },
      { key: 't', meta: true, action: () => setShowHistory(prev => !prev), description: 'Toggle history' },
    ],
  });

  // Keyboard input for calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if using modifier keys (except shift for special chars)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Skip if target is input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key;

      // Digits
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        inputDigit(key);
        return;
      }

      // Hex digits in programmer mode
      if (mode === 'programmer' && numberBase === 'hex' && /^[a-fA-F]$/.test(key)) {
        e.preventDefault();
        inputDigit(key.toUpperCase());
        return;
      }

      // Operations
      switch (key) {
        case '+':
          e.preventDefault();
          performOperation('+');
          break;
        case '-':
          e.preventDefault();
          performOperation('-');
          break;
        case '*':
          e.preventDefault();
          performOperation('x');
          break;
        case '/':
          e.preventDefault();
          performOperation('/');
          break;
        case '%':
          e.preventDefault();
          inputPercent();
          break;
        case '.':
        case ',':
          e.preventDefault();
          inputDecimal();
          break;
        case 'Enter':
        case '=':
          e.preventDefault();
          calculate();
          break;
        case 'Escape':
          e.preventDefault();
          clearAll();
          break;
        case 'Backspace':
          e.preventDefault();
          if (display.length > 1) {
            const raw = display.replace(/,/g, '');
            setDisplay(formatWithThousands(raw.slice(0, -1)));
          } else {
            setDisplay('0');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, inputPercent, calculate, clearAll, display, mode, numberBase]);

  // Reset to decimal when leaving programmer mode
  useEffect(() => {
    if (mode !== 'programmer') {
      setNumberBase('dec');
    }
  }, [mode]);

  // ----- Button Styles -----
  const btnBase = "flex items-center justify-center font-medium rounded-lg transition-all active:scale-95 select-none";
  const btnNumber = `${btnBase} bg-[#505050] hover:bg-[#6a6a6a] text-white`;
  const btnOperator = `${btnBase} bg-[#ff9f0a] hover:bg-[#ffb340] text-white`;
  const btnFunction = `${btnBase} bg-[#a5a5a5] hover:bg-[#c5c5c5] text-black`;
  const btnScientific = `${btnBase} bg-[#3a3a3c] hover:bg-[#4a4a4c] text-white text-sm`;

  // ----- Window Size by Mode -----
  const getWindowSize = () => {
    switch (mode) {
      case 'scientific': return { width: 360, height: 520 };
      case 'programmer': return { width: 380, height: 520 };
      case 'converter': return { width: 340, height: 420 };
      default: return { width: 260, height: 400 };
    }
  };

  // ----- Render Functions -----

  const renderModeSelector = () => (
    <div className="flex gap-1 px-2 py-1.5 bg-[#2a2a2c] border-b border-white/5">
      {[
        { id: 'basic', label: 'Basic', shortcut: '1' },
        { id: 'scientific', label: 'Scientific', shortcut: '2' },
        { id: 'programmer', label: 'Programmer', shortcut: '3' },
        { id: 'converter', label: 'Convert', shortcut: '4' },
      ].map(m => (
        <button
          key={m.id}
          onClick={() => setMode(m.id as CalculatorMode)}
          className={cn(
            "flex-1 py-1 px-2 text-xs rounded transition-colors",
            mode === m.id
              ? "bg-[#ff9f0a] text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          title={`Cmd+${m.shortcut}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  const renderDisplay = () => {
    const displayValue = mode === 'programmer' && numberBase !== 'dec'
      ? programmerDisplays[numberBase]
      : display;

    return (
      <div className="flex-shrink-0 px-4 py-2 bg-[#1c1c1c]">
        {/* Expression preview */}
        {expression && (
          <div className="text-right text-white/40 text-sm truncate mb-1">
            {expression}
          </div>
        )}

        {/* Main display */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-center gap-1">
            {hasMemory && (
              <span className="text-xs text-white/40 bg-white/10 px-1 rounded">M</span>
            )}
            {mode === 'scientific' && (
              <span className="text-xs text-white/40">{angleUnit.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 text-right">
            <span className={cn(
              "text-white font-light truncate block",
              displayValue.length > 12 ? "text-3xl" :
              displayValue.length > 9 ? "text-4xl" : "text-5xl"
            )}>
              {displayValue}
            </span>
            {mode === 'programmer' && asciiChar && (
              <span className="text-white/40 text-xs">ASCII: '{asciiChar}'</span>
            )}
          </div>
          <button
            onClick={copyResult}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Copy (Cmd+C)"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-white/40" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderBasicMode = () => (
    <div className="flex-1 grid grid-cols-4 gap-1 p-1">
      <button className={btnFunction} onClick={previousValue ? clearEntry : clearAll}>
        {previousValue ? 'C' : 'AC'}
      </button>
      <button className={btnFunction} onClick={toggleSign}>+/-</button>
      <button className={btnFunction} onClick={inputPercent}>%</button>
      <button className={cn(btnOperator, operation === '/' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('/')}>÷</button>

      <button className={btnNumber} onClick={() => inputDigit('7')}>7</button>
      <button className={btnNumber} onClick={() => inputDigit('8')}>8</button>
      <button className={btnNumber} onClick={() => inputDigit('9')}>9</button>
      <button className={cn(btnOperator, operation === 'x' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('x')}>x</button>

      <button className={btnNumber} onClick={() => inputDigit('4')}>4</button>
      <button className={btnNumber} onClick={() => inputDigit('5')}>5</button>
      <button className={btnNumber} onClick={() => inputDigit('6')}>6</button>
      <button className={cn(btnOperator, operation === '-' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('-')}>-</button>

      <button className={btnNumber} onClick={() => inputDigit('1')}>1</button>
      <button className={btnNumber} onClick={() => inputDigit('2')}>2</button>
      <button className={btnNumber} onClick={() => inputDigit('3')}>3</button>
      <button className={cn(btnOperator, operation === '+' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('+')}>+</button>

      <button className={`${btnNumber} col-span-2`} onClick={() => inputDigit('0')}>0</button>
      <button className={btnNumber} onClick={inputDecimal}>.</button>
      <button className={btnOperator} onClick={calculate}>=</button>
    </div>
  );

  const renderScientificMode = () => (
    <div className="flex-1 flex flex-col gap-1 p-1">
      {/* Scientific function row */}
      <div className="grid grid-cols-5 gap-1">
        <button
          className={cn(btnScientific, isSecondFn && "bg-[#ff9f0a] text-white")}
          onClick={() => setIsSecondFn(!isSecondFn)}
        >
          2nd
        </button>
        <button
          className={cn(btnScientific, angleUnit === 'rad' && "bg-blue-600")}
          onClick={() => setAngleUnit(prev => prev === 'deg' ? 'rad' : 'deg')}
        >
          {angleUnit.toUpperCase()}
        </button>
        <button className={btnScientific} onClick={() => insertConstant('pi')}>pi</button>
        <button className={btnScientific} onClick={() => insertConstant('e')}>e</button>
        <button className={btnScientific} onClick={() => applyScientific('rand')}>Rand</button>
      </div>

      {/* Memory row */}
      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={memoryClear}>mc</button>
        <button className={btnScientific} onClick={memoryAdd}>m+</button>
        <button className={btnScientific} onClick={memorySubtract}>m-</button>
        <button className={cn(btnScientific, hasMemory && "text-[#ff9f0a]")} onClick={memoryRecall}>mr</button>
        <button className={btnScientific} onClick={memoryStore}>ms</button>
      </div>

      {/* Function rows */}
      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'sinh' : 'sin')}>
          {isSecondFn ? 'sinh' : 'sin'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'cosh' : 'cos')}>
          {isSecondFn ? 'cosh' : 'cos'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'tanh' : 'tan')}>
          {isSecondFn ? 'tanh' : 'tan'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'asinh' : 'asin')}>
          {isSecondFn ? 'asinh' : 'asin'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'acosh' : 'acos')}>
          {isSecondFn ? 'acosh' : 'acos'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'atanh' : 'atan')}>
          {isSecondFn ? 'atanh' : 'atan'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? 'log2' : 'log')}>
          {isSecondFn ? 'log2' : 'log'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific('ln')}>ln</button>
        <button className={btnScientific} onClick={() => applyScientific(isSecondFn ? '2^x' : '10^x')}>
          {isSecondFn ? '2^x' : '10^x'}
        </button>
        <button className={btnScientific} onClick={() => applyScientific('e^x')}>e^x</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => applyScientific('x^2')}>x^2</button>
        <button className={btnScientific} onClick={() => applyScientific('x^3')}>x^3</button>
        <button className={btnScientific} onClick={() => performOperation('x^y')}>x^y</button>
        <button className={btnScientific} onClick={() => applyScientific('sqrt')}>sqrt</button>
        <button className={btnScientific} onClick={() => applyScientific('cbrt')}>cbrt</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => applyScientific('1/x')}>1/x</button>
        <button className={btnScientific} onClick={() => applyScientific('!')}>x!</button>
        <button className={btnScientific} onClick={() => applyScientific('|x|')}>|x|</button>
        <button className={btnScientific} onClick={() => performOperation('mod')}>mod</button>
        <button className={btnScientific} onClick={() => setShowHistory(true)}>
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Standard buttons */}
      <div className="grid grid-cols-5 gap-1">
        <button className={btnFunction} onClick={previousValue ? clearEntry : clearAll}>
          {previousValue ? 'C' : 'AC'}
        </button>
        <button className={btnFunction} onClick={toggleSign}>+/-</button>
        <button className={btnFunction} onClick={inputPercent}>%</button>
        <button className={btnScientific}>(</button>
        <button className={btnScientific}>)</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnNumber} onClick={() => inputDigit('7')}>7</button>
        <button className={btnNumber} onClick={() => inputDigit('8')}>8</button>
        <button className={btnNumber} onClick={() => inputDigit('9')}>9</button>
        <button className={cn(btnOperator, operation === '/' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('/')}>÷</button>
        <button className={cn(btnOperator, operation === 'x' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('x')}>x</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnNumber} onClick={() => inputDigit('4')}>4</button>
        <button className={btnNumber} onClick={() => inputDigit('5')}>5</button>
        <button className={btnNumber} onClick={() => inputDigit('6')}>6</button>
        <button className={cn(btnOperator, operation === '-' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('-')}>-</button>
        <button className={cn(btnOperator, operation === '+' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('+')}>+</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnNumber} onClick={() => inputDigit('1')}>1</button>
        <button className={btnNumber} onClick={() => inputDigit('2')}>2</button>
        <button className={btnNumber} onClick={() => inputDigit('3')}>3</button>
        <button className={`${btnOperator} row-span-2`} onClick={calculate}>=</button>
        <button className={btnNumber} onClick={inputDecimal}>.</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={`${btnNumber} col-span-3`} onClick={() => inputDigit('0')}>0</button>
        {/* Empty cell for equals button spanning */}
        <div />
        <button className={btnFunction} onClick={() => {
          const raw = display.replace(/,/g, '');
          if (raw.length > 1) {
            setDisplay(formatWithThousands(raw.slice(0, -1)));
          } else {
            setDisplay('0');
          }
        }}>DEL</button>
      </div>
    </div>
  );

  const renderProgrammerMode = () => (
    <div className="flex-1 flex flex-col gap-1 p-1">
      {/* Base displays */}
      <div className="bg-[#2a2a2c] rounded-lg p-2 space-y-1">
        {(['hex', 'dec', 'oct', 'bin'] as NumberBase[]).map(base => (
          <button
            key={base}
            onClick={() => setNumberBase(base)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1 rounded text-sm transition-colors",
              numberBase === base ? "bg-[#ff9f0a] text-white" : "text-white/60 hover:bg-white/10"
            )}
          >
            <span className="uppercase font-medium w-8">{base}</span>
            <span className={cn(
              "font-mono text-right flex-1 truncate",
              numberBase === base ? "text-white" : "text-white/40"
            )}>
              {programmerDisplays[base]}
            </span>
          </button>
        ))}
      </div>

      {/* Word size selector */}
      <div className="flex gap-1">
        {([8, 16, 32, 64] as WordSize[]).map(size => (
          <button
            key={size}
            onClick={() => setWordSize(size)}
            className={cn(
              "flex-1 py-1 text-xs rounded transition-colors",
              wordSize === size ? "bg-[#ff9f0a] text-white" : "bg-[#3a3a3c] text-white/60 hover:bg-[#4a4a4c]"
            )}
          >
            {size}-bit
          </button>
        ))}
      </div>

      {/* Bit operations */}
      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => performOperation('AND')}>AND</button>
        <button className={btnScientific} onClick={() => performOperation('OR')}>OR</button>
        <button className={btnScientific} onClick={() => performOperation('XOR')}>XOR</button>
        <button className={btnScientific} onClick={bitwiseNot}>NOT</button>
        <button className={btnScientific} onClick={() => performOperation('<<')}>{'<<'}</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button className={btnScientific} onClick={() => performOperation('>>')}>{'>>'}</button>
        <button className={btnScientific} onClick={() => performOperation('mod')}>mod</button>
        <button className={btnFunction} onClick={previousValue ? clearEntry : clearAll}>
          {previousValue ? 'C' : 'AC'}
        </button>
        <button className={btnFunction} onClick={toggleSign}>+/-</button>
        <button className={cn(btnOperator, operation === '/' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('/')}>÷</button>
      </div>

      {/* Hex digits + numbers */}
      <div className="grid grid-cols-5 gap-1">
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('A')}
          disabled={numberBase !== 'hex'}
        >A</button>
        <button className={btnNumber} onClick={() => inputDigit('7')}>7</button>
        <button className={btnNumber} onClick={() => inputDigit('8')}>8</button>
        <button className={btnNumber} onClick={() => inputDigit('9')}>9</button>
        <button className={cn(btnOperator, operation === 'x' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('x')}>x</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('B')}
          disabled={numberBase !== 'hex'}
        >B</button>
        <button className={btnNumber} onClick={() => inputDigit('4')}>4</button>
        <button className={btnNumber} onClick={() => inputDigit('5')}>5</button>
        <button className={btnNumber} onClick={() => inputDigit('6')}>6</button>
        <button className={cn(btnOperator, operation === '-' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('-')}>-</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('C')}
          disabled={numberBase !== 'hex'}
        >C</button>
        <button className={btnNumber} onClick={() => inputDigit('1')}>1</button>
        <button className={btnNumber} onClick={() => inputDigit('2')}>2</button>
        <button className={btnNumber} onClick={() => inputDigit('3')}>3</button>
        <button className={cn(btnOperator, operation === '+' && waitingForOperand && "bg-white text-[#ff9f0a]")} onClick={() => performOperation('+')}>+</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('D')}
          disabled={numberBase !== 'hex'}
        >D</button>
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('E')}
          disabled={numberBase !== 'hex'}
        >E</button>
        <button
          className={cn(btnScientific, numberBase !== 'hex' && "opacity-30 cursor-not-allowed")}
          onClick={() => inputDigit('F')}
          disabled={numberBase !== 'hex'}
        >F</button>
        <button className={`${btnNumber}`} onClick={() => inputDigit('0')}>0</button>
        <button className={btnOperator} onClick={calculate}>=</button>
      </div>
    </div>
  );

  const renderConverterMode = () => (
    <div className="flex-1 flex flex-col gap-2 p-3">
      {/* Category selector */}
      <div className="relative">
        <select
          value={convCategory}
          onChange={(e) => {
            setConvCategory(Number(e.target.value));
            setFromUnit(0);
            setToUnit(1);
          }}
          className="w-full bg-[#3a3a3c] text-white rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:bg-[#4a4a4c] transition-colors"
        >
          {CONVERSION_CATEGORIES.map((cat, i) => (
            <option key={cat.name} value={i}>{cat.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>

      {/* From unit */}
      <div className="bg-[#2a2a2c] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(Number(e.target.value))}
            className="bg-transparent text-white/60 text-sm appearance-none cursor-pointer hover:text-white transition-colors"
          >
            {currentCategory.units.map((unit, i) => (
              <option key={unit.id} value={i}>{unit.name}</option>
            ))}
          </select>
          <span className="text-white/40 text-sm">{currentCategory.units[fromUnit]?.symbol}</span>
        </div>
        <input
          type="text"
          value={convInput}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.-]/g, '');
            setConvInput(val || '0');
          }}
          className="w-full bg-transparent text-white text-3xl font-light text-right outline-none"
          placeholder="0"
        />
      </div>

      {/* Swap button */}
      <button
        onClick={() => {
          const temp = fromUnit;
          setFromUnit(toUnit);
          setToUnit(temp);
          setConvInput(conversionResult.replace(/,/g, ''));
        }}
        className="self-center p-2 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>

      {/* To unit */}
      <div className="bg-[#2a2a2c] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <select
            value={toUnit}
            onChange={(e) => setToUnit(Number(e.target.value))}
            className="bg-transparent text-white/60 text-sm appearance-none cursor-pointer hover:text-white transition-colors"
          >
            {currentCategory.units.map((unit, i) => (
              <option key={unit.id} value={i}>{unit.name}</option>
            ))}
          </select>
          <span className="text-white/40 text-sm">{currentCategory.units[toUnit]?.symbol}</span>
        </div>
        <div className="text-white text-3xl font-light text-right">
          {conversionResult}
        </div>
      </div>

      {/* Number pad for converter */}
      <div className="grid grid-cols-4 gap-1 mt-2">
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '7' : prev + '7')}>7</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '8' : prev + '8')}>8</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '9' : prev + '9')}>9</button>
        <button className={btnFunction} onClick={() => setConvInput('0')}>C</button>

        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '4' : prev + '4')}>4</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '5' : prev + '5')}>5</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '6' : prev + '6')}>6</button>
        <button className={btnFunction} onClick={() => setConvInput(prev => prev.slice(0, -1) || '0')}>DEL</button>

        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '1' : prev + '1')}>1</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '2' : prev + '2')}>2</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev === '0' ? '3' : prev + '3')}>3</button>
        <button
          className={btnFunction}
          onClick={() => setConvInput(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)}
        >+/-</button>

        <button className={`${btnNumber} col-span-2`} onClick={() => setConvInput(prev => prev === '0' ? '0' : prev + '0')}>0</button>
        <button className={btnNumber} onClick={() => setConvInput(prev => prev.includes('.') ? prev : prev + '.')}>.</button>
        <button
          className={btnOperator}
          onClick={async () => {
            await navigator.clipboard.writeText(conversionResult.replace(/,/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const renderHistoryPanel = () => (
    <div className="absolute inset-0 bg-[#1c1c1c] z-10 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-medium">History</h3>
        <div className="flex gap-2">
          <button
            onClick={clearHistory}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setShowHistory(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            No history yet
          </div>
        ) : (
          history.map(entry => (
            <button
              key={entry.id}
              onClick={() => useHistoryEntry(entry)}
              className="w-full px-4 py-3 text-right border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="text-white/40 text-sm">{entry.expression}</div>
              <div className="text-white text-xl font-light">{entry.result}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ----- Main Render -----
  const windowSize = getWindowSize();

  return (
    <ZWindow
      title="Calculator"
      onClose={onClose}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={windowSize}
      windowType="system"
    >
      <div
        ref={containerRef}
        className="flex flex-col h-full bg-[#1c1c1c] select-none relative overflow-hidden"
      >
        {renderModeSelector()}
        {mode !== 'converter' && renderDisplay()}

        {mode === 'basic' && renderBasicMode()}
        {mode === 'scientific' && renderScientificMode()}
        {mode === 'programmer' && renderProgrammerMode()}
        {mode === 'converter' && renderConverterMode()}

        {showHistory && renderHistoryPanel()}
      </div>
    </ZWindow>
  );
};

export default ZCalculatorWindow;
