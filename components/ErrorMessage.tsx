
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-md text-xs sm:text-sm" role="alert">
      <p className="font-bold text-red-950 mb-0.5">Perhatian</p>
      <p className="text-red-800 leading-relaxed">{message}</p>
    </div>
  );
};
