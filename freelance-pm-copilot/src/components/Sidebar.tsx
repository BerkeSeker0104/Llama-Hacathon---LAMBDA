'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Planning', href: '/planning', icon: Calendar },
  { name: 'Changes', href: '/changes', icon: AlertTriangle },
  { name: 'Contracts', href: '/contracts', icon: FileText },
];

interface SidebarProps {
  companyName?: string;
}

export default function Sidebar({ companyName = "LAMBDA" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="glass-button border-[#00ff88] text-white"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 glass-card border-r border-white/10 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-white/10">
            <Building2 className="h-8 w-8 text-[#00ff88] mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">{companyName}</h1>
              <p className="text-sm text-gray-400">Project Manager</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#00ff88] text-black neon-glow"
                      : "text-gray-300 hover:bg-[#00ff88]/10 hover:text-[#00ff88]"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="text-xs text-gray-400 text-center">
              LAMBDA Project Manager v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
