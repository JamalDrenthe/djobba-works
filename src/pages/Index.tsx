import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { AssignmentCard } from "@/components/AssignmentCard";
import { mockAssignments } from "@/data/mockAssignments";
import heroImage from "@/assets/hero-image.jpg";
import { 
  Zap, 
  Building2, 
  Wallet, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Shield,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const featuredAssignments = mockAssignments.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                Het platform voor werk dat bij jou past
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Flexibel werk én 
                <span className="text-primary"> vaste contracten</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Vind korte klussen met snelle betaling of solliciteer op vaste contracten bij topbedrijven. 
                DJOBBA biedt twee wegen naar werk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base">
                  <Link to="/registreren">
                    Start nu gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link to="/opdrachten">
                    Bekijk opdrachten
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Gratis registreren
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Binnen 3 dagen betaald
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl opacity-50" />
              <img 
                src={heroImage} 
                alt="DJOBBA professionals aan het werk"
                className="relative w-full h-auto shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Twee wegen naar werk
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kies wat bij jou past: flexibele korte opdrachten of stabiele vaste contracten.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Short Assignments */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Korte Opdrachten</h3>
                <p className="text-muted-foreground mb-6">
                  Werk wanneer je wilt, word snel betaald. Perfect voor studenten, ZZP'ers en iedereen die flexibiliteit zoekt.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Per dag of week werken</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span>Optie: binnen 3 dagen betaald</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Zelf tarief bepalen</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to="/opdrachten?type=kort">
                    Bekijk korte opdrachten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Long Contracts */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-secondary/40">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/20 flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Vaste Contracten</h3>
                <p className="text-muted-foreground mb-6">
                  Word aangenomen door topbedrijven voor langere projecten. Zekerheid met alle secundaire voorwaarden.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Building2 className="h-5 w-5 text-secondary-foreground" />
                    <span>In dienst bij het bedrijf</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <TrendingUp className="h-5 w-5 text-secondary-foreground" />
                    <span>Vast salaris + voorwaarden</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                    <span>Gematcht door DJOBBA</span>
                  </li>
                </ul>
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/opdrachten?type=lang">
                    Bekijk vaste contracten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Assignments */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Recente opdrachten
              </h2>
              <p className="text-muted-foreground">
                Ontdek de nieuwste mogelijkheden die bij jou passen
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/opdrachten">
                Alle opdrachten bekijken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Op zoek naar talent?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Vind snel de juiste professionals voor korte klussen of langlopende projecten. 
                Gemiddelde tijd om een match te vinden: minder dan 24 uur.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/voor-bedrijven">
                    Meer informatie
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/registreren?type=employer">
                    Gratis starten
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-primary-foreground/10 p-6">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-sm opacity-80">Actieve professionals</div>
              </div>
              <div className="bg-primary-foreground/10 p-6">
                <div className="text-4xl font-bold mb-2">&lt;24u</div>
                <div className="text-sm opacity-80">Gemiddelde match tijd</div>
              </div>
              <div className="bg-primary-foreground/10 p-6">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-sm opacity-80">Tevreden opdrachtgevers</div>
              </div>
              <div className="bg-primary-foreground/10 p-6">
                <div className="text-4xl font-bold mb-2">7+</div>
                <div className="text-sm opacity-80">Sectoren</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
