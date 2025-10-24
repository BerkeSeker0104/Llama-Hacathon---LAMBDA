'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  TrendingUp,
  Plus,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Plan {
  id: string;
  version: number;
  contractId: string;
  contractTitle: string;
  sprints: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      status: 'todo' | 'in-progress' | 'done';
      assignee?: string;
    }>;
  }>;
  timeline: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  createdAt: string;
}

export default function PlanningPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('1');

  // Mock data for demo
  const plans: Plan[] = [
    {
      id: '1',
      version: 1,
      contractId: 'contract_1',
      contractTitle: 'Acme Corp Website',
      sprints: [
        {
          id: 'sprint_1',
          name: 'Sprint 1: Design & Planning',
          startDate: '2024-01-15',
          endDate: '2024-01-29',
          tasks: [
            {
              id: 'task_1',
              title: 'Wireframe Creation',
              description: 'Create wireframes for all pages',
              status: 'done',
              assignee: 'Designer'
            },
            {
              id: 'task_2',
              title: 'UI/UX Design',
              description: 'Design modern UI with responsive layout',
              status: 'in-progress',
              assignee: 'Designer'
            },
            {
              id: 'task_3',
              title: 'Design Review',
              description: 'Client review and approval',
              status: 'todo',
              assignee: 'Client'
            }
          ]
        },
        {
          id: 'sprint_2',
          name: 'Sprint 2: Development',
          startDate: '2024-01-30',
          endDate: '2024-02-12',
          tasks: [
            {
              id: 'task_4',
              title: 'Frontend Development',
              description: 'Build responsive frontend components',
              status: 'todo',
              assignee: 'Developer'
            },
            {
              id: 'task_5',
              title: 'Backend API',
              description: 'Develop RESTful API endpoints',
              status: 'todo',
              assignee: 'Developer'
            },
            {
              id: 'task_6',
              title: 'Database Setup',
              description: 'Configure database and models',
              status: 'todo',
              assignee: 'Developer'
            }
          ]
        }
      ],
      timeline: {
        optimistic: '2024-02-15',
        realistic: '2024-02-22',
        pessimistic: '2024-03-01'
      },
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      version: 2,
      contractId: 'contract_1',
      contractTitle: 'Acme Corp Website',
      sprints: [
        {
          id: 'sprint_1_v2',
          name: 'Sprint 1: Design & Planning (v2)',
          startDate: '2024-01-15',
          endDate: '2024-01-29',
          tasks: [
            {
              id: 'task_1_v2',
              title: 'Wireframe Creation',
              description: 'Create wireframes for all pages',
              status: 'done',
              assignee: 'Designer'
            },
            {
              id: 'task_2_v2',
              title: 'UI/UX Design',
              description: 'Design modern UI with responsive layout',
              status: 'done',
              assignee: 'Designer'
            },
            {
              id: 'task_3_v2',
              title: 'Design Review',
              description: 'Client review and approval',
              status: 'done',
              assignee: 'Client'
            },
            {
              id: 'task_new_1',
              title: 'Blog Section Design',
              description: 'Design blog layout and components',
              status: 'in-progress',
              assignee: 'Designer'
            }
          ]
        },
        {
          id: 'sprint_2_v2',
          name: 'Sprint 2: Development (v2)',
          startDate: '2024-01-30',
          endDate: '2024-02-12',
          tasks: [
            {
              id: 'task_4_v2',
              title: 'Frontend Development',
              description: 'Build responsive frontend components',
              status: 'todo',
              assignee: 'Developer'
            },
            {
              id: 'task_5_v2',
              title: 'Backend API',
              description: 'Develop RESTful API endpoints',
              status: 'todo',
              assignee: 'Developer'
            },
            {
              id: 'task_6_v2',
              title: 'Database Setup',
              description: 'Configure database and models',
              status: 'todo',
              assignee: 'Developer'
            },
            {
              id: 'task_new_2',
              title: 'Blog CMS Development',
              description: 'Build blog content management system',
              status: 'todo',
              assignee: 'Developer'
            }
          ]
        }
      ],
      timeline: {
        optimistic: '2024-02-20',
        realistic: '2024-02-27',
        pessimistic: '2024-03-05'
      },
      createdAt: '2024-01-12'
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan);
  const otherPlans = plans.filter(p => p.id !== selectedPlan);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge variant="default">Done</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'todo':
        return <Badge variant="outline">Todo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Planning</h1>
              <p className="text-gray-600">Manage project timelines and sprint planning</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Plan
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Plan Versions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Plan Versions</CardTitle>
                <CardDescription>Select a plan version to view</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan === plan.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">v{plan.version}</span>
                      <Badge variant={plan.id === selectedPlan ? 'default' : 'outline'}>
                        {plan.id === selectedPlan ? 'Current' : 'Previous'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{plan.contractTitle}</p>
                    <p className="text-xs text-gray-500">Created: {plan.createdAt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Planning Content */}
          <div className="lg:col-span-3">
            {currentPlan && (
              <div className="space-y-6">
                {/* Timeline Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Timeline Overview - v{currentPlan.version}
                    </CardTitle>
                    <CardDescription>
                      AI-generated timeline based on project scope and historical data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-1">Optimistic</h3>
                        <p className="text-2xl font-bold text-green-600">{currentPlan.timeline.optimistic}</p>
                        <p className="text-sm text-green-600">Best case scenario</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-1">Realistic</h3>
                        <p className="text-2xl font-bold text-blue-600">{currentPlan.timeline.realistic}</p>
                        <p className="text-sm text-blue-600">Most likely outcome</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <h3 className="font-medium text-red-800 mb-1">Pessimistic</h3>
                        <p className="text-2xl font-bold text-red-600">{currentPlan.timeline.pessimistic}</p>
                        <p className="text-sm text-red-600">Worst case scenario</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sprint Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Sprint Timeline
                    </CardTitle>
                    <CardDescription>
                      Detailed sprint breakdown with tasks and assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {currentPlan.sprints.map((sprint, sprintIndex) => (
                        <div key={sprint.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{sprint.name}</h3>
                              <p className="text-sm text-gray-600">
                                {sprint.startDate} - {sprint.endDate}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {sprint.tasks.filter(t => t.status === 'done').length} / {sprint.tasks.length} tasks
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {sprint.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(task.status)}
                                  <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(task.status)}
                                  {task.assignee && (
                                    <Badge variant="outline" className="text-xs">
                                      <Users className="h-3 w-3 mr-1" />
                                      {task.assignee}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Comparison */}
                {otherPlans.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Comparison</CardTitle>
                      <CardDescription>
                        Compare this plan with previous versions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {otherPlans.map((plan) => (
                          <div key={plan.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">v{plan.version} - {plan.contractTitle}</h3>
                              <Badge variant="outline">Previous</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Optimistic:</span> {plan.timeline.optimistic}
                              </div>
                              <div>
                                <span className="font-medium">Realistic:</span> {plan.timeline.realistic}
                              </div>
                              <div>
                                <span className="font-medium">Pessimistic:</span> {plan.timeline.pessimistic}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium">Sprints:</span> {plan.sprints.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
