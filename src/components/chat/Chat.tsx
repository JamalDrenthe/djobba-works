import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquarePlus, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { MessageThread, MessageThreadWithDetails } from '@/types/database';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';

interface ChatProps {
  currentUserId: string;
  assignmentId?: string;
  initialParticipantId?: string;
  className?: string;
}

export function Chat({ 
  currentUserId, 
  assignmentId,
  initialParticipantId,
  className = ''
}: ChatProps) {
  const [selectedThread, setSelectedThread] = useState<MessageThreadWithDetails | null>(null);
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{
    id: string;
    first_name: string;
    last_name: string;
    account_type: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const handleNewThread = () => {
    if (assignmentId) {
      // Create thread for assignment
      createAssignmentThread();
    } else {
      // Show user selection dialog
      setShowNewThreadDialog(true);
      fetchAvailableUsers();
    }
  };

  const createAssignmentThread = async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      
      // Get assignment details to find the other participant
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('employer_id, applications(professional_id)')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      // Determine other participant (simplified - in real app, this would be more complex)
      const otherParticipantId = currentUserId === assignment.employer_id 
        ? assignment.applications?.[0]?.professional_id
        : assignment.employer_id;

      if (!otherParticipantId) {
        throw new Error('Could not determine other participant');
      }

      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('*')
        .eq('assignment_id', assignmentId)
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .single();

      if (existingThread) {
        // Thread exists, select it
        const enrichedThread = await enrichThread(existingThread);
        setSelectedThread(enrichedThread);
      } else {
        // Create new thread
        const { data: newThread, error: threadError } = await supabase
          .from('message_threads')
          .insert({
            participant1_id: currentUserId,
            participant2_id: otherParticipantId,
            assignment_id: assignmentId
          })
          .select()
          .single();

        if (threadError) throw threadError;

        const enrichedThread = await enrichThread(newThread);
        setSelectedThread(enrichedThread);
      }
    } catch (error) {
      console.error('Error creating assignment thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrichThread = async (thread: MessageThread): Promise<MessageThreadWithDetails> => {
    const otherParticipantId = thread.participant1_id === currentUserId 
      ? thread.participant2_id 
      : thread.participant1_id;

    // Get other participant profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', otherParticipantId)
      .single();

    // Get assignment title
    const { data: assignment } = await supabase
      .from('assignments')
      .select('title')
      .eq('id', thread.assignment_id)
      .single();

    return {
      ...thread,
      other_participant_id: otherParticipantId,
      other_participant_name: profile 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : 'Onbekende gebruiker',
      last_message: '',
      unread_count: 0,
      assignment_title: assignment?.title
    };
  };

  const fetchAvailableUsers = async () => {
    try {
      // This is a simplified version - in production, you'd have proper user search
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, account_type')
        .neq('id', currentUserId)
        .limit(50);

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createThreadWithUser = async (otherUserId: string) => {
    try {
      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('*')
        .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`)
        .single();

      if (existingThread) {
        const enrichedThread = await enrichThread(existingThread);
        setSelectedThread(enrichedThread);
      } else {
        // Create new thread
        const { data: newThread, error } = await supabase
          .from('message_threads')
          .insert({
            participant1_id: currentUserId,
            participant2_id: otherUserId
          })
          .select()
          .single();

        if (error) throw error;

        const enrichedThread = await enrichThread(newThread);
        setSelectedThread(enrichedThread);
      }

      setShowNewThreadDialog(false);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  // Auto-select initial thread if provided
  React.useEffect(() => {
    if (initialParticipantId) {
      createThreadWithUser(initialParticipantId);
    }
  }, [initialParticipantId, createThreadWithUser]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat List */}
      <div className="w-80 border-r">
        <ChatList
          currentUserId={currentUserId}
          selectedThreadId={selectedThread?.id}
          onThreadSelect={setSelectedThread}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedThread ? (
          <ChatWindow
            threadId={selectedThread.id}
            currentUserId={currentUserId}
            otherParticipant={{
              id: selectedThread.other_participant_id,
              name: selectedThread.other_participant_name,
              avatar: selectedThread.other_participant_avatar
            }}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageSquarePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecteer een gesprek</h3>
              <p className="text-muted-foreground mb-4">
                Kies een gesprek uit de lijst of start een nieuw gesprek
              </p>
              <Button onClick={handleNewThread} disabled={loading}>
                {loading ? 'Laden...' : 'Nieuw gesprek'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuw gesprek starten</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Zoek gebruiker</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Typ naam..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => createThreadWithUser(user.id)}
                >
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.account_type}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Chat;
