import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Download,
  MessageSquare,
  Star,
  TrendingUp,
  Building2,
  Zap,
  Eye,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { Contract, Assignment, Review } from '@/types/database';
import { formatDistanceToNow, format } from 'date-fns';
import { nl } from 'date-fns/locale';

type ContractStatus = 'active' | 'completed' | 'upcoming' | 'terminated';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: Assignment }>({});
  const [reviews, setReviews] = useState<{ [key: string]: Review }>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      // Fetch contracts
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('professional_id', userId)
        .order('created_at', { ascending: false });

      if (contractError) throw contractError;

      // Fetch related assignments
      if (contractData && contractData.length > 0) {
        const assignmentIds = contractData.map(contract => contract.assignment_id);
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

      // Fetch reviews
      if (contractData && contractData.length > 0) {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .in('contract_id', contractData.map(c => c.id));

        if (reviewError) throw reviewError;

        const reviewMap = (reviewData || []).reduce((acc, review) => {
          acc[review.contract_id] = review;
          return acc;
        }, {} as { [key: string]: Review });

        setReviews(reviewMap);
      }

      setContracts(contractData || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = async (contract: Contract) => {
    try {
      // Generate PDF contract
      const { data, error } = await supabase.functions.invoke('generate-contract-pdf', {
        body: { contractId: contract.id }
      });

      if (error) throw error;

      // Download the PDF
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `contract-${contract.id}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading contract:', error);
    }
  };

  const handleRequestExtension = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          extension_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      // Update local state
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId 
            ? { ...contract, extension_requested: true }
            : contract
        )
      );
    } catch (error) {
      console.error('Error requesting extension:', error);
    }
  };

  const handleTerminateContract = async (contractId: string) => {
    if (!confirm('Weet je zeker dat je dit contract wilt beëindigen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'terminated',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      // Update local state
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId 
            ? { ...contract, status: 'terminated', end_date: new Date().toISOString() }
            : contract
        )
      );
    } catch (error) {
      console.error('Error terminating contract:', error);
    }
  };

  const getStatusColor = (status: string, endDate?: string) => {
    if (status === 'terminated') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    
    const now = new Date();
    const end = endDate ? new Date(endDate) : null;
    
    if (status === 'active' && end && end < now) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    if (status === 'active') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'upcoming') return 'bg-purple-100 text-purple-800 border-purple-200';
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string, endDate?: string) => {
    if (status === 'terminated') return 'Beëindigd';
    if (status === 'completed') return 'Afgerond';
    
    const now = new Date();
    const end = endDate ? new Date(endDate) : null;
    
    if (status === 'active' && end && end < now) {
      return 'Verlopen';
    }
    
    if (status === 'active') return 'Actief';
    if (status === 'upcoming') return 'Aankomend';
    
    return status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'terminated') return <AlertCircle className="h-3 w-3" />;
    if (status === 'completed') return <CheckCircle2 className="h-3 w-3" />;
    if (status === 'active') return <Clock className="h-3 w-3" />;
    if (status === 'upcoming') return <Calendar className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  const getContractTypeIcon = (type: string) => {
    return type === 'short' ? <Zap className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  };

  const filteredContracts = contracts.filter(contract => {
    if (statusFilter === 'all') return true;
    
    const now = new Date();
    const end = contract.end_date ? new Date(contract.end_date) : null;
    const start = contract.start_date ? new Date(contract.start_date) : null;
    
    if (statusFilter === 'active') {
      return contract.status === 'active' && (!end || end >= now);
    }
    
    if (statusFilter === 'completed') {
      return contract.status === 'completed';
    }
    
    if (statusFilter === 'upcoming') {
      return start && start > now;
    }
    
    if (statusFilter === 'terminated') {
      return contract.status === 'terminated';
    }
    
    return true;
  });

  const statusCounts = {
    all: contracts.length,
    active: contracts.filter(c => {
      const now = new Date();
      const end = c.end_date ? new Date(c.end_date) : null;
      return c.status === 'active' && (!end || end >= now);
    }).length,
    completed: contracts.filter(c => c.status === 'completed').length,
    upcoming: contracts.filter(c => {
      const start = c.start_date ? new Date(c.start_date) : null;
      return start && start > new Date();
    }).length,
    terminated: contracts.filter(c => c.status === 'terminated').length
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
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-muted rounded"></div>
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Mijn Contracten</h1>
              <p className="text-muted-foreground">
                Beheer je actieve, afgeronde en toekomstige contracten
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Card 
                  key={status} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setStatusFilter(status as ContractStatus | 'all')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm text-muted-foreground">
                      {status === 'all' ? 'Totaal' : 
                       status === 'active' ? 'Actief' :
                       status === 'completed' ? 'Afgerond' :
                       status === 'upcoming' ? 'Aankomend' : 'Beëindigd'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status as ContractStatus | 'all')}
                  className="whitespace-nowrap"
                >
                  {status === 'all' ? 'Alle' : 
                   status === 'active' ? 'Actief' :
                   status === 'completed' ? 'Afgerond' :
                   status === 'upcoming' ? 'Aankomend' : 'Beëindigd'}
                  ({count})
                </Button>
              ))}
            </div>

            {/* Contracts List */}
            {filteredContracts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {statusFilter !== 'all' ? 'Geen contracten gevonden' : 'Nog geen contracten'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {statusFilter !== 'all' 
                      ? 'Probeer een andere filter te selecteren'
                      : 'Contracten verschijnen hier zodra je een opdracht accepteert'
                    }
                  </p>
                  <Button asChild>
                    <Link to="/opdrachten">Bekijk opdrachten</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => {
                  const assignment = assignments[contract.assignment_id];
                  const review = reviews[contract.id];
                  
                  if (!assignment) return null;

                  const canReview = contract.status === 'completed' && !review;
                  const isOverdue = contract.status === 'active' && 
                    contract.end_date && 
                    new Date(contract.end_date) < new Date();

                  return (
                    <Card key={contract.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-orange-200' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getContractTypeIcon(contract.type)}
                              <h3 className="font-semibold text-lg">{assignment.title}</h3>
                              <Badge className={getStatusColor(contract.status, contract.end_date)}>
                                {getStatusIcon(contract.status)}
                                {getStatusText(contract.status, contract.end_date)}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="outline" className="border-orange-200 text-orange-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Verlopen
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{assignment.company}</p>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-medium">Startdatum</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(contract.start_date), 'd MMMM yyyy', { locale: nl })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Einddatum</p>
                                <p className="text-sm text-muted-foreground">
                                  {contract.end_date ? 
                                    format(new Date(contract.end_date), 'd MMMM yyyy', { locale: nl }) :
                                    'Onbepaalde tijd'
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Vergoeding</p>
                                <p className="text-sm text-muted-foreground">
                                  {contract.type === 'short' 
                                    ? `€${(contract.rate_cents / 100).toFixed(2)}/uur`
                                    : `€${(contract.rate_cents / 100).toFixed(2)}/maand`
                                  }
                                </p>
                              </div>
                            </div>

                            {review && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm">Review geplaatst: {review.rating}/5 sterren</span>
                              </div>
                            )}

                            {contract.extension_requested && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Verlenging aangevraagd</span>
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
                            
                            <Button variant="outline" size="sm" onClick={() => handleDownloadContract(contract)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>

                            {contract.status === 'active' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Open chat</DialogTitle>
                                  </DialogHeader>
                                  <div className="text-center py-4">
                                    <p>Je wordt doorgestuurd naar de chat...</p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {contract.status === 'active' && !isOverdue && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRequestExtension(contract.id)}
                                disabled={contract.extension_requested}
                              >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {contract.extension_requested ? 'Aangevraagd' : 'Verlengen'}
                              </Button>
                            )}

                            {canReview && (
                              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Star className="h-4 w-4 mr-2" />
                                    Review schrijven
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <ReviewForm
                                    contractId={contract.id}
                                    reviewerId="current-user-id"
                                    reviewedId={contract.employer_id}
                                    assignmentId={assignment.id}
                                    reviewedName={assignment.company}
                                    reviewedType="employer"
                                    onSubmit={() => {
                                      setShowReviewForm(false);
                                      fetchContracts();
                                    }}
                                    onCancel={() => setShowReviewForm(false)}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}

                            {contract.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTerminateContract(contract.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Beëindigen
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
