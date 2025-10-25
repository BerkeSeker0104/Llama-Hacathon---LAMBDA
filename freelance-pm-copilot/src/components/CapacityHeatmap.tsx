'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Team, Person } from '@/lib/firestore-schema';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface CapacityHeatmapProps {
  teams: Team[];
  people: Person[];
  className?: string;
}

export function CapacityHeatmap({ teams, people, className }: CapacityHeatmapProps) {
  
  // Get team people
  const getTeamPeople = (teamId: string) => {
    return people.filter(p => p.teamId === teamId);
  };

  // Calculate team capacity metrics
  const getTeamMetrics = (teamId: string) => {
    const teamPeople = getTeamPeople(teamId);
    if (teamPeople.length === 0) {
      return {
        totalCapacity: 0,
        currentWorkload: 0,
        availableCapacity: 0,
        utilizationRate: 0,
        avgWorkload: 0
      };
    }

    const totalCapacity = teamPeople.reduce((sum, p) => sum + p.hoursPerWeek, 0);
    const currentWorkload = teamPeople.reduce((sum, p) => sum + (p.hoursPerWeek * p.currentWorkload / 100), 0);
    const availableCapacity = totalCapacity - currentWorkload;
    const utilizationRate = totalCapacity > 0 ? (currentWorkload / totalCapacity) * 100 : 0;
    const avgWorkload = teamPeople.reduce((sum, p) => sum + p.currentWorkload, 0) / teamPeople.length;

    return {
      totalCapacity,
      currentWorkload,
      availableCapacity,
      utilizationRate,
      avgWorkload
    };
  };

  // Get capacity color
  const getCapacityColor = (utilizationRate: number) => {
    if (utilizationRate > 90) return 'bg-red-500';
    if (utilizationRate > 75) return 'bg-orange-500';
    if (utilizationRate > 50) return 'bg-yellow-500';
    if (utilizationRate > 25) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get capacity status
  const getCapacityStatus = (utilizationRate: number) => {
    if (utilizationRate > 90) return { status: 'Overloaded', color: 'text-red-600' };
    if (utilizationRate > 75) return { status: 'High', color: 'text-orange-600' };
    if (utilizationRate > 50) return { status: 'Medium', color: 'text-yellow-600' };
    if (utilizationRate > 25) return { status: 'Low', color: 'text-blue-600' };
    return { status: 'Available', color: 'text-green-600' };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Ekip Kapasitesi
        </CardTitle>
      </CardHeader>
      <div>
        <div className="space-y-4">
          {teams.map(team => {
            const metrics = getTeamMetrics(team.id);
            const teamPeople = getTeamPeople(team.id);
            const capacityStatus = getCapacityStatus(metrics.utilizationRate);
            
            return (
              <div key={team.id} className="glass-card p-4 bg-black/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-600" />
                    <h3 className="font-medium">{team.name}</h3>
                    <Badge className="ml-2 bg-[#00ff88]/20 text-[#00ff88]">
                      {teamPeople.length} members
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${capacityStatus.color}`}>
                      {capacityStatus.status}
                    </p>
                    <p className="text-xs text-gray-600">
                      {Math.round(metrics.utilizationRate)}% kullanım
                    </p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Kapasite Kullanımı</span>
                    <span>{Math.round(metrics.currentWorkload)}h / {metrics.totalCapacity}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getCapacityColor(metrics.utilizationRate)}`}
                      style={{ width: `${Math.min(metrics.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-600">Müsait Kapasite:</p>
                    <p className="font-medium">{Math.round(metrics.availableCapacity)}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ortalama Yük:</p>
                    <p className="font-medium">{Math.round(metrics.avgWorkload)}%</p>
                  </div>
                </div>

                {/* Warnings */}
                {metrics.utilizationRate > 90 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">
                      Ekip aşırı yüklü! Yeni görev ataması önerilmez.
                    </span>
                  </div>
                )}
                
                {metrics.utilizationRate > 75 && metrics.utilizationRate <= 90 && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-700">
                      Ekip yüksek kapasitede. Dikkatli görev ataması yapın.
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {teams.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ekip bulunamadı</h3>
              <p className="text-gray-600">
                Henüz hiç ekip oluşturulmamış.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
