'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number; 
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export default function StarRating({ rating, onChange, readOnly = false }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleClick = (index: number, isHalf: boolean) => {
    if (readOnly || !onChange) return;
    const selected = isHalf ? index + 0.5 : index + 1;
    onChange(selected);
  };

  const handleMouseEnter = (ratingValue: number) => {
    if (readOnly) return;
    setHoveredRating(ratingValue);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoveredRating(null);
  };

  const getFill = (index: number) => {
    const effectiveRating = hoveredRating ?? rating;
    if (effectiveRating >= index + 1) return 'full';
    if (effectiveRating >= index + 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = getFill(index);

        return (
          <div
            key={index}
            className={`relative w-8 h-8 ${readOnly ? '' : 'cursor-pointer'}`}
            onMouseLeave={handleMouseLeave}
          >
            {!readOnly && (
              <>
                <div
                  className="absolute left-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => handleMouseEnter(index + 0.5)}
                  onClick={() => handleClick(index, true)}
                />
                <div
                  className="absolute right-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => handleMouseEnter(index + 1)}
                  onClick={() => handleClick(index, false)}
                />
              </>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-full h-full transition-colors ${
                fill === 'full' || fill === 'half' ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              <defs>
                <linearGradient id={`halfGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="50%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path
                fill={fill === 'half' ? `url(#halfGradient-${index})` : 'currentColor'}
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.167L12 18.896l-7.334 3.863 1.4-8.167L.132 9.21l8.2-1.192z"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}