import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Message, MessageThread } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ChatWindowProps {
  threadId: string;
  currentUserId: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar?: string;
    online?: boolean;
  };
  onNewThread?: (userId: string) => void;
  className?: string;
}

export function ChatWindow({ 
  threadId, 
  currentUserId, 
  otherParticipant,
  onNewThread,
  className = ''
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(otherParticipant.online || false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToTyping();
    subscribeToOnlineStatus();

    return () => {
      supabase.removeAllChannels();
    };
  }, [threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if it's not from current user
          if (newMessage.sender_id !== currentUserId) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing:${threadId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setIsTyping(payload.payload.isTyping);
        }
      })
      .subscribe();
  };

  const subscribeToOnlineStatus = () => {
    const channel = supabase
      .channel(`online:${otherParticipant.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setIsOnline(state[otherParticipant.id]?.length > 0);
      })
      .subscribe(async () => {
        await channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString()
        });
      });
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      
      // Update thread's last message
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', threadId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${threadId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Send message with file
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: currentUserId,
          file_url: publicUrl,
          file_type: file.type
        });

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Broadcast typing status
    const channel = supabase.channel(`typing:${threadId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, isTyping: value.length > 0 }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant.avatar} />
            <AvatarFallback>
              {otherParticipant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        
        <div className="flex-1">
          <CardTitle className="text-lg">{otherParticipant.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                    {!isOwn && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {otherParticipant.name}
                      </p>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.file_url && (
                        <div className="mt-2">
                          {message.file_type?.startsWith('image/') ? (
                            <img
                              src={message.file_url}
                              alt="Shared image"
                              className="rounded max-w-full h-auto"
                            />
                          ) : (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <Paperclip className="h-4 w-4" />
                              Bekijk bestand
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                      isOwn ? 'justify-end' : ''
                    }`}>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: nl
                        })}
                      </span>
                      
                      {isOwn && (
                        <>
                          {message.is_read ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              aria-label="Upload bestand"
              title="Upload bestand"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            
            <Input
              placeholder="Typ een bericht..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatWindow;
