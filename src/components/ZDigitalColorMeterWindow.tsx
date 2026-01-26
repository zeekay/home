import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Copy,
  Check,
  Pipette,
  Grid3X3,
  Maximize2,
  Minimize2,
  ChevronDown,
  History,
  X,
  Target,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ColorFormat = 'rgb' | 'hex' | 'hsl' | 'hsb' | 'cmyk';
type ColorSpace = 'sRGB' | 'Display P3' | 'Adobe RGB';
type ApertureSize = 1 | 3 | 5;
type ViewMode = 'compact' | 'expanded';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSB {
  h: number;
  s: number;
  b: number;
}

interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

interface ColorEntry {
  id: string;
  rgb: RGB;
  timestamp: Date;
}

// ============================================================================
// Color Conversion Utilities
// ============================================================================

const rgbToHex = (rgb: RGB): string => {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

const rgbToHsl = (rgb: RGB): HSL => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const rgbToHsb = (rgb: RGB): HSB => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
};

const rgbToCmyk = (rgb: RGB): CMYK => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
};

const formatColorValue = (rgb: RGB, format: ColorFormat): string => {
  switch (format) {
    case 'rgb':
      return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
    case 'hex':
      return rgbToHex(rgb);
    case 'hsl': {
      const hsl = rgbToHsl(rgb);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsb': {
      const hsb = rgbToHsb(rgb);
      return `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
    }
    case 'cmyk': {
      const cmyk = rgbToCmyk(rgb);
      return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }
    default:
      return rgbToHex(rgb);
  }
};

// ============================================================================
// Component Props
// ============================================================================

interface ZDigitalColorMeterWindowProps {
  onClose: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

const ZDigitalColorMeterWindow: React.FC<ZDigitalColorMeterWindowProps> = ({ onClose }) => {
  // ----- State -----
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex');
  const [colorSpace, setColorSpace] = useState<ColorSpace>('sRGB');
  const [apertureSize, setApertureSize] = useState<ApertureSize>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [isSampling, setIsSampling] = useState(true);
  const [currentColor, setCurrentColor] = useState<RGB>({ r: 128, g: 128, b: 128 });
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const [colorHistory, setColorHistory] = useState<ColorEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showApertureMenu, setShowApertureMenu] = useState(false);
  const [showColorSpaceMenu, setShowColorSpaceMenu] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLCanvasElement>(null);
  const magnifierRef = useRef<HTMLCanvasElement>(null);

  // ----- Generate Demo Gradient -----
  useEffect(() => {
    const canvas = gradientRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create a complex gradient pattern for sampling
    // Horizontal rainbow gradient
    const rainbowGradient = ctx.createLinearGradient(0, 0, width, 0);
    rainbowGradient.addColorStop(0, '#ff0000');
    rainbowGradient.addColorStop(0.17, '#ff8000');
    rainbowGradient.addColorStop(0.33, '#ffff00');
    rainbowGradient.addColorStop(0.5, '#00ff00');
    rainbowGradient.addColorStop(0.67, '#0080ff');
    rainbowGradient.addColorStop(0.83, '#8000ff');
    rainbowGradient.addColorStop(1, '#ff0080');

    ctx.fillStyle = rainbowGradient;
    ctx.fillRect(0, 0, width, height);

    // Vertical white-to-transparent gradient overlay
    const whiteGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height / 2);

    // Vertical black-from-bottom gradient overlay
    const blackGradient = ctx.createLinearGradient(0, height / 2, 0, height);
    blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blackGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, height / 2, width, height / 2);

    // Add some geometric shapes for variety
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.3, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.7, 25, 0, Math.PI * 2);
    ctx.fill();

    // Add a gray ramp
    for (let i = 0; i < 10; i++) {
      const gray = Math.round((i / 9) * 255);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(width * 0.1 + i * (width * 0.08), height * 0.85, width * 0.07, height * 0.12);
    }
  }, []);

  // ----- Sample Color from Gradient -----
  const sampleColor = useCallback((x: number, y: number) => {
    const canvas = gradientRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    // Sample based on aperture size
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    const halfAperture = Math.floor(apertureSize / 2);

    for (let dx = -halfAperture; dx <= halfAperture; dx++) {
      for (let dy = -halfAperture; dy <= halfAperture; dy++) {
        const px = Math.max(0, Math.min(canvas.width - 1, canvasX + dx));
        const py = Math.max(0, Math.min(canvas.height - 1, canvasY + dy));
        const imageData = ctx.getImageData(px, py, 1, 1).data;
        totalR += imageData[0];
        totalG += imageData[1];
        totalB += imageData[2];
        count++;
      }
    }

    setCurrentColor({
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count),
    });
  }, [apertureSize]);

  // ----- Draw Magnifier -----
  useEffect(() => {
    const magnifier = magnifierRef.current;
    const gradient = gradientRef.current;
    if (!magnifier || !gradient) return;

    const ctx = magnifier.getContext('2d');
    const srcCtx = gradient.getContext('2d');
    if (!ctx || !srcCtx) return;

    const magnifierSize = magnifier.width;
    const zoomLevel = 8;
    const sourceSize = Math.floor(magnifierSize / zoomLevel);

    // Clear
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, magnifierSize, magnifierSize);

    // Calculate source position
    const gradientRect = gradient.getBoundingClientRect();
    const scaleX = gradient.width / gradientRect.width;
    const scaleY = gradient.height / gradientRect.height;
    const srcX = Math.floor(cursorPosition.x * scaleX) - Math.floor(sourceSize / 2);
    const srcY = Math.floor(cursorPosition.y * scaleY) - Math.floor(sourceSize / 2);

    // Draw zoomed pixels
    try {
      const imageData = srcCtx.getImageData(
        Math.max(0, srcX),
        Math.max(0, srcY),
        sourceSize,
        sourceSize
      );

      for (let y = 0; y < sourceSize; y++) {
        for (let x = 0; x < sourceSize; x++) {
          const i = (y * sourceSize + x) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x * zoomLevel, y * zoomLevel, zoomLevel, zoomLevel);

          // Draw grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeRect(x * zoomLevel, y * zoomLevel, zoomLevel, zoomLevel);
        }
      }

      // Draw crosshair in center
      const centerPixel = Math.floor(sourceSize / 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        centerPixel * zoomLevel + 1,
        centerPixel * zoomLevel + 1,
        zoomLevel - 2,
        zoomLevel - 2
      );

      // Draw aperture indicator
      if (apertureSize > 1) {
        const halfAperture = Math.floor(apertureSize / 2);
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          (centerPixel - halfAperture) * zoomLevel,
          (centerPixel - halfAperture) * zoomLevel,
          apertureSize * zoomLevel,
          apertureSize * zoomLevel
        );
      }
    } catch {
      // Handle edge cases
    }
  }, [cursorPosition, apertureSize]);

  // ----- Handle Mouse Move on Gradient -----
  const handleGradientMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSampling) return;

    const canvas = gradientRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPosition({ x, y });
    sampleColor(x, y);
  }, [isSampling, sampleColor]);

  // ----- Add to History -----
  const addToHistory = useCallback(() => {
    const entry: ColorEntry = {
      id: Date.now().toString(),
      rgb: { ...currentColor },
      timestamp: new Date(),
    };

    setColorHistory(prev => [entry, ...prev.slice(0, 19)]);
  }, [currentColor]);

  // ----- Copy to Clipboard -----
  const copyColor = useCallback(async () => {
    const value = formatColorValue(currentColor, colorFormat);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      addToHistory();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error('Failed to copy');
    }
  }, [currentColor, colorFormat, addToHistory]);

  // ----- Computed Values -----
  const colorValues = useMemo(() => {
    const hsl = rgbToHsl(currentColor);
    const hsb = rgbToHsb(currentColor);
    const cmyk = rgbToCmyk(currentColor);

    return {
      hex: rgbToHex(currentColor),
      rgb: `${currentColor.r}, ${currentColor.g}, ${currentColor.b}`,
      hsl: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
      hsb: `${hsb.h}, ${hsb.s}%, ${hsb.b}%`,
      cmyk: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
    };
  }, [currentColor]);

  const currentFormattedValue = useMemo(() => {
    return formatColorValue(currentColor, colorFormat);
  }, [currentColor, colorFormat]);

  // ----- Format Labels -----
  const formatLabels: Record<ColorFormat, string> = {
    rgb: 'RGB',
    hex: 'Hex',
    hsl: 'HSL',
    hsb: 'HSB',
    cmyk: 'CMYK',
  };

  // ----- Get Window Size -----
  const getWindowSize = () => {
    if (viewMode === 'compact') {
      return { width: 280, height: 180 };
    }
    return { width: 420, height: 560 };
  };

  // ----- Render Dropdown Menu -----
  const renderDropdownMenu = (
    isOpen: boolean,
    onClose: () => void,
    items: { label: string; value: string; active?: boolean }[],
    onSelect: (value: string) => void
  ) => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 bg-[#2c2c2e] rounded-lg shadow-xl border border-white/10 overflow-hidden z-50 min-w-[120px]">
        {items.map(item => (
          <button
            key={item.value}
            onClick={() => {
              onSelect(item.value);
              onClose();
            }}
            className={cn(
              "w-full px-3 py-1.5 text-left text-sm transition-colors",
              item.active
                ? "bg-blue-600 text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  // ----- Render Compact View -----
  const renderCompactView = () => (
    <div className="flex h-full bg-[#1c1c1c]">
      {/* Color swatch */}
      <div
        className="w-20 h-full border-r border-white/10"
        style={{ backgroundColor: rgbToHex(currentColor) }}
      />

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="text-white/40 text-xs mb-1">{formatLabels[colorFormat]}</div>
          <div className="text-white font-mono text-lg">{currentFormattedValue}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyColor}
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setViewMode('expanded')}
            className="p-1.5 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );

  // ----- Render Expanded View -----
  const renderExpandedView = () => (
    <div className="flex flex-col h-full bg-[#1c1c1c]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#2a2a2c]">
        {/* Format selector */}
        <div className="relative">
          <button
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded text-sm text-white transition-colors"
          >
            {formatLabels[colorFormat]}
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          {renderDropdownMenu(
            showFormatMenu,
            () => setShowFormatMenu(false),
            Object.entries(formatLabels).map(([value, label]) => ({
              value,
              label,
              active: value === colorFormat,
            })),
            (value) => setColorFormat(value as ColorFormat)
          )}
        </div>

        {/* Aperture selector */}
        <div className="relative">
          <button
            onClick={() => setShowApertureMenu(!showApertureMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded text-sm text-white transition-colors"
          >
            <Grid3X3 className="w-3 h-3" />
            {apertureSize}x{apertureSize}
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          {renderDropdownMenu(
            showApertureMenu,
            () => setShowApertureMenu(false),
            [
              { value: '1', label: '1x1 pixel', active: apertureSize === 1 },
              { value: '3', label: '3x3 average', active: apertureSize === 3 },
              { value: '5', label: '5x5 average', active: apertureSize === 5 },
            ],
            (value) => setApertureSize(parseInt(value) as ApertureSize)
          )}
        </div>

        {/* Color space selector */}
        <div className="relative">
          <button
            onClick={() => setShowColorSpaceMenu(!showColorSpaceMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded text-sm text-white transition-colors"
          >
            {colorSpace}
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          {renderDropdownMenu(
            showColorSpaceMenu,
            () => setShowColorSpaceMenu(false),
            [
              { value: 'sRGB', label: 'sRGB', active: colorSpace === 'sRGB' },
              { value: 'Display P3', label: 'Display P3', active: colorSpace === 'Display P3' },
              { value: 'Adobe RGB', label: 'Adobe RGB', active: colorSpace === 'Adobe RGB' },
            ],
            (value) => setColorSpace(value as ColorSpace)
          )}
        </div>

        <div className="flex-1" />

        {/* Toggle sampling */}
        <button
          onClick={() => setIsSampling(!isSampling)}
          className={cn(
            "p-1.5 rounded transition-colors",
            isSampling ? "bg-blue-600 text-white" : "bg-[#3a3a3c] text-white/60 hover:bg-[#4a4a4c]"
          )}
          title={isSampling ? 'Pause sampling' : 'Resume sampling'}
        >
          <Pipette className="w-4 h-4" />
        </button>

        {/* Compact mode */}
        <button
          onClick={() => setViewMode('compact')}
          className="p-1.5 bg-[#3a3a3c] hover:bg-[#4a4a4c] rounded transition-colors"
          title="Compact view"
        >
          <Minimize2 className="w-4 h-4 text-white/60" />
        </button>

        {/* History */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "p-1.5 rounded transition-colors",
            showHistory ? "bg-blue-600 text-white" : "bg-[#3a3a3c] text-white/60 hover:bg-[#4a4a4c]"
          )}
          title="Color history"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sample area with gradient */}
        <div className="relative flex-1 min-h-0">
          <canvas
            ref={gradientRef}
            width={400}
            height={250}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleGradientMouseMove}
            onClick={addToHistory}
          />

          {/* Crosshair overlay */}
          {isSampling && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: cursorPosition.x - 15,
                top: cursorPosition.y - 15,
              }}
            >
              <Target className="w-[30px] h-[30px] text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Magnifier and color info */}
        <div className="flex gap-3 p-3 border-t border-white/10 bg-[#2a2a2c]">
          {/* Magnifier */}
          <div className="flex-shrink-0">
            <div className="text-white/40 text-xs mb-1">Magnifier</div>
            <canvas
              ref={magnifierRef}
              width={96}
              height={96}
              className="rounded border border-white/20"
            />
          </div>

          {/* Color swatch and values */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-3 mb-2">
              {/* Color swatch */}
              <div
                className="w-16 h-16 rounded-lg border border-white/20 shadow-inner"
                style={{ backgroundColor: rgbToHex(currentColor) }}
              />

              {/* Primary value */}
              <div className="flex-1">
                <div className="text-white/40 text-xs mb-1">{formatLabels[colorFormat]}</div>
                <div className="text-white font-mono text-lg truncate">{currentFormattedValue}</div>
                <button
                  onClick={copyColor}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* All format values */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">RGB:</span>
                <span className="text-white font-mono">{colorValues.rgb}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Hex:</span>
                <span className="text-white font-mono">{colorValues.hex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">HSL:</span>
                <span className="text-white font-mono">{colorValues.hsl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">HSB:</span>
                <span className="text-white font-mono">{colorValues.hsb}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-white/40">CMYK:</span>
                <span className="text-white font-mono">{colorValues.cmyk}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color history */}
        {showHistory && (
          <div className="border-t border-white/10 bg-[#1c1c1c]">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-white/60 text-xs">Recent Colors</span>
              {colorHistory.length > 0 && (
                <button
                  onClick={() => setColorHistory([])}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>

            {colorHistory.length === 0 ? (
              <div className="px-3 pb-3 text-white/40 text-xs text-center">
                Click on the gradient to save colors
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                {colorHistory.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setCurrentColor(entry.rgb);
                    }}
                    className="group relative w-8 h-8 rounded border border-white/20 hover:border-white/40 transition-colors"
                    style={{ backgroundColor: rgbToHex(entry.rgb) }}
                    title={rgbToHex(entry.rgb)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setColorHistory(prev => prev.filter(c => c.id !== entry.id));
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-2 h-2 text-white" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ----- Main Render -----
  const windowSize = getWindowSize();

  return (
    <ZWindow
      title="Digital Color Meter"
      onClose={onClose}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={windowSize}
      windowType="system"
    >
      {viewMode === 'compact' ? renderCompactView() : renderExpandedView()}
    </ZWindow>
  );
};

export default ZDigitalColorMeterWindow;
