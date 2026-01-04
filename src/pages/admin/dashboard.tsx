import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
  Activity,
  Zap,
  Building2,
  FileText,
  CreditCard,
  Shield,
  Ban,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProfessionals: number;
  totalEmployers: number;
  openAssignments: number;
  shortAssignments: number;
  longAssignments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgTimeToFill: number;
  pendingReviews: number;
  pendingFactoring: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'assignment_created' | 'contract_signed' | 'review_posted' | 'factoring_requested';
  message: string;
  timestamp: string;
  userId?: string;
  details?: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  useEffect(() => {
    fetchAdminData();
    const subscription = supabase
      .channel('admin-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'audit_logs' 
      }, () => {
        fetchAdminData();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [selectedPeriod]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch user statistics
      const { data: userStats } = await supabase
        .from('user_profiles')
        .select('user_type, last_active_at')
        .eq('is_active', true);

      const professionals = userStats?.filter(u => u.user_type === 'professional').length || 0;
      const employers = userStats?.filter(u => u.user_type === 'employer').length || 0;
      const activeUsers = userStats?.filter(u => {
        if (!u.last_active_at) return false;
        const lastActive = new Date(u.last_active_at);
        const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 7;
      }).length || 0;

      // Fetch assignment statistics
      const { data: assignments } = await supabase
        .from('assignments')
        .select('type, status, created_at')
        .eq('status', 'open');

      const shortAssignments = assignments?.filter(a => a.type === 'short').length || 0;
      const longAssignments = assignments?.filter(a => a.type === 'permanent').length || 0;

      // Fetch revenue data
      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('amount_cents, created_at')
        .gte('created_at', getDateFromPeriod(selectedPeriod));

      const totalRevenue = (transactions || []).reduce((sum, t) => sum + t.amount_cents, 0) / 100;
      const monthlyRevenue = totalRevenue / (selectedPeriod === '7d' ? 0.25 : selectedPeriod === '30d' ? 1 : 3);

      // Fetch pending items
      const { count: pendingReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingFactoring } = await supabase
        .from('factoring_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate average time to fill
      const { data: contracts } = await supabase
        .from('contracts')
        .select('created_at, start_date')
        .not('start_date', 'is', null);

      const avgTimeToFill = contracts && contracts.length > 0 
        ? contracts.reduce((sum, c) => {
            const created = new Date(c.created_at);
            const started = new Date(c.start_date);
            return sum + (started.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / contracts.length
        : 0;

      // Fetch recent activity
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const activity: RecentActivity[] = (auditLogs || []).map(log => ({
        id: log.id,
        type: log.action,
        message: getActivityMessage(log),
        timestamp: log.created_at,
        userId: log.user_id,
        details: log.details
      }));

      setStats({
        totalUsers: userStats?.length || 0,
        activeUsers,
        totalProfessionals: professionals,
        totalEmployers: employers,
        openAssignments: assignments?.length || 0,
        shortAssignments,
        longAssignments,
        totalRevenue,
        monthlyRevenue,
        avgTimeToFill,
        pendingReviews: pendingReviews || 0,
        pendingFactoring: pendingFactoring || 0,
        systemHealth: 'healthy'
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFromPeriod = (period: string) => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  };

  const getActivityMessage = (log: any) => {
    switch (log.action) {
      case 'user_registered':
        return `Nieuwe gebruiker geregistreerd: ${log.details?.email || 'Onbekend'}`;
      case 'assignment_created':
        return `Nieuwe opdracht aangemaakt: ${log.details?.title || 'Onbekend'}`;
      case 'contract_signed':
        return `Contract ondertekend: ${log.details?.assignment_title || 'Onbekend'}`;
      case 'review_posted':
        return `Review geplaatst voor ${log.details?.assignment_title || 'Onbekend'}`;
      case 'factoring_requested':
        return `Factoring verzoek: €${(log.details?.amount || 0) / 100}`;
      default:
        return log.details?.message || 'Onbekende activiteit';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportData = async (type: 'users' | 'assignments' | 'transactions') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-admin-data', {
        body: { type, period: selectedPeriod }
      });

      if (error) throw error;

      // Download the file
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `${type}-export-${selectedPeriod}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Page Header */}
          <div className="border-b bg-muted/30">
            <div className="container px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    Platform beheer en statistieken
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={selectedPeriod} onValueChange={(value: string) => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Laatste 7 dagen</SelectItem>
                      <SelectItem value="30d">Laatste 30 dagen</SelectItem>
                      <SelectItem value="90d">Laatste 90 dagen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchAdminData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                  Ververs
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-8 py-8">
          {/* System Health Alert */}
          {stats && (
            <Card className={`mb-8 ${getHealthColor(stats.systemHealth)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Systeem Status</p>
                      <p className="text-sm opacity-75">
                        {stats.systemHealth === 'healthy' ? 'Alle systemen functioneren normaal' :
                         stats.systemHealth === 'warning' ? 'Sommige systemen vereisen aandacht' :
                         'Kritieke problemen gedetecteerd'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSystemDetails(!showSystemDetails)}
                  >
                    {showSystemDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('nl-NL')}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeUsers} actief (7 dagen)
                  </p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-blue-600">{stats.totalProfessionals} professionals</span>
                    <span className="text-green-600">{stats.totalEmployers} employers</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Opdrachten</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.shortAssignments} kort / {stats.longAssignments} vast
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Omzet</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <p className="text-xs text-muted-foreground">
                    €{stats.monthlyRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/maand
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gem. Time-to-Fill</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(stats.avgTimeToFill)} dagen</div>
                  <p className="text-xs text-muted-foreground">
                    Van publicatie tot contract
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions & Pending Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Snelle Acties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col" asChild>
                    <a href="/admin/users">
                      <Users className="h-6 w-6 mb-2" />
                      Gebruikers
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" asChild>
                    <a href="/admin/assignments">
                      <Briefcase className="h-6 w-6 mb-2" />
                      Opdrachten
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" asChild>
                    <a href="/admin/moderation">
                      <FileText className="h-6 w-6 mb-2" />
                      Moderatie
                    </a>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" asChild>
                    <a href="/admin/financials">
                      <CreditCard className="h-6 w-6 mb-2" />
                      Financieel
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Wachtende Acties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Reviews</span>
                      </div>
                      <Badge variant="secondary">{stats.pendingReviews}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Factoring</span>
                      </div>
                      <Badge variant="secondary">{stats.pendingFactoring}</Badge>
                    </div>
                  </>
                )}
                <Button className="w-full" asChild>
                  <a href="/admin/moderation">Bekijk alles</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & System Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recente Activiteit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Geen recente activiteit</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="mt-1">
                          {activity.type === 'user_registered' && <Users className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'assignment_created' && <Briefcase className="h-4 w-4 text-green-500" />}
                          {activity.type === 'contract_signed' && <CheckCircle2 className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'review_posted' && <FileText className="h-4 w-4 text-yellow-500" />}
                          {activity.type === 'factoring_requested' && <CreditCard className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { 
                              addSuffix: true, 
                              locale: nl 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {showSystemDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Systeem Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-mono">142ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate (24u)</span>
                      <span className="text-sm font-mono">0.12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="text-sm font-mono">2.4 GB</span>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download System Log
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Export Options */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => exportData('users')}>
                  <Users className="h-4 w-4 mr-2" />
                  Exporteer Gebruikers
                </Button>
                <Button variant="outline" onClick={() => exportData('assignments')}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Exporteer Opdrachten
                </Button>
                <Button variant="outline" onClick={() => exportData('transactions')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Exporteer Transacties
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
