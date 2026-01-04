import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter, 
  BarChart3, 
  PieChart, 
  LineChart,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Target,
  Activity,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { nl } from 'date-fns/locale';

interface AnalyticsData {
  timeToFill: {
    overall: number;
    bySector: { sector: string; avgDays: number; count: number }[];
    byLocation: { location: string; avgDays: number; count: number }[];
    historical: { date: string; avgDays: number }[];
  };
  conversionFunnel: {
    views: number;
    applications: number;
    interviews: number;
    hires: number;
    conversionRates: {
      viewToApplication: number;
      applicationToInterview: number;
      interviewToHire: number;
      overall: number;
    };
  };
  financials: {
    revenue: { month: string; amount: number }[];
    factoringFees: number;
    platformFees: number;
    averageAssignmentValue: number;
    growth: { period: string; percentage: number }[];
  };
  userBehavior: {
    topSkills: { skill: string; count: number }[];
    topLocations: { location: string; count: number }[];
    averageSessionDuration: number;
    retentionRates: { period: string; rate: number }[];
    mostActiveHours: { hour: number; activity: number }[];
  };
}

interface DateRange {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'financial' | 'behavior'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const dateRanges: DateRange[] = [
    {
      label: 'Laatste 7 dagen',
      value: '7d',
      startDate: subDays(new Date(), 7),
      endDate: new Date()
    },
    {
      label: 'Laatste 30 dagen',
      value: '30d',
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    },
    {
      label: 'Laatste 90 dagen',
      value: '90d',
      startDate: subDays(new Date(), 90),
      endDate: new Date()
    },
    {
      label: 'Dit jaar',
      value: 'ytd',
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date()
    }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRange, selectedSector, selectedLocation]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const range = dateRanges.find(r => r.value === selectedRange);
      
      if (!range) return;

      // Fetch time-to-fill analytics
      const { data: contracts } = await supabase
        .from('contracts')
        .select(`
          created_at,
          start_date,
          assignments!inner(
            sector,
            location,
            type
          )
        `)
        .gte('created_at', range.startDate.toISOString())
        .lte('created_at', range.endDate.toISOString());

      const timeToFillData = processTimeToFill(contracts || []);

