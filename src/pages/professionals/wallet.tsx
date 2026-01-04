import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Wallet as WalletType, WalletTransaction } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankAccount, setBankAccount] = useState({ iban: '', accountHolder: '' });
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'earning' | 'withdrawal' | 'fee' | 'bonus'>('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // In a real app, get user ID from auth
      const userId = 'current-user-id';

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('professional_id', userId)
        .single();

      setWallet(walletData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !bankAccount.iban || !bankAccount.accountHolder) {
      return;
    }

    try {
      const userId = 'current-user-id';
      const amountCents = Math.round(parseFloat(withdrawalAmount) * 100);

      // Call withdrawal function
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amountCents,
          bankAccount
        })
      });

      const result = await response.json();

      if (result.success) {
        setShowWithdrawal(false);
        setWithdrawalAmount('');
        setBankAccount({ iban: '', accountHolder: '' });
        fetchWalletData(); // Refresh data
      } else {
        alert(result.error || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'fee':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'fee':
        return 'text-orange-600';
      case 'bonus':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Datum', 'Type', 'Bedrag', 'Beschrijving'],
      ...filteredTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString('nl-NL'),
        t.type,
        `€${(Math.abs(t.amount_cents) / 100).toFixed(2)}`,
        t.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

        <main className="flex-1 container py-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Mijn Wallet</h1>
            <p className="text-muted-foreground">
              Beheer je inkomsten en opnames
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Beschikbaar saldo</p>
                    <p className="text-3xl font-bold">
                      €{((wallet?.available_balance_cents || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-500" />
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => setShowWithdrawal(true)}
                  disabled={!wallet?.available_balance_cents}
                >
                  Opnemen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In afwachting</p>
                    <p className="text-3xl font-bold">
                      €{((wallet?.pending_balance_cents || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Wordt beschikbaar na contract voltooiing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Totaal verdiend</p>
                    <p className="text-3xl font-bold">
                      €{((wallet?.total_earned_cents || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sinds je start
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Let op: De wallet is alleen voor korte opdrachten. Vaste contracten worden direct door het bedrijf betaald.
            </AlertDescription>
          </Alert>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transactiehistorie</CardTitle>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-1 border rounded-md text-sm"
                    aria-label="Filter transacties"
                    title="Filter transacties op type"
                  >
                    <option value="all">Alle transacties</option>
                    <option value="earning">Inkomsten</option>
                    <option value="withdrawal">Opnames</option>
                    <option value="fee">Kosten</option>
                    <option value="bonus">Bonus</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={exportTransactions}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description || transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), {
                              addSuffix: true,
                              locale: nl
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : '+'}
                        €{(Math.abs(transaction.amount_cents) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen transacties gevonden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Modal */}
          {showWithdrawal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Geld opnemen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Bedrag (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      max={(wallet?.available_balance_cents || 0) / 100}
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Beschikbaar: €{((wallet?.available_balance_cents || 0) / 100).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={bankAccount.iban}
                      onChange={(e) => setBankAccount({ ...bankAccount, iban: e.target.value })}
                      placeholder="NL91 ABNA 0417 1643 00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountHolder">Rekeninghouder</Label>
                    <Input
                      id="accountHolder"
                      value={bankAccount.accountHolder}
                      onChange={(e) => setBankAccount({ ...bankAccount, accountHolder: e.target.value })}
                      placeholder="J. Naam"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowWithdrawal(false)} className="flex-1">
                      Annuleren
                    </Button>
                    <Button 
                      onClick={handleWithdrawal} 
                      className="flex-1"
                      disabled={!withdrawalAmount || !bankAccount.iban || !bankAccount.accountHolder}
                    >
                      Opnemen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
