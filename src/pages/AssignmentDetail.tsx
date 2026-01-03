import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAssignments } from "@/data/mockAssignments";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Briefcase, 
  Zap, 
  Building2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Calendar,
  Users,
  Shield
} from "lucide-react";

export default function AssignmentDetail() {
  const { id } = useParams();
  const assignment = mockAssignments.find((a) => a.id === id);

  if (!assignment) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Opdracht niet gevonden</h1>
          <Button asChild>
            <Link to="/opdrachten">Terug naar opdrachten</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isShort = assignment.type === "short";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="container py-4">
            <Link 
              to="/opdrachten" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar opdrachten
            </Link>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    variant={isShort ? "default" : "secondary"}
                    className={isShort ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                  >
                    {isShort ? (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        KORTE OPDRACHT
                      </>
                    ) : (
                      <>
                        <Building2 className="h-3 w-3 mr-1" />
                        VAST CONTRACT
                      </>
                    )}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{assignment.duration}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {assignment.title}
                </h1>
                <p className="text-lg text-muted-foreground">{assignment.company}</p>
              </div>

              {/* Key Info */}
              <div className="flex flex-wrap gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{assignment.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-5 w-5" />
                  <span>{assignment.sector}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{assignment.duration}</span>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Omschrijving</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                  <p>
                    We zijn op zoek naar een gemotiveerde {assignment.title.toLowerCase()} voor ons team bij {assignment.company}. 
                    Je zult werken in een dynamische omgeving waar je je vaardigheden kunt ontwikkelen en een echte impact kunt maken.
                  </p>
                  <h4 className="font-semibold text-foreground mt-6 mb-3">Wat ga je doen?</h4>
                  <ul className="space-y-2">
                    <li>Actief bijdragen aan projecten en taken binnen de afdeling</li>
                    <li>Samenwerken met collega's om gezamenlijke doelen te bereiken</li>
                    <li>Kwaliteit leveren en deadlines respecteren</li>
                    <li>Proactief meedenken over verbeteringen</li>
                  </ul>
                  <h4 className="font-semibold text-foreground mt-6 mb-3">Wat verwachten we?</h4>
                  <ul className="space-y-2">
                    <li>Relevante ervaring in {assignment.sector}</li>
                    <li>Goede communicatieve vaardigheden in het Nederlands</li>
                    <li>Flexibele en proactieve werkhouding</li>
                    <li>Beschikbaar voor de volledige duur van de opdracht</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Contract Info - Different for Short vs Long */}
              {!isShort && (
                <Card className="border-info/30 bg-info/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-info" />
                      Belangrijk: Dit is een vast contract
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Bij deze opdracht kom je in dienst bij <strong>{assignment.company}</strong>.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Building2 className="h-5 w-5 text-info shrink-0 mt-0.5" />
                        <span><strong>{assignment.company}</strong> wordt je werkgever voor de duur van het contract</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Wallet className="h-5 w-5 text-info shrink-0 mt-0.5" />
                        <span>Salaris en voorwaarden regel je direct met hen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-info shrink-0 mt-0.5" />
                        <span>DJOBBA heeft alleen de match gefaciliteerd</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">
                      {assignment.compensation}
                    </div>
                    <div className="text-muted-foreground">
                      per {assignment.compensationType === "hourly" ? "uur" : "maand"}
                    </div>
                  </div>

                  {isShort ? (
                    <>
                      {assignment.factoringAvailable && (
                        <div className="mb-6 p-4 bg-success/10 border border-success/20">
                          <div className="flex items-center gap-2 text-success font-medium mb-1">
                            <Zap className="h-4 w-4" />
                            Snelle uitbetaling beschikbaar
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Kies voor betaling binnen 3 werkdagen via factoring
                          </p>
                        </div>
                      )}
                      <Button size="lg" className="w-full mb-3">
                        Direct accepteren
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Na acceptatie kun je kiezen hoe je betaald wilt worden
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Vast salaris</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Pensioenopbouw</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Reiskostenvergoeding</span>
                        </div>
                      </div>
                      <Button size="lg" className="w-full mb-3">
                        Solliciteer nu
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Je solliciteert voor een dienstverband bij {assignment.company}
                      </p>
                    </>
                  )}

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Geplaatst: 2 dagen geleden</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Geverifieerde opdrachtgever</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Over {assignment.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {assignment.company.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{assignment.company}</div>
                      <div className="text-sm text-muted-foreground">{assignment.sector}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Een toonaangevend bedrijf in de {assignment.sector.toLowerCase()} sector met een focus op 
                    innovatie en kwaliteit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
