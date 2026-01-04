import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MessageSquarePlus,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { MessageThread, Message } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ChatListProps {
  currentUserId: string;
  selectedThreadId?: string;
  onThreadSelect: (thread: MessageThreadWithDetails) => void;
  onNewThread: () => void;
  className?: string;
}

interface MessageThreadWithDetails extends MessageThread {
  other_participant_name: string;
  other_participant_id: string;
  other_participant_avatar?: string;
  last_message?: string;
  unread_count: number;
  assignment_title?: string;
}

export function ChatList({ 
  currentUserId, 
  selectedThreadId,
  onThreadSelect,
  onNewThread,
  className = ''
}: ChatListProps) {
  const [threads, setThreads] = useState<MessageThreadWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
    subscribeToNewMessages();
  }, [currentUserId]);

  const fetchThreads = async () => {
    try {
      // Fetch threads where user is a participant
      const { data: threads, error: threadsError } = await supabase
        .from('message_threads')
        .select(`
          *,
          assignments!inner(title)
        `)
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false });

      if (threadsError) throw threadsError;

      // Enrich threads with participant details and last message
      const enrichedThreads = await Promise.all(
        (threads || []).map(async (thread) => {
          // Determine other participant
          const otherParticipantId = thread.participant1_id === currentUserId 
            ? thread.participant2_id 
            : thread.participant1_id;

          // Get other participant profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', otherParticipantId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, is_read')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .eq('sender_id', otherParticipantId)
            .eq('is_read', false);

          return {
            ...thread,
            other_participant_id: otherParticipantId,
            other_participant_name: profile 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : 'Onbekende gebruiker',
            other_participant_avatar: undefined, // TODO: Add avatar support
            last_message: lastMessage?.content || '',
            unread_count: unreadCount || 0,
            assignment_title: thread.assignments?.title
          };
        })
      );

      setThreads(enrichedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewMessages = () => {
    const channel = supabase
      .channel('chat-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch threads when messages change
          fetchThreads();
        }
      )
      .subscribe();
  };

  const filteredThreads = threads.filter(thread =>
    thread.other_participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.assignment_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Berichten</h2>
          <Button size="sm" onClick={onNewThread}>
            <MessageSquarePlus className="h-4 w-4 mr-1" />
            Nieuw
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek gesprekken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length > 0 ? (
          <div className="divide-y">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isSelected={thread.id === selectedThreadId}
                onClick={() => onThreadSelect(thread)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen gesprekken gevonden</p>
            <Button variant="outline" className="mt-4" onClick={onNewThread}>
              Start een nieuw gesprek
            </Button>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

interface ThreadItemProps {
  thread: MessageThreadWithDetails;
  isSelected: boolean;
  onClick: () => void;
}

function ThreadItem({ thread, isSelected, onClick }: ThreadItemProps) {
  return (
    <div
      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
        isSelected ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={thread.other_participant_avatar} />
          <AvatarFallback>
            {thread.other_participant_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {thread.other_participant_name}
              </p>
              {thread.assignment_title && (
                <p className="text-xs text-muted-foreground">
                  Re: {thread.assignment_title}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {thread.last_message_at && (
                  <span>
                    {formatDistanceToNow(new Date(thread.last_message_at), {
                      addSuffix: false,
                      locale: nl
                    })}
                  </span>
                )}
              </span>
              
              {thread.unread_count > 0 && (
                <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-xs">
                  {thread.unread_count}
                </Badge>
              )}
            </div>
          </div>

          {/* Last Message */}
          <p className="text-sm text-muted-foreground truncate">
            {thread.last_message || 'Geen berichten'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatList;
