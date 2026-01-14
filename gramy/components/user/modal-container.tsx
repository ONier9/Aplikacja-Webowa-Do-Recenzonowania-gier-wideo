import React from 'react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800 rounded-xl p-6 w-full max-w-md relative border border-neutral-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-teal-400 text-xl transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-teal-400 text-sm mt-2">
              {subtitle}
            </p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};