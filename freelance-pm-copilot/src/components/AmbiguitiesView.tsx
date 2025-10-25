'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ambiguity } from '@/lib/firestore-schema';
import { AlertTriangle, MessageSquare, Edit, CheckCircle } from 'lucide-react';

interface AmbiguitiesViewProps {
  ambiguities: Ambiguity[];
  onResolve?: (ambiguityId: string) => void;
  onEdit?: (ambiguityId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function AmbiguitiesView({ 
  ambiguities, 
  onResolve, 
  onEdit, 
  showActions = true,
  className 
}: AmbiguitiesViewProps) {
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Sort ambiguities by severity
  const sortedAmbiguities = [...ambiguities].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Belirsizlikler & Netleştirme Gereken Maddeler
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sözleşmede tespit edilen belirsizlikler ve önerilen düzeltmeler
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAmbiguities.map(ambiguity => (
              <div 
                key={ambiguity.id} 
                className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(ambiguity.severity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSeverityIcon(ambiguity.severity)}</span>
                    <Badge variant={getSeverityBadgeVariant(ambiguity.severity)}>
                      {ambiguity.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {showActions && (
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(ambiguity.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                      )}
                      
                      {onResolve && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onResolve(ambiguity.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Çözüldü
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Issue Description */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Sorun:</h4>
                  <p className="text-gray-700">{ambiguity.issue}</p>
                </div>

                {/* Original Clause */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Orijinal Madde:</h4>
                  <div className="bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                    <p className="text-sm text-gray-700 italic">"{ambiguity.clause}"</p>
                  </div>
                </div>

                {/* Suggested Redline */}
                {ambiguity.suggestedRedline && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Önerilen Düzeltme:</h4>
                    <div className="bg-green-50 p-3 rounded border-l-2 border-green-300">
                      <p className="text-sm text-green-700">{ambiguity.suggestedRedline}</p>
                    </div>
                  </div>
                )}

                {/* Clarification Questions */}
                {ambiguity.clarificationQuestions && ambiguity.clarificationQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Netleştirme Soruları:
                    </h4>
                    <ul className="space-y-1">
                      {ambiguity.clarificationQuestions.map((question, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {ambiguities.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belirsizlik bulunamadı</h3>
                <p className="text-gray-600">
                  Sözleşmede tespit edilen belirsizlik bulunmuyor. Harika! 🎉
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
