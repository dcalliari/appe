import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'image';
  status: 'sent' | 'delivered' | 'read';
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Boa tarde! Chegou uma encomenda para vocês.',
    senderId: 'concierge',
    senderName: 'Portaria',
    timestamp: '2024-01-12T14:30:00',
    type: 'text',
    status: 'read'
  },
  {
    id: '2',
    content: 'Oi! Que tipo de encomenda?',
    senderId: '1',
    senderName: 'João Silva',
    timestamp: '2024-01-12T14:32:00',
    type: 'text',
    status: 'delivered'
  },
  {
    id: '3',
    content: 'É uma caixa dos Correios. Remetente: Magazine Luiza.',
    senderId: 'concierge',
    senderName: 'Portaria',
    timestamp: '2024-01-12T14:33:00',
    type: 'text',
    status: 'read'
  }
];

export const ChatPortaria = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user!.id,
      senderName: user!.name,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
    if (newMessage.toLowerCase().includes('entrega') || newMessage.toLowerCase().includes('encomenda')) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const response: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Deixe-me verificar se há alguma encomenda para o seu apartamento.',
            senderId: 'concierge',
            senderName: 'Portaria',
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent'
          };
          setMessages(prev => [...prev, response]);
          setIsTyping(false);
        }, 2000);
      }, 1500);
    }

    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada para a portaria."
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>Chat com Portaria</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                      }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-medium mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {isOwnMessage && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[70%]">
                  <p className="text-xs font-medium mb-1">Portaria</p>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="px-3">
                <Image className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};