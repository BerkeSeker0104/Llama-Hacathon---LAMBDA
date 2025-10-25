'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Plus, 
  Play, 
  Pause,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Plan, Sprint, Task } from '@/lib/firestore-schema';
import { PlanService } from '@/lib/firestore-service';

interface SprintPlanViewProps {
  contractId: string;
  onPlanGenerated?: (planId: string) => void;
}

export default function SprintPlanView({ contractId, onPlanGenerated }: SprintPlanViewProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [contractId]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const plansData = await PlanService.getPlansByContract(contractId);
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load sprint plans');
    } finally {
      setLoading(false);
    }
  };

  const generateSprintPlan = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          sprintDurationWeeks: 2
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sprint plan');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh plans
        await fetchPlans();
        onPlanGenerated?.(result.planId);
      } else {
        throw new Error(result.error || 'Sprint plan generation failed');
      }
    } catch (error) {
      console.error('Error generating sprint plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate sprint plan');
    } finally {
      setGenerating(false);
    }
  };

  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'todo':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading sprint plans...</span>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sprint Plans Yet</h3>
          <p className="text-gray-600 mb-4">
            Generate a sprint plan to break down your project into manageable sprints.
          </p>
        </div>
        <Button 
          onClick={generateSprintPlan}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Sprint Plan
            </>
          )}
        </Button>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sprint Plans</h3>
          <p className="text-sm text-gray-600">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Button 
          onClick={generateSprintPlan}
          disabled={generating}
          variant="outline"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Sprint Plans */}
      {plans.map((plan) => (
        <Card key={plan.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <CardDescription>
                  Version {plan.version} • {plan.sprints.length} sprints
                </CardDescription>
              </div>
              <Badge variant="outline" className={getSprintStatusColor(plan.status)}>
                {plan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.sprints.map((sprint) => (
                <div key={sprint.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Sprint {sprint.sprint_num}: {sprint.sprint_hedefi || sprint.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {sprint.tasks.length} tasks
                      </p>
                    </div>
                    <Badge variant="outline" className={getSprintStatusColor(sprint.status)}>
                      {sprint.status}
                    </Badge>
                  </div>
                  
                  {/* Tasks */}
                  <div className="space-y-2">
                    {sprint.tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                        {getTaskStatusIcon(task.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {task.title}
                          </p>
                          {task.description && task.description !== task.title && (
                            <p className="text-xs text-gray-600 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
