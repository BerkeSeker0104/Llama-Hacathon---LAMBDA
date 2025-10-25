'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  breadcrumbs = [], 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <header className={cn("glass-card border-b border-white/10", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex-1">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />
                    )}
                    {item.href ? (
                      <a 
                        href={item.href}
                        className="hover:text-[#00ff88] transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-white">{item.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="mt-2 text-gray-300">{description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
