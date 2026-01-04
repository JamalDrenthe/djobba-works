import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  ExternalLink,
  Search,
  Filter,
  X
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { Application, Assignment } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: Assignment }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [withdrawingApplication, setWithdrawingApplication] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      // Fetch applications
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .select('*')
        .eq('professional_id', userId)
        .order('applied_at', { ascending: false });

      if (applicationError) throw applicationError;

      // Fetch related assignments
      if (applicationData && applicationData.length > 0) {
        const assignmentIds = applicationData.map(app => app.assignment_id);
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .in('id', assignmentIds);

        if (assignmentError) throw assignmentError;

        const assignmentMap = (assignmentData || []).reduce((acc, assignment) => {
          acc[assignment.id] = assignment;
          return acc;
        }, {} as { [key: string]: Assignment });

        setAssignments(assignmentMap);
      }

      setApplications(applicationData || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm('Weet je zeker dat je deze sollicitatie wilt intrekken?')) {
      return;
    }

    setWithdrawingApplication(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'withdrawn',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'withdrawn' as Application['status'] }
            : app
        )
      );
    } catch (error) {
      console.error('Error withdrawing application:', error);
    } finally {
      setWithdrawingApplication(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In behandeling';
      case 'reviewed':
        return 'Bekeken';
      case 'accepted':
        return 'Geaccepteerd';
      case 'rejected':
        return 'Afgewezen';
      case 'withdrawn':
        return 'Ingetrokken';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'reviewed':
        return <Eye className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'withdrawn':
        return <X className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      assignments[app.assignment_id]?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignments[app.assignment_id]?.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 bg-muted/30">
          <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Mijn Sollicitaties</h1>
              <p className="text-muted-foreground">
                Beheer en volg je sollicitaties op opdrachten
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {status === 'all' ? 'Totaal' : getStatusText(status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Zoek op opdracht of bedrijf..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={(value: ApplicationStatus | 'all') => setStatusFilter(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter op status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle statussen</SelectItem>
                        <SelectItem value="pending">In behandeling</SelectItem>
                        <SelectItem value="reviewed">Bekeken</SelectItem>
                        <SelectItem value="accepted">Geaccepteerd</SelectItem>
                        <SelectItem value="rejected">Afgewezen</SelectItem>
                      </SelectContent>
                    </Select>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'Geen sollicitaties gevonden' : 'Nog geen sollicitaties'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Probeer je filters aan te passen'
                      : 'Begin met solliciteren op opdrachten'
                    }
                  </p>
                  <Button asChild>
                    <Link to="/opdrachten">Bekijk opdrachten</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const assignment = assignments[application.assignment_id];
                  if (!assignment) return null;

                  return (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{assignment.title}</h3>
                              <Badge className={getStatusColor(application.status)}>
                                {getStatusIcon(application.status)}
                                {getStatusText(application.status)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3">{assignment.company}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Sollicitatie: {formatDistanceToNow(new Date(application.applied_at), {
                                  addSuffix: true,
                                  locale: nl
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {assignment.type === 'short' ? 'Korte opdracht' : 'Vast contract'}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {assignment.location}
                              </div>
                            </div>

                            {application.cover_letter && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Motivatie:</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {application.cover_letter}
                                </p>
                              </div>
                            )}

                            {application.proposed_rate_cents && (
                              <div className="text-sm">
                                <span className="font-medium">Voorgesteld tarief:</span> €{(application.proposed_rate_cents / 100).toFixed(2)}/uur
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/opdrachten/${assignment.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bekijk opdracht
                              </Link>
                            </Button>
                            {application.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawApplication(application.id)}
                                disabled={withdrawingApplication === application.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {withdrawingApplication === application.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Intrekken
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
    );
}
