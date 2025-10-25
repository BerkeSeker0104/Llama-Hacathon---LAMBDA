'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  onClick
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "glass-card p-6 hover-glow transition-all duration-300 cursor-pointer",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-[#00ff88]" : "text-red-400"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% {trend.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#00ff88]/10 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-[#00ff88]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
