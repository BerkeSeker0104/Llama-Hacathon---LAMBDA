'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/firestore-schema';
import { 
  CheckSquare, 
  Clock, 
  User, 
  Star, 
  ArrowRight, 
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface WBSViewProps {
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function WBSView({ 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onToggleTask,
  showActions = true,
  className 
}: WBSViewProps) {
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return '✅';
      case 'in-progress': return '🔄';
      case 'todo': return '⏳';
      default: return '⏳';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'done': return 'default';
      case 'in-progress': return 'secondary';
      case 'todo': return 'outline';
      default: return 'outline';
    }
  };

  // Group tasks by epic
  const tasksByEpic = tasks.reduce((acc, task) => {
    const epicId = task.epicId || 'no-epic';
    if (!acc[epicId]) {
      acc[epicId] = [];
    }
    acc[epicId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get epic name (you might want to fetch this from your data)
  const getEpicName = (epicId: string) => {
    if (epicId === 'no-epic') return 'Epic Atanmamış';
    return `Epic ${epicId}`;
  };

  // Calculate epic progress
  const getEpicProgress = (epicTasks: Task[]) => {
    if (epicTasks.length === 0) return 0;
    const completedTasks = epicTasks.filter(t => t.status === 'done').length;
    return Math.round((completedTasks / epicTasks.length) * 100);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Work Breakdown Structure (WBS)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Proje görevleri ve epik'ler
              </p>
            </div>
            
            {showActions && onAddTask && (
              <Button onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Görev
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(tasksByEpic).map(([epicId, epicTasks]) => {
              const epicProgress = getEpicProgress(epicTasks);
              const epicName = getEpicName(epicId);
              
              return (
                <div key={epicId} className="border rounded-lg p-4">
                  {/* Epic Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{epicName}</h3>
                      <Badge variant="outline">
                        {epicTasks.length} görev
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${epicProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{epicProgress}%</span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    {epicTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg border ${getStatusColor(task.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{getStatusIcon(task.status)}</span>
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge variant={getStatusBadgeVariant(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}

                            {/* Task Details */}
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {task.assignee && (
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {task.assignee}
                                </div>
                              )}
                              
                              {task.estimatedHours && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {task.estimatedHours}h
                                </div>
                              )}
                              
                              {task.dueDate && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                </div>
                              )}
                            </div>

                            {/* Required Skills */}
                            {task.requiredSkills && task.requiredSkills.length > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm text-gray-600">Gerekli Skill'ler:</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.requiredSkills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Acceptance Criteria */}
                            {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-1">Kabul Kriterleri:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {task.acceptanceCriteria.map((criteria, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-gray-400 mr-2">•</span>
                                      {criteria}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Task Actions */}
                          {showActions && (
                            <div className="flex space-x-1 ml-4">
                              {onToggleTask && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onToggleTask(task.id)}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {onEditTask && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onEditTask(task.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {onDeleteTask && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Görev bulunamadı</h3>
                <p className="text-gray-600 mb-4">
                  Henüz hiç görev oluşturulmamış.
                </p>
                {showActions && onAddTask && (
                  <Button onClick={onAddTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Görevi Oluştur
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
