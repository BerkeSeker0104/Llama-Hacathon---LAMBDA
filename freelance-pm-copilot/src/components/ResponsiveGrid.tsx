'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export default function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const getGridClasses = () => {
    let classes = 'grid';
    
    // Default columns
    if (cols.default) {
      classes += ` ${gridCols[cols.default]}`;
    }
    
    // Responsive breakpoints
    if (cols.sm) {
      classes += ` sm:${gridCols[cols.sm]}`;
    }
    if (cols.md) {
      classes += ` md:${gridCols[cols.md]}`;
    }
    if (cols.lg) {
      classes += ` lg:${gridCols[cols.lg]}`;
    }
    if (cols.xl) {
      classes += ` xl:${gridCols[cols.xl]}`;
    }
    
    return classes;
  };

  return (
    <div className={cn(
      getGridClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Convenience components
export function ResponsiveCardGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ResponsiveStatsGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 4 }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ResponsiveContentGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, lg: 2 }}
      gap="lg"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}
