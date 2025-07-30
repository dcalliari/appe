import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'maintenance' | 'general' | 'meeting';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await apiClient.getNotices();
        setNotices(response.notices || []);
      } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        toast({
          title: "Erro ao carregar avisos",
          description: "Não foi possível carregar os avisos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotices();
  }, [toast]);

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'meeting':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNoticeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'Manutenção';
      case 'meeting':
        return 'Reunião';
      default:
        return 'Informativo';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mural de Avisos</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Mural de Avisos</h2>
        <Badge variant="outline" className="rounded-full">
          {notices.length} {notices.length === 1 ? 'aviso' : 'avisos'}
        </Badge>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum aviso disponível</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${notice.type === 'maintenance' ? 'bg-warning/10 text-warning' :
                        notice.type === 'meeting' ? 'bg-primary/10 text-primary' :
                          'bg-secondary text-secondary-foreground'
                      }`}>
                      {getNoticeIcon(notice.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">
                        {notice.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getNoticeColor(notice.priority)} className="text-xs">
                          {getTypeLabel(notice.type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notice.priority === 'high' ? 'Alta' :
                            notice.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notice.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {notice.content}
                </p>

                {notice.expires_at && (
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Válido até: {formatDate(notice.expires_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
