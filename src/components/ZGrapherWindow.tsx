import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronRight,
  Play,
  Palette,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Equation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  name: string;
}

interface ViewState {
  centerX: number;
  centerY: number;
  scale: number; // pixels per unit
}

interface PresetEquation {
  name: string;
  expression: string;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

const COLORS = [
  '#ff6b6b', // red
  '#4ecdc4', // teal
  '#ffe66d', // yellow
  '#95e1d3', // mint
  '#f38181', // coral
  '#aa96da', // lavender
  '#fcbad3', // pink
  '#a8d8ea', // light blue
  '#ff9f43', // orange
  '#6a89cc', // blue
];

const PRESET_EQUATIONS: PresetEquation[] = [
  { name: 'Parabola', expression: 'x^2', description: 'y = x^2' },
  { name: 'Cubic', expression: 'x^3', description: 'y = x^3' },
  { name: 'Sine Wave', expression: 'sin(x)', description: 'y = sin(x)' },
  { name: 'Cosine Wave', expression: 'cos(x)', description: 'y = cos(x)' },
  { name: 'Tangent', expression: 'tan(x)', description: 'y = tan(x)' },
  { name: 'Circle (top)', expression: 'sqrt(4 - x^2)', description: 'x^2 + y^2 = 4 (upper half)' },
  { name: 'Circle (bottom)', expression: '-sqrt(4 - x^2)', description: 'x^2 + y^2 = 4 (lower half)' },
  { name: 'Exponential', expression: 'exp(x)', description: 'y = e^x' },
  { name: 'Logarithm', expression: 'log(x)', description: 'y = ln(x)' },
  { name: 'Square Root', expression: 'sqrt(x)', description: 'y = sqrt(x)' },
  { name: 'Absolute Value', expression: 'abs(x)', description: 'y = |x|' },
  { name: 'Hyperbola', expression: '1/x', description: 'y = 1/x' },
  { name: 'Gaussian', expression: 'exp(-x^2)', description: 'y = e^(-x^2)' },
  { name: 'Damped Sine', expression: 'exp(-x/3)*sin(x*2)', description: 'Damped oscillation' },
];

const DEFAULT_VIEW: ViewState = {
  centerX: 0,
  centerY: 0,
  scale: 50, // 50 pixels per unit
};

// ============================================================================
// Math Parser
// ============================================================================

function evaluateExpression(expr: string, x: number): number {
  try {
    // Sanitize and prepare expression
    let sanitized = expr
      .toLowerCase()
      .replace(/\s+/g, '')
      // Handle implicit multiplication: 2x -> 2*x, x2 -> x*2
      .replace(/(\d)([a-z])/g, '$1*$2')
      .replace(/([a-z])(\d)/g, '$1*$2')
      .replace(/\)\(/g, ')*(')
      .replace(/(\d)\(/g, '$1*(')
      .replace(/\)(\d)/g, ')*$1')
      // Replace math functions
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\basin\b/g, 'Math.asin')
      .replace(/\bacos\b/g, 'Math.acos')
      .replace(/\batan\b/g, 'Math.atan')
      .replace(/\bsinh\b/g, 'Math.sinh')
      .replace(/\bcosh\b/g, 'Math.cosh')
      .replace(/\btanh\b/g, 'Math.tanh')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\blog10\b/g, 'Math.log10')
      .replace(/\blog2\b/g, 'Math.log2')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\bcbrt\b/g, 'Math.cbrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bfloor\b/g, 'Math.floor')
      .replace(/\bceil\b/g, 'Math.ceil')
      .replace(/\bround\b/g, 'Math.round')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      // Replace ^ with Math.pow
      .replace(/\^/g, '**');

