import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  FileText, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import UserManagementTable from '@/components/admin/UserManagementTable';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'assignments' | 'analytics'>('overview');
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (activeTab === 'overview') {
      fetchQuickStats();
    }
  }, [activeTab]);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      
      // Fetch quick stats for overview
      const [
        { count: totalUsers },
        { count: activeAssignments },
        { data: revenue },
        { count: pendingReviews }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('wallet_transactions').select('amount_cents').eq('type', 'earning'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeAssignments: activeAssignments || 0,
        totalRevenue: (revenue || []).reduce((sum: number, t: any) => sum + t.amount_cents, 0) / 100,
        pendingReviews: pendingReviews || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">
                Platform beheer en analytics
              </p>
            </div>
            <Button variant="outline" onClick={fetchQuickStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Ververs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overzicht
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gebruikers
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Opdrachten
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString('nl-NL')}</div>
                      <p className="text-xs text-muted-foreground">
                        +12% van vorige maand
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Open Opdrachten</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.activeAssignments}</div>
                      <p className="text-xs text-muted-foreground">
                        23 kort, 15 vast
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€{stats?.totalRevenue.toLocaleString('nl-NL')}</div>
                      <p className="text-xs text-muted-foreground">
                        +18% groei
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.pendingReviews}</div>
                      <p className="text-xs text-muted-foreground">
                        Wachtend op goedkeuring
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Gebruikersbeheer</p>
                          <p className="text-sm text-muted-foreground">Beheer alle gebruikers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Opdrachten</p>
                          <p className="text-sm text-muted-foreground">Beheer opdrachten</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Content Moderatie</p>
                          <p className="text-sm text-muted-foreground">Reviews & chats</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CreditCard className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Financieel</p>
                          <p className="text-sm text-muted-foreground">Betalingen & factoring</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagementTable />
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opdrachten Beheer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Opdrachten beheer functionaliteit wordt hier geïmplementeerd...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
