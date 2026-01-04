import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  History,
  Zap,
  Euro
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { FactoringRequest, Contract } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function FactoringPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [factoringRequests, setFactoringRequests] = useState<FactoringRequest[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [requestingFactoring, setRequestingFactoring] = useState<string | null>(null);
  const FACTORING_FEE_PERCENT = 3;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate factoring fee in real-time
    const fee = Math.floor(selectedAmount * (FACTORING_FEE_PERCENT / 100));
    const net = selectedAmount - fee;
    setCalculatedFee(fee);
    setNetAmount(net);
  }, [selectedAmount]);

  const fetchData = async () => {
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      // Fetch active contracts
      const { data: contractData } = await supabase
        .from('contracts')
        .select('*')
        .eq('professional_id', userId)
        .eq('status', 'active')
        .eq('type', 'short');

      // Fetch factoring requests
      const { data: factoringData } = await supabase
        .from('factoring_requests')
        .select('*')
        .eq('professional_id', userId)
        .order('created_at', { ascending: false });

      setContracts(contractData || []);
      setFactoringRequests(factoringData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFactoring = async (contractId: string, contractAmount: number) => {
    setRequestingFactoring(contractId);
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      // Check if factoring already requested
      const existingRequest = factoringRequests.find(r => r.contract_id === contractId);
      if (existingRequest) {
        return;
      }

      // Calculate fees
      const feeCents = Math.floor(contractAmount * (FACTORING_FEE_PERCENT / 100));
      const payoutAmountCents = contractAmount - feeCents;

      // Create factoring request
      const { error } = await supabase
        .from('factoring_requests')
        .insert({
          contract_id: contractId,
          professional_id: userId,
          amount_cents: contractAmount,
          fee_percent: FACTORING_FEE_PERCENT,
          fee_cents: feeCents,
          payout_amount_cents: payoutAmountCents,
          status: 'pending'
        });

      if (error) throw error;

      // Update contract to enable factoring
      await supabase
        .from('contracts')
        .update({ factoring_enabled: true })
        .eq('id', contractId);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error requesting factoring:', error);
    } finally {
      setRequestingFactoring(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In behandeling';
      case 'approved':
        return 'Goedgekeurd';
      case 'paid':
        return 'Uitgekeerd';
      case 'rejected':
        return 'Afgewezen';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="grid gap-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
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
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Factoring</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Calculator className="h-3 w-3 mr-1" />
                  AANBEVOLEN
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Ontvang je geld binnen 24 uur in plaats van wachten op de betalingstermijn
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Factoring Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Factoring Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="amount">Bedrag om te factoren (€)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0,00"
                        value={selectedAmount / 100}
                        onChange={(e) => setSelectedAmount(Math.floor(parseFloat(e.target.value) * 100))}
                        className="mt-2"
                      />
                    </div>

                    {selectedAmount > 0 && (
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Factoring fee (3%):</span>
                          <span className="font-medium">€{(calculatedFee / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Netto ontvangst:</span>
                          <span className="text-primary">€{(netAmount / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Factoring zorgt voor snelle liquiditeit.</strong> In plaats van wachten op de betalingstermijn van de opdrachtgever, 
                        ontvang je het geld direct van ons. Kosten: {FACTORING_FEE_PERCENT}% van het factuurbedrag.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Available Contracts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Beschikbare Contracten voor Factoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contracts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Geen actieve contracten beschikbaar voor factoring
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contracts.map((contract) => {
                          const hasRequestedFactoring = factoringRequests.some(r => r.contract_id === contract.id);
                          return (
                            <div key={contract.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold">Contract #{contract.id.slice(-8)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Start: {new Date(contract.start_date).toLocaleDateString('nl-NL')}
                                  </p>
                                  <p className="text-lg font-bold text-primary mt-2">
                                    €{(contract.rate_cents / 100).toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {hasRequestedFactoring ? (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Aangevraagd
                                    </Badge>
                                  ) : (
                                    <Button
                                      onClick={() => handleRequestFactoring(contract.id, contract.rate_cents)}
                                      disabled={requestingFactoring === contract.id}
                                    >
                                      {requestingFactoring === contract.id ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                      ) : (
                                        <>
                                          <TrendingUp className="h-4 w-4 mr-2" />
                                          Factoring Aanvragen
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Jouw Factoring Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Totaal gefactored:</span>
                      <span className="font-bold">
                        €{
                          factoringRequests
                            .filter(r => r.status === 'paid')
                            .reduce((sum, r) => sum + r.amount_cents, 0) / 100
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Totaal fees betaald:</span>
                      <span className="font-bold">
                        €{
                          factoringRequests
                            .filter(r => r.status === 'paid')
                            .reduce((sum, r) => sum + r.fee_cents, 0) / 100
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actieve verzoeken:</span>
                      <span className="font-bold">
                        {factoringRequests.filter(r => r.status === 'pending' || r.status === 'approved').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Voordelen van Factoring
                </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Directe liquiditeit</p>
                        <p className="text-xs text-muted-foreground">Binnen 24 uur geld op je rekening</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Geen debiteurenrisico</p>
                        <p className="text-xs text-muted-foreground">Wij nemen het risico over</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Focus op je werk</p>
                        <p className="text-xs text-muted-foreground">Geen tijd kwijt aan incasso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* History Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Factoring Geschiedenis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {factoringRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nog geen factoring verzoeken gedaan
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Contract</th>
                            <th className="text-left py-3 px-4">Bedrag</th>
                            <th className="text-left py-3 px-4">Fee (3%)</th>
                            <th className="text-left py-3 px-4">Netto</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Datum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {factoringRequests.map((request) => (
                            <tr key={request.id} className="border-b">
                              <td className="py-3 px-4">
                                <span className="font-mono text-sm">#{request.contract_id.slice(-8)}</span>
                              </td>
                              <td className="py-3 px-4">€{(request.amount_cents / 100).toFixed(2)}</td>
                              <td className="py-3 px-4">€{(request.fee_cents / 100).toFixed(2)}</td>
                              <td className="py-3 px-4 font-bold">€{(request.payout_amount_cents / 100).toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(request.created_at), {
                                  addSuffix: true,
                                  locale: nl
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="mt-8 bg-primary text-primary-foreground rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Meer weten over factoring?
              </h2>
              <p className="mb-6 opacity-90">
                Ons team staat klaar om je vragen te beantwoorden over de voordelen en werkwijze.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/contact">
                    Neem contact op
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/help/factoring">
                    <Info className="h-4 w-4 mr-2" />
                    Lees meer
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