    // Create function with x as parameter
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return ${sanitized}`);
    const result = fn(x);

    return typeof result === 'number' && isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

// ============================================================================
// Component Props
// ============================================================================

interface ZGrapherWindowProps {
  onClose: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

const ZGrapherWindow: React.FC<ZGrapherWindowProps> = ({ onClose }) => {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [equations, setEquations] = useState<Equation[]>([
    { id: '1', expression: 'sin(x)', color: COLORS[0], visible: true, name: 'f(x)' },
  ]);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showPresets, setShowPresets] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newExpression, setNewExpression] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Get next color
  const getNextColor = useCallback(() => {
    const usedColors = new Set(equations.map(eq => eq.color));
    return COLORS.find(c => !usedColors.has(c)) || COLORS[equations.length % COLORS.length];
  }, [equations]);

  // Add equation
  const addEquation = useCallback((expression: string = 'x') => {
    const newEq: Equation = {
      id: Date.now().toString(),
      expression,
      color: getNextColor(),
      visible: true,
      name: `g${equations.length}(x)`,
    };
    setEquations(prev => [...prev, newEq]);
    setSelectedId(newEq.id);
    setNewExpression('');
  }, [equations.length, getNextColor]);

  // Update equation
  const updateEquation = useCallback((id: string, updates: Partial<Equation>) => {
    setEquations(prev => prev.map(eq =>
      eq.id === id ? { ...eq, ...updates } : eq
    ));
  }, []);

  // Remove equation
  const removeEquation = useCallback((id: string) => {
    setEquations(prev => {
      const filtered = prev.filter(eq => eq.id !== id);
      if (selectedId === id && filtered.length > 0) {
        setSelectedId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedId]);

  // Toggle visibility
  const toggleVisibility = useCallback((id: string) => {
    updateEquation(id, { visible: !equations.find(eq => eq.id === id)?.visible });
  }, [equations, updateEquation]);

  // Zoom functions
  const zoom = useCallback((factor: number) => {
    setView(prev => ({
      ...prev,
      scale: Math.max(10, Math.min(200, prev.scale * factor)),
    }));
  }, []);

  const resetView = useCallback(() => {
    setView(DEFAULT_VIEW);
  }, []);

  // Export as image
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Add preset
  const addPreset = useCallback((preset: PresetEquation) => {
    addEquation(preset.expression);
    setShowPresets(false);
  }, [addEquation]);

  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(0, 0, width, height);

    const { centerX, centerY, scale } = view;

    // Calculate visible range
    const xMin = centerX - width / 2 / scale;
    const xMax = centerX + width / 2 / scale;
    const yMin = centerY - height / 2 / scale;
    const yMax = centerY + height / 2 / scale;

    // Helper to convert math coords to canvas coords
    const toCanvasX = (x: number) => (x - centerX) * scale + width / 2;
    const toCanvasY = (y: number) => height / 2 - (y - centerY) * scale;

    // Draw grid
    ctx.strokeStyle = '#2c2c2e';
    ctx.lineWidth = 1;

    // Determine grid spacing based on scale
    const getGridSpacing = (scale: number) => {
      if (scale > 100) return 0.5;
      if (scale > 50) return 1;
      if (scale > 20) return 2;
      if (scale > 10) return 5;
      return 10;
    };

    const gridSpacing = getGridSpacing(scale);

    // Vertical grid lines
    const startX = Math.ceil(xMin / gridSpacing) * gridSpacing;
    for (let x = startX; x <= xMax; x += gridSpacing) {
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const startY = Math.ceil(yMin / gridSpacing) * gridSpacing;
    for (let y = startY; y <= yMax; y += gridSpacing) {
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#4a4a4c';
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const axisY = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, axisY);
      ctx.lineTo(width, axisY);
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const axisX = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(axisX, 0);
      ctx.lineTo(axisX, height);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#888';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X-axis labels
    for (let x = startX; x <= xMax; x += gridSpacing) {
      if (Math.abs(x) < 0.001) continue; // Skip origin
      const canvasX = toCanvasX(x);
      const labelY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 5 : height - 15;
      ctx.fillText(x.toString(), canvasX, labelY);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = startY; y <= yMax; y += gridSpacing) {
      if (Math.abs(y) < 0.001) continue; // Skip origin
      const canvasY = toCanvasY(y);
      const labelX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) - 5 : 25;
      ctx.fillText(y.toString(), labelX, canvasY);
    }

    // Draw equations
    const step = 1 / scale; // One pixel per step
    equations.forEach(eq => {
      if (!eq.visible) return;

      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let isFirst = true;
      let lastY: number | null = null;

      for (let x = xMin - step; x <= xMax + step; x += step) {
        const y = evaluateExpression(eq.expression, x);
        const canvasX = toCanvasX(x);
        const canvasY = toCanvasY(y);

        if (isNaN(y) || !isFinite(y) || canvasY < -1000 || canvasY > height + 1000) {
          // Discontinuity - start new path segment
          if (!isFirst) {
            ctx.stroke();
            ctx.beginPath();
            isFirst = true;
          }
          lastY = null;
          continue;
        }

        // Check for vertical asymptotes (large jumps)
        if (lastY !== null && Math.abs(canvasY - lastY) > height / 2) {
          ctx.stroke();
          ctx.beginPath();
          isFirst = true;
        }

        if (isFirst) {
          ctx.moveTo(canvasX, canvasY);
          isFirst = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
        lastY = canvasY;
      }
      ctx.stroke();
    });

  }, [equations, view, canvasSize]);

  // Mouse handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    setView(prev => ({
      ...prev,
      centerX: prev.centerX - dx / prev.scale,
      centerY: prev.centerY + dy / prev.scale,
    }));

    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(factor);
  }, [zoom]);

  // Selected equation
  const selectedEquation = useMemo(() =>
    equations.find(eq => eq.id === selectedId),
    [equations, selectedId]
  );

  return (
    <ZWindow
      title="Grapher"
      onClose={onClose}
      initialPosition={{ x: 120, y: 60 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1c1c1e]">
        {/* Sidebar */}
        <div className={cn(
          "flex flex-col border-r border-white/10 transition-all",
          sidebarCollapsed ? "w-10" : "w-64"
        )}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </button>
            {!sidebarCollapsed && (
              <span className="text-white/80 text-sm font-medium flex-1 ml-2">Equations</span>
            )}
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Equations list */}
              <div className="flex-1 overflow-y-auto">
                {equations.map(eq => (
                  <div
                    key={eq.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                      selectedId === eq.id ? "bg-white/10" : "hover:bg-white/5"
                    )}
                    onClick={() => setSelectedId(eq.id)}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: eq.color }}
                    />

                    {/* Expression */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate font-mono">
                        y = {eq.expression}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(eq.id); }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {eq.visible ? (
                          <Eye className="w-3.5 h-3.5 text-white/60" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeEquation(eq.id); }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add equation */}
              <div className="p-2 border-t border-white/10">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newExpression}
                    onChange={(e) => setNewExpression(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newExpression.trim()) {
                        addEquation(newExpression.trim());
                      }
                    }}
                    placeholder="Enter equation..."
                    className="flex-1 bg-[#2c2c2e] text-white text-sm px-2 py-1.5 rounded outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    onClick={() => newExpression.trim() && addEquation(newExpression.trim())}
                    className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Presets toggle */}
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="w-full mt-2 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Presets
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    showPresets && "rotate-180"
                  )} />
                </button>

                {/* Presets dropdown */}
                {showPresets && (
                  <div className="mt-2 max-h-40 overflow-y-auto bg-[#2c2c2e] rounded">
                    {PRESET_EQUATIONS.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => addPreset(preset)}
                        className="w-full px-2 py-1.5 text-left hover:bg-white/10 transition-colors"
                      >
                        <p className="text-white text-xs">{preset.name}</p>
                        <p className="text-white/40 text-xs font-mono">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equation editor */}
              {selectedEquation && (
                <div className="p-3 border-t border-white/10">
                  <label className="text-white/60 text-xs block mb-1">Edit Equation</label>
                  <input
                    type="text"
                    value={selectedEquation.expression}
                    onChange={(e) => updateEquation(selectedId, { expression: e.target.value })}
                    className="w-full bg-[#2c2c2e] text-white text-sm px-2 py-1.5 rounded outline-none focus:ring-1 focus:ring-blue-500 font-mono mb-2"
                  />

                  {/* Color picker */}
                  <label className="text-white/60 text-xs block mb-1">Color</label>
                  <div className="flex gap-1 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateEquation(selectedId, { color })}
                        className={cn(
                          "w-5 h-5 rounded-full transition-transform",
                          selectedEquation.color === color && "ring-2 ring-white ring-offset-1 ring-offset-[#1c1c1e] scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Main graph area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#252527]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => zoom(1.2)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={() => zoom(0.8)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4 text-white/60" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <span className="text-white/40 text-xs">
                Scale: {view.scale.toFixed(0)}px/unit
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => addEquation()}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
              <button
                onClick={exportImage}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Export as Image"
              >
                <Download className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Canvas container */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
            />

            {/* Coordinates display */}
            <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white/60 text-xs font-mono">
              Center: ({view.centerX.toFixed(2)}, {view.centerY.toFixed(2)})
            </div>

            {/* Pan hint */}
            {!isPanning && (
              <div className="absolute top-2 left-2 flex items-center gap-1 text-white/30 text-xs">
                <Move className="w-3 h-3" />
                Drag to pan | Scroll to zoom
              </div>
            )}
          </div>

          {/* Function reference */}
          <div className="px-3 py-2 border-t border-white/10 bg-[#252527]">
            <p className="text-white/40 text-xs">
              <span className="text-white/60">Supported:</span> sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, log, ln, exp, sqrt, cbrt, abs, floor, ceil, round, pi, e, ^ (power)
            </p>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZGrapherWindow;
