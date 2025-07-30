import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Clock, Check, X, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

interface VisitorRequest {
  id: string;
  requester_id: string;
  visitor_name: string;
  visitor_document?: string;
  visit_date: string;
  visit_time?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const VisitorsControl = () => {
  const [visitors, setVisitors] = useState<VisitorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_document: '',
    visit_date: '',
    visit_time: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadVisitorsData = async () => {
      try {
        const response = await apiClient.getVisitors();
        setVisitors(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar visitantes:', error);
        toast({
          title: "Erro ao carregar visitantes",
          description: "Não foi possível carregar a lista de visitantes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVisitorsData();
  }, [toast]);

  const loadVisitors = async () => {
    try {
      const response = await apiClient.getVisitors();
      setVisitors(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
      toast({
        title: "Erro ao carregar visitantes",
        description: "Não foi possível carregar a lista de visitantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.visitor_name || !formData.visit_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do visitante e data são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiClient.createVisitor({
        visitor_name: formData.visitor_name,
        visitor_document: formData.visitor_document,
        visit_date: formData.visit_date,
        visit_time: formData.visit_time
      });

      toast({
        title: "Solicitação criada",
        description: "Solicitação de visitante criada com sucesso."
      });

      setFormData({
        visitor_name: '',
        visitor_document: '',
        visit_date: '',
        visit_time: ''
      });
      setIsDialogOpen(false);
      loadVisitors();
    } catch (error) {
      console.error('Erro ao criar visitante:', error);
      toast({
        title: "Erro ao criar solicitação",
        description: "Não foi possível criar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.approveVisitor(id);
      toast({
        title: "Visitante aprovado",
        description: "A solicitação foi aprovada com sucesso."
      });
      loadVisitors();
    } catch (error) {
      console.error('Erro ao aprovar visitante:', error);
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.rejectVisitor(id);
      toast({
        title: "Visitante rejeitado",
        description: "A solicitação foi rejeitada."
      });
      loadVisitors();
    } catch (error) {
      console.error('Erro ao rejeitar visitante:', error);
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteVisitor(id);
      toast({
        title: "Solicitação removida",
        description: "A solicitação foi removida com sucesso."
      });
      loadVisitors();
    } catch (error) {
      console.error('Erro ao remover visitante:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a solicitação.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Controle de Visitantes</h2>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Controle de Visitantes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Visitante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="visitor_name">Nome do Visitante *</Label>
                <Input
                  id="visitor_name"
                  value={formData.visitor_name}
                  onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="visitor_document">Documento (CPF/RG)</Label>
                <Input
                  id="visitor_document"
                  value={formData.visitor_document}
                  onChange={(e) => setFormData({...formData, visitor_document: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="visit_date">Data da Visita *</Label>
                <Input
                  id="visit_date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="visit_time">Horário (opcional)</Label>
                <Input
                  id="visit_time"
                  type="time"
                  value={formData.visit_time}
                  onChange={(e) => setFormData({...formData, visit_time: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                Criar Solicitação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({visitors.filter(v => v.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados ({visitors.filter(v => v.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({visitors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {visitors.filter(v => v.status === 'pending').map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                user={user}
                showActions={true}
              />
            ))}
            {visitors.filter(v => v.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {visitors.filter(v => v.status === 'approved').map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                user={user}
                showActions={false}
              />
            ))}
            {visitors.filter(v => v.status === 'approved').length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Check className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum visitante aprovado</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {visitors.map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                user={user}
                showActions={visitor.status === 'pending'}
              />
            ))}
            {visitors.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface VisitorCardProps {
  visitor: VisitorRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  user: { id: string; role: string } | null;
  showActions: boolean;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ 
  visitor, 
  onApprove, 
  onReject, 
  onDelete, 
  user, 
  showActions 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{visitor.visitor_name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(visitor.status)}
                <span className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formatDate(visitor.visit_date)}
                  {visitor.visit_time && ` às ${visitor.visit_time}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visitor.visitor_document && (
            <p className="text-sm text-muted-foreground">
              <strong>Documento:</strong> {visitor.visitor_document}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            <strong>Solicitado em:</strong> {formatDate(visitor.created_at)}
          </p>
        </div>

        {showActions && user?.role === 'admin' && (
          <div className="flex space-x-2 mt-4">
            <Button
              size="sm"
              onClick={() => onApprove(visitor.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(visitor.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(visitor.id)}
            >
              Remover
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
