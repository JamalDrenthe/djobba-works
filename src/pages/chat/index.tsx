import React from 'react';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Chat } from '@/components/chat/Chat';

export default function ChatListPage() {
  // In a real app, you'd get the current user from auth context
  const currentUserId = 'current-user-id'; // TODO: Get from auth

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Berichten</h1>
          <p className="text-muted-foreground">
            Communiceer direct met opdrachtgevers en professionals
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <Chat
            currentUserId={currentUserId}
            className="h-full"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
