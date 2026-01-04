import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MicrocopyText } from "@/lib/microcopy";
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Award,
  Heart,
  Calendar
} from "lucide-react";

export default function VasteContractenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/5 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-secondary/40 text-secondary-foreground text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              <MicrocopyText key="landing.professionals.long.subtitle" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              <MicrocopyText key="landing.professionals.long.headline" />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Zekerheid van een vast contract met alle voordelen. Werk voor topbedrijven aan langdurige projecten.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link to="/opdrachten?type=lang">
                  Bekijk vaste contracten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/registreren?type=professional">
                  Start je zoektocht
                  <Briefcase className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-secondary/40 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.professionals.long.bullet1" />
                </h3>
                <p className="text-muted-foreground">
                  Word direct in dienst genomen bij het bedrijf met alle arbeidsrechtelijke bescherming.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-secondary/40 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.professionals.long.bullet2" />
                </h3>
                <p className="text-muted-foreground">
                  Geniet van een vast salaris, vakantiedagen, pensioenopbouw en andere secundaire voorwaarden.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-secondary/40 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.professionals.long.bullet3" />
                </h3>
                <p className="text-muted-foreground">
                  Werk aan uitdagende projecten voor een periode van 7+ maanden met uitzicht op verlenging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              De voordelen van vaste contracten
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meer dan alleen een salaris - investeer in je toekomst
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Zekerheid</h4>
              <p className="text-sm text-muted-foreground">
                Stabiel inkomen en baangarantie
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Zorgverzekering</h4>
              <p className="text-sm text-muted-foreground">
                Collectieve verzekering met korting
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Ontwikkeling</h4>
              <p className="text-sm text-muted-foreground">
                Training en opleidingsbudget
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Team</h4>
              <p className="text-sm text-muted-foreground">
                Onderdeel van een vast team
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Zo vinden wij jouw perfecte match
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Profiel analyse</h4>
                    <p className="text-muted-foreground">
                      Onze AI analyseert je vaardigheden, ervaring en voorkeuren.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Matching</h4>
                    <p className="text-muted-foreground">
                      We matchen je met bedrijven die passen bij jouw profiel.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Introductie</h4>
                    <p className="text-muted-foreground">
                      Kennismaking met het bedrijf en sollicitatiegesprek.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Contract</h4>
                    <p className="text-muted-foreground">
                      Teken je contract en start je nieuwe baan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6"> Vereisten voor vaste contracten</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Minimaal 3 verificatie badges</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Volledig profiel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Referenties beschikbaar</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Minimaal 1 jaar ervaring</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tip:</strong> Hoe meer je profiel is voltooid, hoe beter je matches.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ervaringen van professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Binnen 2 weken een vaste baan gevonden via DJOBBA. Het proces was soepel en de begeleiding top!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Sarah J.</p>
                  <p className="text-xs text-muted-foreground">Marketing Manager</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "De perfecte overgang van freelance naar vast contract. DJOBBA begreep precies wat ik zocht."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Mike R.</p>
                  <p className="text-xs text-muted-foreground">Software Developer</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Uitstekende voorwaarden en een leuk team. Had niet verwacht zo snel een vaste baan te vinden."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Lisa T.</p>
                  <p className="text-xs text-muted-foreground">HR Advisor</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar voor je volgende stap?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Vind jouw droombaan bij topbedrijven. Start vandaag nog met solliciteren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link to="/registreren?type=professional">
                Start je zoektocht
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/opdrachten?type=lang">
                Bekijk alle contracten
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
