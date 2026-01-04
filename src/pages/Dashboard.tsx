import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Calendar,
  TrendingUp,
  AlertCircle,
  User
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 bg-muted/30">
          <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welkom terug, {user?.email?.split('@')[0] || 'Gebruiker'}
              </h1>
              <p className="text-muted-foreground">
                Hier is een overzicht van je activiteiten
              </p>
            </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Assignments */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Actieve opdrachten</h2>
                    <Link to="/opdrachten" className="text-sm text-primary hover:underline">
                      Nieuwe opdrachten zoeken
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {/* Long Contract */}
                    <div className="p-4 border border-border bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              <Building2 className="h-3 w-3 mr-1" />
                              VAST CONTRACT
                            </Badge>
                            <span className="text-xs text-muted-foreground">Maand 3/12</span>
                          </div>
                          <h3 className="font-semibold text-foreground">D2D Sales Professional</h3>
                          <p className="text-sm text-muted-foreground">KPN Nederland</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">€3.200</div>
                          <div className="text-xs text-muted-foreground">/maand</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          24 jun 2024 - 24 jun 2025
                        </div>
                        <Badge variant="outline" className="border-success text-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Actief
                        </Badge>
                      </div>
                    </div>

                    {/* Short Assignment */}
                    <div className="p-4 border border-border bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              KORTE OPDRACHT
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground">Zorghulp - Weekend</h3>
                          <p className="text-sm text-muted-foreground">Zorggroep Amsterdam</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">€432</div>
                          <div className="text-xs text-muted-foreground">verwacht</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          28 - 30 jun 2024
                        </div>
                        <Badge variant="outline" className="border-primary text-primary">
                          <Clock className="h-3 w-3 mr-1" />
                          Start over 2 dagen
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Applications */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Sollicitaties</h2>

                  <div className="p-4 border border-border bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Building2 className="h-3 w-3 mr-1" />
                            VAST CONTRACT
                          </Badge>
                          <Badge variant="outline" className="border-warning text-warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            In beoordeling
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">Recruitment Consultant</h3>
                        <p className="text-sm text-muted-foreground">Randstad</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Gesprek gepland: 25 juni
                      </div>
                      <Button size="sm" variant="outline">
                        Details bekijken
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Wallet */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Wallet</h2>
                      <p className="text-xs text-muted-foreground">Korte opdrachten</p>
                    </div>
                  </div>

                  {/* Expected Payment */}
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-1">Verwachte inkomsten</div>
                    <div className="text-3xl font-bold text-foreground">€432</div>
                  </div>

                  <div className="p-4 bg-muted/50 mb-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Zorghulp weekend</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Uitbetaling: 3 juli 2024
                        </div>
                        <Button size="sm" className="w-full">
                          Nu uitbetalen via factoring
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">Afgelopen maand</span>
                      <span className="font-medium text-foreground">€850</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Bekijk alle transacties
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-info/5 border-info/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-info shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm mb-1">Over je inkomsten</h3>
                      <p className="text-xs text-muted-foreground">
                        Inkomsten uit vaste contracten ontvang je direct van je werkgever. 
                        De wallet toont alleen inkomsten uit korte opdrachten.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Snelle acties</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/opdrachten">
                        Nieuwe opdrachten bekijken
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Profiel bewerken
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Beschikbaarheid aanpassen
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </ProtectedRoute>
  );
}
