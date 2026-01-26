/**
 * WindowSnapOverlay - Visual preview for window tiling snap zones
 *
 * Shows a semi-transparent preview of where the window will snap
 * when the user releases the mouse while dragging.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowTiling } from '@/contexts/WindowTilingContext';

const WindowSnapOverlay: React.FC = () => {
  const { state } = useWindowTiling();
  const { preview } = state;

  return (
    <AnimatePresence>
      {preview.isVisible && preview.zone && (
        <motion.div
          className="fixed pointer-events-none z-[9998]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          style={{
            left: preview.zone.x,
            top: preview.zone.y,
            width: preview.zone.width,
            height: preview.zone.height,
          }}
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
              boxShadow: '0 0 40px 10px rgba(59, 130, 246, 0.15), 0 0 80px 20px rgba(147, 51, 234, 0.1)',
            }}
          />

          {/* Inner zone preview */}
          <motion.div
            className="absolute inset-2 rounded-lg border-2 border-dashed"
            style={{
              borderColor: 'rgba(59, 130, 246, 0.6)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
              backdropFilter: 'blur(2px)',
            }}
            animate={{
              borderColor: ['rgba(59, 130, 246, 0.4)', 'rgba(147, 51, 234, 0.6)', 'rgba(59, 130, 246, 0.4)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Corner markers */}
          <div className="absolute inset-2">
            {/* Top-left */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
            {/* Top-right */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
            {/* Bottom-left */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
            {/* Bottom-right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
          </div>

          {/* Position label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white/90 text-xs font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {formatSnapPosition(preview.zone.position)}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Format snap position for display
function formatSnapPosition(position: string | null): string {
  if (!position) return 'Full Screen';

  const labels: Record<string, string> = {
    'left': '← Left Half',
    'right': 'Right Half →',
    'top': '↑ Top Half',
    'bottom': 'Bottom Half ↓',
    'top-left': '↖ Top Left',
    'top-right': '↗ Top Right',
    'bottom-left': '↙ Bottom Left',
    'bottom-right': '↘ Bottom Right',
    'left-third': '← Left Third',
    'center-third': 'Center Third',
    'right-third': 'Right Third →',
    'top-third': '↑ Top Third',
    'middle-third': 'Middle Third',
    'bottom-third': 'Bottom Third ↓',
    'custom': 'Custom',
  };

  return labels[position] || position;
}

export default WindowSnapOverlay;
