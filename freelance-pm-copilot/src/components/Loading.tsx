'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<LoadingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

interface LoadingProps {
  size?: LoadingSize;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}

// Convenience components
export function LoadingSpinner({ size = 'sm', className = '' }: { size?: LoadingSize; className?: string }) {
  return <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`} />;
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return <Loading size="lg" text={text} fullScreen />;
}

export function LoadingCard({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="p-8">
      <Loading size="md" text={text} />
    </div>
  );
}
