import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Briefcase,
  Star,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Wallet,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { 
  Contract, 
  Wallet as WalletType, 
  ProfessionalStats,
  Assignment 
} from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function ProfessionalDashboard() {
  const [stats, setStats] = useState<ProfessionalStats | null>(null);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, get user ID from auth
      const userId = 'current-user-id';

      // Fetch professional stats
      const { data: statsData } = await supabase
        .rpc('get_professional_stats', { p_user_id: userId });

      if (statsData) {
        setStats(statsData);
      }

      // Fetch active contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select(`
          *,
          assignments:title,
          employers:employer_id(first_name, last_name, company_name)
        `)
        .eq('professional_id', userId)
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      setActiveContracts(contractsData || []);

      // Fetch upcoming assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      setUpcomingAssignments(assignmentsData || []);

      // Fetch earnings data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: earnings } = await supabase
        .from('wallet_transactions')
        .select('created_at, amount_cents')
        .eq('type', 'earning')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Process earnings data for chart
      const dailyEarnings = new Map();
      (earnings || []).forEach(transaction => {
        const date = new Date(transaction.created_at).toLocaleDateString('nl-NL');
        const amount = transaction.amount_cents / 100;
        dailyEarnings.set(date, (dailyEarnings.get(date) || 0) + amount);
      });

      const chartData = Array.from(dailyEarnings.entries()).map(([date, amount]) => ({
        date,
        amount
      }));

      setEarningsData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom terug! Hier is je overzicht.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actieve contracten</p>
                <p className="text-2xl font-bold">{stats?.active_contracts || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            {stats?.active_contracts > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.total_contracts} totaal
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totaal verdiend</p>
                <p className="text-2xl font-bold">
                  €{((stats?.total_earned || 0) / 100).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            {stats?.total_earned > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <p className="text-xs text-green-500">
                  +12% vs vorige maand
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gem. rating</p>
                <p className="text-2xl font-bold">{stats?.avg_rating.toFixed(1) || 0}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            {stats?.total_reviews > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total_reviews} reviews
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet balance</p>
                <p className="text-2xl font-bold">
                  €{((stats?.wallet_balance || 0) / 100).toFixed(2)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            {stats?.pending_earnings > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                €{(stats.pending_earnings / 100).toFixed(2)} in afwachting
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inkomsten (laatste 30 dagen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prestatie metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profiel volledigheid</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response rate</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tevredenheid opdrachtgevers</span>
                <span>96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Badge niveau</span>
                <Badge variant="secondary">Level 3</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                3 van 5 badges behaald
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Contracts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Actieve contracten
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeContracts.length > 0 ? (
              <div className="space-y-4">
                {activeContracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{contract.assignments?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.employers?.company_name || 'Opdrachtgever'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contract.start_date).toLocaleDateString('nl-NL')} - 
                        {contract.end_date ? new Date(contract.end_date).toLocaleDateString('nl-NL') : 'Onbepaalde tijd'}
                      </p>
                    </div>
                    <Badge variant={contract.type === 'short' ? 'default' : 'secondary'}>
                      {contract.type === 'short' ? 'Kort' : 'Vast'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen actieve contracten</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/opdrachten">Vind opdrachten</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recente activiteit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Contract voltooid</p>
                  <p className="text-xs text-muted-foreground">
                    Website development - 2 uur geleden
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Nieuwe review ontvangen</p>
                  <p className="text-xs text-muted-foreground">
                    5 sterren - 1 dag geleden
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Betaling ontvangen</p>
                  <p className="text-xs text-muted-foreground">
                    €450.00 - 3 dagen geleden
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Nieuwe contract</p>
                  <p className="text-xs text-muted-foreground">
                    Mobile app development - 5 dagen geleden
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/professionals/activity">Bekijk alles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
