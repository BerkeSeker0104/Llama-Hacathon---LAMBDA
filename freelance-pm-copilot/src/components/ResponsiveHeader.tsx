'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Bell, 
  User,
  Plus,
  Search
} from 'lucide-react';
import MobileNavigation from './MobileNavigation';

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  showQuickActions?: boolean;
  className?: string;
}

export default function ResponsiveHeader({ 
  title, 
  subtitle, 
  showQuickActions = true,
  className = ''
}: ResponsiveHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Mobile menu + Title */}
          <div className="flex items-center space-x-3">
            <MobileNavigation />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Hidden on mobile */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Notifications - Hidden on mobile */}
            <Button variant="ghost" size="sm" className="hidden sm:flex relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Quick Actions */}
            {showQuickActions && (
              <>
                {/* New Contract - Hidden on mobile */}
                <Button 
                  onClick={() => router.push('/contracts/new')}
                  className="hidden sm:flex"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Contract
                </Button>

                {/* Mobile New Contract */}
                <Button 
                  onClick={() => router.push('/contracts/new')}
                  size="sm"
                  className="sm:hidden"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New Contract</span>
                </Button>
              </>
            )}

            {/* User Menu - Hidden on mobile */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
