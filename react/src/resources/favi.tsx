import React from 'react';

export interface FaviProps extends React.SVGProps<SVGSVGElement> { title?: string }

export const Favi: React.FC<FaviProps> = ({ title, width, height, ...props }) => (
   <svg
      width={width || '47.648041mm'}
      height={height || '47.648041mm'}
      viewBox="0 0 47.648041 47.648041"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      {...props}
   >
      <rect
         width="47.648041"
         height="47.648041"
         x="18.651865"
         y="9.7481251"
         ry="11.989829"
         rx="11.900388"
         fill="#000000"
      />
      <text
         x="27.54697"
         y="44.459736"
         transform="scale(0.92787498,1.0777314)"
         fill="#ffffff"
         fontFamily="Inter"
         fontSize="36.5863px"
         fontWeight="bold"
         letterSpacing="1.04042px"
      >
         <tspan x="27.54697" y="44.459736">W</tspan>
      </text>
   </svg>
);

export default Favi;
