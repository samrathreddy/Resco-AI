"use client";

import React from 'react';

export function PixelatedBackground({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={className || "absolute left-1/2 top-[-40px] h-auto w-screen min-w-[1920px] -translate-x-1/2 object-cover opacity-[0.03] z-0"}
      style={{
        mixBlendMode: 'screen',
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        ...style
      }}
    />
  );
}

export function PixelatedLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="118"
      height="466"
      viewBox="0 0 118 466"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <g opacity="0.3">
        <mask
          id="mask0_1_696"
          style={{ maskType: 'alpha' }}
          maskUnits="userSpaceOnUse"
          x="-2"
          y="0"
          width="120"
          height="466"
        >
          <rect
            x="-2"
            y="466"
            width="466"
            height="120"
            transform="rotate(-90 -2 466)"
            fill="url(#paint0_radial_1_696)"
          />
        </mask>
        <g mask="url(#mask0_1_696)">
          <g style={{ mixBlendMode: 'screen' }}>
            <rect
              x="-2"
              y="466"
              width="466"
              height="120"
              transform="rotate(-90 -2 466)"
              fill="url(#pattern0_1_696)"
            />
          </g>
        </g>
      </g>
      <defs>
        <pattern id="pattern0_1_696" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use
            xlinkHref="#image0_1_696"
            transform="translate(-0.881974) scale(0.00107296 0.00416667)"
          />
        </pattern>
        <radialGradient
          id="paint0_radial_1_696"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(231 586) rotate(-180) scale(400.5 198.209)"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="0.67991" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function PixelatedRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="119"
      height="466"
      viewBox="0 0 119 466"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <g opacity="0.3">
        <mask
          id="mask0_1_699"
          style={{ maskType: 'alpha' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="120"
          height="466"
        >
          <rect
            width="466"
            height="120"
            transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 120 466)"
            fill="url(#paint0_radial_1_699)"
          />
        </mask>
        <g mask="url(#mask0_1_699)">
          <g style={{ mixBlendMode: 'screen' }}>
            <rect
              width="466"
              height="120"
              transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 120 466)"
              fill="url(#pattern0_1_699)"
            />
          </g>
        </g>
      </g>
      <defs>
        <pattern id="pattern0_1_699" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use
            xlinkHref="#image0_1_699"
            transform="translate(-0.881974) scale(0.00107296 0.00416667)"
          />
        </pattern>
        <radialGradient
          id="paint0_radial_1_699"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(233 120) rotate(-180) scale(400.5 198.209)"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="0.67991" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
} 