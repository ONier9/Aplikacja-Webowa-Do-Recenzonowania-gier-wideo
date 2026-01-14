import React from 'react';

interface StatusMessageProps {
  type: 'error' | 'success';
  message: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  const styles = {
    error: 'bg-red-900 bg-opacity-30 border-red-800 text-red-300',
    success: 'bg-teal-900 bg-opacity-30 border-teal-800 text-teal-300'
  };

  return (
    <div className={`rounded-lg p-3 border ${styles[type]}`}>
      <div className="text-sm">{message}</div>
    </div>
  );
};