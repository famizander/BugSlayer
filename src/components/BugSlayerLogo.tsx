import React from 'react';

interface BugSlayerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const BugSlayerLogo: React.FC<BugSlayerLogoProps> = ({
  className = '',
  size = 'md',
  color,
}) => {

  // Logo stays completely constant across themes: cyan palette, dark negative cuts, white slash
  const logoColor = color || '#38bdf8';
  const cutColor = '#030d1b';

  const dimensions = {
    sm: { width: 38, height: 26 },
    md: { width: 48, height: 32 },
    lg: { width: 68, height: 46 },
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center font-mono select-none ${className}`}
      title="BugSlayer: { 🐞/ }"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 54 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Left curly bracket: { */}
        <text
          x="2"
          y="25"
          fill={logoColor}
          fontSize="24"
          fontFamily="monospace"
          fontWeight="700"
          className="select-none transition-colors duration-200"
        >
          &#123;
        </text>

        {/* Center Ladybug - Silhouette */}
        <g transform="translate(18, 6)">
          {/* Antennae */}
          <path
            d="M 6 5 Q 4 1 2 2"
            stroke={logoColor}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M 12 5 Q 14 1 16 2"
            stroke={logoColor}
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Tiny legs */}
          <path
            d="M 3 10 L 0.5 9.5 M 3 14 L 0.5 14 M 3 18 L 1 19.5"
            stroke={logoColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 15 10 L 17.5 9.5 M 15 14 L 17.5 14 M 15 18 L 17 19.5"
            stroke={logoColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Ladybug Head */}
          <ellipse cx="9" cy="6" rx="4" ry="3" fill={logoColor} />

          {/* Ladybug Body Shell (Main Silhouette) */}
          <path
            d="M 9 7.5 C 3.5 7.5 2.5 12 2.5 16 C 2.5 21 5.5 23 9 23 C 12.5 23 15.5 21 15.5 16 C 15.5 12 14.5 7.5 9 7.5 Z"
            fill={logoColor}
            className="transition-colors duration-200"
          />

          {/* Negative-space cuts for spots and wing divider to keep the ladybug recognizable */}
          <line
            x1="9"
            y1="8.5"
            x2="9"
            y2="22.5"
            stroke={cutColor}
            strokeWidth="1"
          />
          <circle cx="6" cy="12.5" r="1.1" fill={cutColor} />
          <circle cx="6.5" cy="17" r="1" fill={cutColor} />
          <circle cx="12" cy="12.5" r="1.1" fill={cutColor} />
          <circle cx="11.5" cy="17" r="1" fill={cutColor} />

          {/* The Slaying Slash '/' cutting right across the ladybug */}
          <line
            x1="18"
            y1="2"
            x2="0"
            y2="25"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Spark gleam */}
          <circle cx="9" cy="13.5" r="1.3" fill="#f8fafc" />
        </g>

        {/* Right curly bracket: } */}
        <text
          x="39"
          y="25"
          fill={logoColor}
          fontSize="24"
          fontFamily="monospace"
          fontWeight="700"
          className="select-none transition-colors duration-200"
        >
          &#125;
        </text>
      </svg>
    </div>
  );
};
