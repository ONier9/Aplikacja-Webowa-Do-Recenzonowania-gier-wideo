'use client';

import { useState } from 'react';
import { shortenSummary } from '@/utils/shortenSummary';

interface ExpandableTextProps {
  text: string | null | undefined;
  wordLimit?: number;
  defaultText?: string;
  expandText?: string;
  collapseText?: string;
}

export default function ExpandableText({
  text,
  wordLimit = 20,
  defaultText = "No content available",
  expandText = "...",
  collapseText = "Show Less"
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fullText = text || defaultText;
  const displayedText = isExpanded ? fullText : shortenSummary(text, wordLimit);
  const showToggleButton = (text && text.split(' ').length > wordLimit);

  return (
    <div>
      <p className="text-gray-400 mb-2">{displayedText}</p>
      {showToggleButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-teal-600 hover:text-teal-800 font-semibold text-sm"
        >
          {isExpanded ? collapseText : expandText}
        </button>
      )}
    </div>
  );
}