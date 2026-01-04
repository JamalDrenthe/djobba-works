import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  CheckCircle,
  Settings,
  ExternalLink,
  X,
  Circle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Notification } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      supabase.removeAllChannels();
    };
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const userId = 'current-user-id';
    
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
          if (!newNotification.is_read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = 'current-user-id';
      
      await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'contract':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case 'review':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'contract':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'payment':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'review':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and data
    switch (notification.type) {
      case 'message':
        // Navigate to chat
        window.location.href = `/chat/${notification.data.thread_id}`;
        break;
      case 'contract':
        // Navigate to contract details
        window.location.href = `/contracts/${notification.data.contract_id}`;
        break;
      case 'payment':
        // Navigate to wallet
        window.location.href = '/professionals/wallet';
        break;
      case 'application':
        // Navigate to assignment
        window.location.href = `/opdrachten/${notification.data.assignment_id}`;
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 shadow-lg z-50">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notificaties</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Alles gelezen
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2" />
                  <p className="text-sm">Geen notificaties</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-colors ${getNotificationColor(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <Circle className="h-2 w-2 fill-blue-500 text-blue-500 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: nl
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t">
              <Link to="/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Bekijk alle notificaties</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Full Notification Page Component
export function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user-id';
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const notificationTypes = [
    { value: 'all', label: 'Alle', count: notifications.length },
    { value: 'message', label: 'Berichten', count: notifications.filter(n => n.type === 'message').length },
    { value: 'contract', label: 'Contracten', count: notifications.filter(n => n.type === 'contract').length },
    { value: 'payment', label: 'Betalingen', count: notifications.filter(n => n.type === 'payment').length },
    { value: 'system', label: 'Systeem', count: notifications.filter(n => n.type === 'system').length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notificaties</h1>
          <p className="text-muted-foreground">
            Blijf op de hoogte van alle belangrijke updates
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Filters
                </h3>
                <div className="space-y-1">
                  {notificationTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilter(type.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === type.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{type.label}</span>
                        {type.count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {type.count}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Bell className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Geen notificaties</p>
                    <p className="text-sm">
                      {filter !== 'all' ? `Geen ${filter} notificaties` : 'Je hebt geen notificaties'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          // Handle notification click
                          if (!notification.is_read) {
                            // Mark as read logic
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {notification.type === 'message' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                            {notification.type === 'contract' && <FileText className="h-5 w-5 text-green-500" />}
                            {notification.type === 'payment' && <CreditCard className="h-5 w-5 text-yellow-500" />}
                            {notification.type === 'review' && <CheckCircle className="h-5 w-5 text-purple-500" />}
                            {notification.type === 'system' && <Bell className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{notification.title}</h3>
                                <p className="text-muted-foreground">{notification.message}</p>
                              </div>
                              {!notification.is_read && (
                                <Badge variant="secondary" className="text-xs">
                                  Nieuw
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: nl
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
