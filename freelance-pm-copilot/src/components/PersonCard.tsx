'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Person, PersonSkill } from '@/lib/firestore-schema';
import { Star, Clock, Users, TrendingUp } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  skills: PersonSkill[];
  teamName?: string;
  onViewDetails?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export function PersonCard({ 
  person, 
  skills, 
  teamName, 
  onViewDetails, 
  onEdit, 
  showActions = true 
}: PersonCardProps) {
  
  // Get skill level stars
  const getSkillLevelStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Get workload color
  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'text-red-600';
    if (workload > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get workload bar color
  const getWorkloadBarColor = (workload: number) => {
    if (workload > 80) return 'bg-red-500';
    if (workload > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'manager': return 'default';
      case 'developer': return 'secondary';
      case 'designer': return 'outline';
      case 'qa': return 'destructive';
      case 'devops': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{person.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{person.email}</p>
          </div>
          <Badge variant={getRoleBadgeVariant(person.role)}>
            {person.role}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Team */}
        {teamName && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {teamName}
          </div>
        )}

        {/* Workload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Mevcut Yük:</span>
            <span className={`text-sm font-medium ${getWorkloadColor(person.currentWorkload)}`}>
              {person.currentWorkload}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getWorkloadBarColor(person.currentWorkload)}`}
              style={{ width: `${person.currentWorkload}%` }}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Müsaitlik:</span>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{person.hoursPerWeek}h/hafta</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Skill'ler:</p>
          <div className="space-y-2">
            {skills.slice(0, 3).map(skill => (
              <div key={skill.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm font-medium">{skill.skillKey}</span>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {getSkillLevelStars(skill.level)}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({skill.level}/5)</span>
                </div>
              </div>
            ))}
            
            {skills.length > 3 && (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  +{skills.length - 3} daha fazla skill
                </Badge>
              </div>
            )}
            
            {skills.length === 0 && (
              <p className="text-sm text-gray-500 italic">Henüz skill eklenmemiş</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="pt-3 border-t space-y-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onViewDetails}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Detayları Görüntüle
              </Button>
            )}
            
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={onEdit}
              >
                Düzenle
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Skill Level Stars Component
export function SkillLevelStars({ level }: { level: number }) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star 
          key={i} 
          className={`h-3 w-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );
}

// Workload Indicator Component
export function WorkloadIndicator({ workload }: { workload: number }) {
  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'text-red-600';
    if (workload > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWorkloadBarColor = (workload: number) => {
    if (workload > 80) return 'bg-red-500';
    if (workload > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getWorkloadBarColor(workload)}`}
          style={{ width: `${workload}%` }}
        />
      </div>
      <span className={`text-sm font-medium ${getWorkloadColor(workload)}`}>
        {workload}%
      </span>
    </div>
  );
}
