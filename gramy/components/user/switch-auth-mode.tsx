import React from 'react';

interface SwitchAuthModeProps {
  prompt: string;
  linkText: string;
  onClick: () => void;
}

export const SwitchAuthMode: React.FC<SwitchAuthModeProps> = ({
  prompt,
  linkText,
  onClick
}) => (
  <div className="mt-6 pt-4 border-t border-neutral-700">
    <p className="text-center text-sm text-neutral-400">
      {prompt}{' '}
      <button 
        onClick={onClick}
        className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
      >
        {linkText}
      </button>
    </p>
  </div>
);