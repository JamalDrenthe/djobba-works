import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as ReChartsPieChart, Cell } from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { Assignment, Application } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface EmployerStats {
  total_assignments: number;
  active_assignments: number;
  filled_assignments: number;
  avg_time_to_fill: number;
  total_applications: number;
  active_candidates: number;
}

export default function EmployerDashboard() {
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([]);
  const [fillRateData, setFillRateData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, get user ID from auth
      const employerId = 'current-user-id';

      // Fetch assignments stats
      const { data: assignments } = await supabase
        .from('assignments')
        .select('status, type, category, created_at, application_deadline')
        .eq('employer_id', employerId);

      if (assignments) {
        const stats: EmployerStats = {
          total_assignments: assignments.length,
          active_assignments: assignments.filter(a => a.status === 'active').length,
          filled_assignments: assignments.filter(a => a.status === 'filled').length,
          avg_time_to_fill: 3.2, // Mock data - would calculate from actual data
          total_applications: 0, // Would fetch from applications table
          active_candidates: 0 // Would calculate from active contracts
        };

        setStats(stats);

        // Process fill rate data for chart
        const monthlyData = new Map();
        assignments.forEach(assignment => {
          const month = new Date(assignment.created_at).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { month, posted: 0, filled: 0 });
          }
          monthlyData.get(month).posted++;
          if (assignment.status === 'filled') {
            monthlyData.get(month).filled++;
          }
        });

        setFillRateData(Array.from(monthlyData.values()).slice(-6));

        // Process category data
        const categoryCount = new Map();
        assignments.forEach(assignment => {
          if (assignment.category) {
            categoryCount.set(assignment.category, (categoryCount.get(assignment.category) || 0) + 1);
          }
        });

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
        setCategoryData(
          Array.from(categoryCount.entries()).map(([name, value]) => ({
            name,
            value
          }))
        );
      }

      // Fetch recent applications
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          assignments:title,
          professionals:professional_id(
            user_profiles(first_name, last_name)
          )
        `)
        .eq('assignments.employer_id', employerId)
        .order('applied_at', { ascending: false })
        .limit(5);

      setRecentApplications(applications || []);

      // Fetch active assignments
      const { data: activeAssignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('employer_id', employerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      setActiveAssignments(activeAssignmentData || []);
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
          Overzicht van je werving en prestaties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actieve opdrachten</p>
                <p className="text-2xl font-bold">{stats?.active_assignments || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            {stats?.total_assignments > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total_assignments} totaal
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fill rate</p>
                <p className="text-2xl font-bold">
                  {stats?.filled_assignments && stats.total_assignments > 0 
                    ? Math.round((stats.filled_assignments / stats.total_assignments) * 100)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-500">
                +5% vs vorige maand
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gem. time-to-fill</p>
                <p className="text-2xl font-bold">{stats?.avg_time_to_fill || 0}d</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDown className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-500">
                -1 dag vs gemiddeld
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total applicaties</p>
                <p className="text-2xl font-bold">{stats?.total_applications || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.active_candidates || 0} actieve kandidaten
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fill Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Fill Rate (laatste 6 maanden)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fillRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="posted" fill="hsl(var(--muted))" name="Geplaatst" />
                <Bar dataKey="filled" fill="hsl(var(--primary))" name="Ingevuld" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Opdrachten per categorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ReChartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </ReChartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Assignments & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Actieve opdrachten
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAssignments.length > 0 ? (
              <div className="space-y-4">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.category} • {assignment.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.application_count || 0} sollicitaties
                      </p>
                    </div>
                    <Badge variant={assignment.type === 'short' ? 'default' : 'secondary'}>
                      {assignment.type === 'short' ? 'Kort' : 'Vast'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen actieve opdrachten</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/opdrachten?new">Plaats opdracht</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recente sollicitaties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {application.professionals?.user_profiles?.first_name} {application.professionals?.user_profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solliciteert op: {application.assignments?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(application.applied_at), {
                          addSuffix: true,
                          locale: nl
                        })}
                      </p>
                    </div>
                    <Badge variant={
                      application.status === 'pending' ? 'default' :
                      application.status === 'accepted' ? 'secondary' :
                      'outline'
                    }>
                      {application.status === 'pending' ? 'Nieuw' :
                       application.status === 'accepted' ? 'Geaccepteerd' :
                       'Afgewezen'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen recente sollicitaties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform vergelijking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">&lt;24u</div>
              <p className="text-sm text-muted-foreground">Gem. match tijd DJOBBA</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">3-5d</div>
              <p className="text-sm text-muted-foreground">Industrie gemiddelde</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <p className="text-sm text-muted-foreground">Fill rate DJOBBA</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">60%</div>
              <p className="text-sm text-muted-foreground">Industrie gemiddelde</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
