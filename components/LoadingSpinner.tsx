
import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-t-2 border-current ${className}`}></div>
  );
};