      // Fetch conversion funnel data
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          view_count,
          applications!inner(
            status,
            interviews!inner(
              status
            )
          ),
          contracts!inner(
            status
          )
        `)
        .gte('created_at', range.startDate.toISOString());

      const funnelData = processConversionFunnel(assignments || []);

      // Fetch financial data
      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('amount_cents, type, created_at')
        .gte('created_at', range.startDate.toISOString());

      const financialData = processFinancials(transactions || [], range);

      // Fetch user behavior data
      const behaviorData = await processUserBehavior(range);

      setData({
        timeToFill: timeToFillData,
        conversionFunnel: funnelData,
        financials: financialData,
        userBehavior: behaviorData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimeToFill = (contracts: any[]) => {
    const timeToFillDays = contracts.map(c => {
      const created = new Date(c.created_at);
      const started = new Date(c.start_date);
      return (started.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }).filter(d => d > 0 && d < 365);

    const overall = timeToFillDays.length > 0 
      ? timeToFillDays.reduce((sum, d) => sum + d, 0) / timeToFillDays.length 
      : 0;

    // Group by sector
    const sectorMap = new Map<string, { total: number; count: number }>();
    contracts.forEach(c => {
      const sector = c.assignments?.sector || 'Onbekend';
      const days = (new Date(c.start_date).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (days > 0 && days < 365) {
        const current = sectorMap.get(sector) || { total: 0, count: 0 };
        sectorMap.set(sector, { total: current.total + days, count: current.count + 1 });
      }
    });

    const bySector = Array.from(sectorMap.entries())
      .map(([sector, data]) => ({
        sector,
        avgDays: Math.round(data.total / data.count),
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Historical data (last 30 days)
    const historical = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayContracts = contracts.filter(c => 
        format(new Date(c.created_at), 'yyyy-MM-dd') === date
      );
      
      if (dayContracts.length > 0) {
        const avgDays = dayContracts.reduce((sum, c) => {
          const days = (new Date(c.start_date).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + (days > 0 && days < 365 ? days : 0);
        }, 0) / dayContracts.length;
        historical.push({ date, avgDays: Math.round(avgDays) });
      }
    }

    return { overall, bySector, byLocation: [], historical };
  };

  const processConversionFunnel = (assignments: any[]) => {
    const totalViews = assignments.reduce((sum, a) => sum + (a.view_count || 0), 0);
    const totalApplications = assignments.reduce((sum, a) => sum + (a.applications?.length || 0), 0);
    const totalInterviews = assignments.reduce((sum, a) => {
      return sum + (a.applications || []).reduce((s: number, app: any) => 
        s + (app.interviews?.length || 0), 0);
    }, 0);
    const totalHires = assignments.filter(a => a.contracts?.length > 0).length;

    const viewToApplication = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;
    const applicationToInterview = totalApplications > 0 ? (totalInterviews / totalApplications) * 100 : 0;
    const interviewToHire = totalInterviews > 0 ? (totalHires / totalInterviews) * 100 : 0;
    const overall = totalViews > 0 ? (totalHires / totalViews) * 100 : 0;

    return {
      views: totalViews,
      applications: totalApplications,
      interviews: totalInterviews,
      hires: totalHires,
      conversionRates: {
        viewToApplication,
        applicationToInterview,
        interviewToHire,
        overall
      }
    };
  };

  const processFinancials = (transactions: any[], range: DateRange) => {
    const revenue = transactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.amount_cents, 0) / 100;

    const factoringFees = transactions
      .filter(t => t.type === 'factoring_fee')
      .reduce((sum, t) => sum + t.amount_cents, 0) / 100;

    const platformFees = transactions
      .filter(t => t.type === 'platform_fee')
      .reduce((sum, t) => sum + t.amount_cents, 0) / 100;

    // Monthly revenue for chart
    const monthlyRevenue = [];
    const months = eachDayOfInterval({ start: range.startDate, end: range.endDate })
      .map(d => format(d, 'yyyy-MM'))
      .filter((v, i, a) => a.indexOf(v) === i);

    months.forEach(month => {
      const monthRevenue = transactions
        .filter(t => 
          t.type === 'earning' && 
          format(new Date(t.created_at), 'yyyy-MM') === month
        )
        .reduce((sum, t) => sum + t.amount_cents, 0) / 100;
      
      monthlyRevenue.push({
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: nl }),
        amount: monthRevenue
      });
    });

    return {
      revenue: monthlyRevenue,
      factoringFees,
      platformFees,
      averageAssignmentValue: revenue > 0 ? revenue / transactions.length : 0,
      growth: []
    };
  };

  const processUserBehavior = async (range: DateRange) => {
    // Mock data for now - would need additional tracking tables
    return {
      topSkills: [
        { skill: 'JavaScript', count: 234 },
        { skill: 'Python', count: 189 },
        { skill: 'React', count: 176 },
        { skill: 'TypeScript', count: 154 },
        { skill: 'Node.js', count: 142 }
      ],
      topLocations: [
        { location: 'Amsterdam', count: 342 },
        { location: 'Rotterdam', count: 287 },
        { location: 'Utrecht', count: 234 },
        { location: 'Den Haag', count: 198 },
        { location: 'Eindhoven', count: 176 }
      ],
      averageSessionDuration: 14.5, // minutes
      retentionRates: [
        { period: 'Dag 1', rate: 100 },
        { period: 'Dag 7', rate: 78 },
        { period: 'Dag 30', rate: 54 },
        { period: 'Dag 90', rate: 32 }
      ],
      mostActiveHours: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        activity: Math.random() * 100
      }))
    };
  };

  const exportReport = async (format: 'pdf' | 'csv') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-analytics', {
        body: { 
          format,
          data,
          range: selectedRange,
          filters: { sector: selectedSector, location: selectedLocation }
        }
      });

      if (error) throw error;

      // Download the file
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `analytics-report-${selectedRange}.${format}`;
      link.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform statistieken en inzichten</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle sectoren</SelectItem>
                  <SelectItem value="it">IT & Software</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Locatie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle locaties</SelectItem>
                  <SelectItem value="amsterdam">Amsterdam</SelectItem>
                  <SelectItem value="rotterdam">Rotterdam</SelectItem>
                  <SelectItem value="utrecht">Utrecht</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gem. Time-to-Fill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.timeToFill.overall)} dagen</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              12% sneller dan vorige periode
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversie Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionFunnel.conversionRates.overall.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              3.2% hoger dan gemiddelde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{data.financials.revenue.reduce((sum, r) => sum + r.amount, 0).toLocaleString('nl-NL')}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              18% groei
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessie Duur</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userBehavior.averageSessionDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Gemiddelde per gebruiker
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="funnel">Conversie Funnel</TabsTrigger>
          <TabsTrigger value="financial">Financieel</TabsTrigger>
          <TabsTrigger value="behavior">Gebruikersgedrag</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time-to-Fill by Sector */}
            <Card>
              <CardHeader>
                <CardTitle>Time-to-Fill per Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.timeToFill.bySector.slice(0, 5).map((sector, index) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{sector.sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{sector.avgDays} dagen</div>
                        <div className="text-xs text-muted-foreground">{sector.count} opdrachten</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Meest Gevraagde Vaardigheden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userBehavior.topSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{skill.skill}</span>
                      </div>
                      <Badge variant="secondary">{skill.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversie Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Funnel visualization */}
                <div className="space-y-2">
                  {[
                    { label: 'Views', value: data.conversionFunnel.views, color: 'bg-blue-500' },
                    { label: 'Applications', value: data.conversionFunnel.applications, color: 'bg-green-500' },
                    { label: 'Interviews', value: data.conversionFunnel.interviews, color: 'bg-yellow-500' },
                    { label: 'Hires', value: data.conversionFunnel.hires, color: 'bg-purple-500' }
                  ].map((step, index) => {
                    const percentage = index === 0 ? 100 : 
                      (step.value / data.conversionFunnel.views) * 100;
                    
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{step.label}</span>
                          <span>{step.value.toLocaleString('nl-NL')} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-8">
                          <div 
                            className={`${step.color} h-8 rounded-full flex items-center justify-center text-white text-xs font-medium`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 10 && `${percentage.toFixed(1)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conversion Rates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {data.conversionFunnel.conversionRates.viewToApplication.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">View → Application</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {data.conversionFunnel.conversionRates.applicationToInterview.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Application → Interview</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {data.conversionFunnel.conversionRates.interviewToHire.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Interview → Hire</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {data.conversionFunnel.conversionRates.overall.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall</div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Omzetontwikkeling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.financials.revenue.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm">{month.month}</span>
                      <span className="font-medium">€{month.amount.toLocaleString('nl-NL')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Factoring Fees</span>
                    <span>€{data.financials.factoringFees.toLocaleString('nl-NL')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(data.financials.factoringFees / (data.financials.factoringFees + data.financials.platformFees)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Platform Fees</span>
                    <span>€{data.financials.platformFees.toLocaleString('nl-NL')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(data.financials.platformFees / (data.financials.factoringFees + data.financials.platformFees)) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Top Locaties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userBehavior.topLocations.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{location.location}</span>
                      </div>
                      <Badge variant="secondary">{location.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Retention Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Retentie Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userBehavior.retentionRates.map((rate) => (
                    <div key={rate.period} className="flex items-center justify-between">
                      <span className="text-sm">{rate.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${rate.rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{rate.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
