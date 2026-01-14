import React, { useMemo } from 'react';
import { API_COLORS, GAUGE_THRESHOLDS } from '../constants';
import { GaugeProps } from '../types';

const GaugeSemicircleNeedle: React.FC<GaugeProps> = ({
  percent,
  size = 200,
  showTicks = true,
  animation = 'ease',
  label
}) => {
  // Clamp percent between 0 and 100
  const validPercent = Math.min(Math.max(percent, 0), 100);
  
  // Dimensions
  const strokeWidth = 12; // Thickness of the arc
  const radius = 80; // Logical radius in SVG units
  const cx = 100; // Center X
  const cy = 100; // Center Y (Bottom of the semicircle)
  
  // Color Logic
  const getSegmentColor = (p: number) => {
    if (p < GAUGE_THRESHOLDS.LOW) return API_COLORS.RED;
    if (p < GAUGE_THRESHOLDS.MEDIUM) return API_COLORS.YELLOW;
    return API_COLORS.GREEN;
  };
  
  const activeColor = getSegmentColor(validPercent);
  
  // Math for the needle angle (0% = -90deg/180deg (left), 100% = 90deg/0deg (right) depending on orientation)
  // Let's use 0 degrees = Left (Cartesian 180), 180 degrees = Right (Cartesian 0)
  // Mapping 0-100 to 0-180 degrees
  const angle = (validPercent / 100) * 180;

  // Generate Ticks
  const ticks = useMemo(() => {
    if (!showTicks) return [];
    const tickElements = [];
    for (let i = 0; i <= 10; i++) {
      const tickAngle = i * 18; // 180 / 10
      const rad = ((180 - tickAngle) * Math.PI) / 180; // Convert to radians for SVG coords
      // Outer point
      const x1 = cx + (radius + 8) * Math.cos(rad);
      const y1 = cy - (radius + 8) * Math.sin(rad);
      // Inner point
      const x2 = cx + (radius + 2) * Math.cos(rad);
      const y2 = cy - (radius + 2) * Math.sin(rad);
      
      tickElements.push(
        <line 
          key={i} 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke={API_COLORS.GRAY} 
          strokeWidth="1.5"
          opacity={0.5} 
        />
      );
    }
    return tickElements;
  }, [showTicks, radius, cx, cy]);

  return (
    <div 
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size / 1.6 }} // Aspect ratio adjust
      role="img"
      aria-label={label || `Gauge showing ${validPercent}% complete`}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 120" 
        className="overflow-visible"
      >
        {/* Background Arc (Gray) - 180 degrees from left to right */}
        {/* Path: Move to left (20,100), Arc to right (180,100) */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Foreground Value Arc (Colored) */}
        {/* Using strokeDasharray to simulate progress on the same path */}
        {/* Circumference of semi-circle = PI * R. Max length approx 251. */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(validPercent / 100) * 251}, 251`}
          className={animation !== 'none' ? 'transition-all duration-700 ease-out' : ''}
        />

        {/* Ticks */}
        {ticks}

        {/* Needle Group */}
        <g 
            transform={`rotate(${angle}, 100, 100)`} 
            style={{ 
                transformOrigin: '100px 100px', 
                transition: animation !== 'none' ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                // Initial rotation needs to account for SVG starting at 3 o'clock (0deg).
                // We want 0% to be 9 o'clock (-180deg visual). 
                // Actually simpler: Let's rotate the Group based on percent mapping 0->-90, 100->90
            }}
        >
             {/* Note on rotation logic above: The Group logic needs correction.
                 Standard CSS rotation: 0deg is 12 o'clock usually? No, standard transform is from current pos.
                 Let's stick to the mapped `angle` 0-180.
                 We need the needle to point LEFT at 0 degrees.
                 If we draw the needle pointing LEFT by default, then rotate(0) is correct.
             */}
             
             {/* Needle Shape: Pointing Left initially (-X direction) */}
             {/* Start at center (100,100), go left to (30, 100) */}
             <path 
                d="M 100 95 L 25 100 L 100 105 Z" 
                fill={API_COLORS.GRAY}
                filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"
             />
             
             {/* Center Hub */}
             <circle cx="100" cy="100" r="6" fill={API_COLORS.BLUE} />
        </g>

        {/* Text Label */}
        <text 
          x="100" 
          y="85" 
          textAnchor="middle" 
          fill={API_COLORS.BLUE} 
          className="text-2xl font-bold"
          style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'sans-serif' }}
        >
          {Math.round(validPercent)}%
        </text>
      </svg>
      
      {/* Fallback / Accessibility Text */}
      <span className="sr-only">{validPercent}% Complete</span>
    </div>
  );
};

export default GaugeSemicircleNeedle;