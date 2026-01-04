import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MicrocopyText } from "@/lib/microcopy";
import { 
  Zap, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Calendar,
  Euro,
  Shield,
  BarChart3
} from "lucide-react";

export default function FlexibeleInzetPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <MicrocopyText key="landing.business.flex.subtitle" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              <MicrocopyText key="landing.business.flex.headline" />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Schakel snel gekwalificeerde professionals in voor korte projecten. 
              Ideaal voor seizoenspiek, zieke vervanging of speciale projecten.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link to="/registreren?type=employer">
                  Start als opdrachtgever
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/opdrachten?new&type=short">
                  Plaats opdracht
                  <Users className="ml-2 h-5 w-5" />
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
            <Card className="text-center p-8 border-2 border-transparent hover:border-primary/20 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.flex.bullet1" />
                </h3>
                <p className="text-muted-foreground">
                  Vind gekwalificeerde professionals binnen 24 uur voor urgente opdrachten.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-primary/20 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.flex.bullet2" />
                </h3>
                <p className="text-muted-foreground">
                  Flexibele beschikbaarheid: huur professionals per dag, week of maand.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-primary/20 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.flex.bullet3" />
                </h3>
                <p className="text-muted-foreground">
                  Geen lange contracten of verplichtingen. Betaal alleen voor wat je nodig hebt.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Zo werkt het
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              In 4 stappen jouw flexibele professional gevonden
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Opdracht plaatsen</h3>
              <p className="text-sm text-muted-foreground">
                Beschrijf je opdracht en vereisten
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Sollicitaties ontvangen</h3>
              <p className="text-sm text-muted-foreground">
                Krijg direct reacties van beschikbare professionals
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Kies de beste match</h3>
              <p className="text-sm text-muted-foreground">
                Selecteer de professional die het beste past
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Start de opdracht</h3>
              <p className="text-sm text-muted-foreground">
                Bevestig en begin direct met de samenwerking
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transparante tarieven
            </h2>
            <p className="text-lg text-muted-foreground">
              Geen verborgen kosten, betaal alleen voor succesvolle matches
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">Basic</h3>
              <div className="text-3xl font-bold mb-4">8%</div>
              <p className="text-muted-foreground mb-6">Service fee per opdracht</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Toegang tot 500+ professionals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Support via e-mail</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Binnen 48 uur match</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Kies Basic
              </Button>
            </Card>

            {/* Professional */}
            <Card className="p-8 border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Meest populair
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Professional</h3>
              <div className="text-3xl font-bold mb-4">12%</div>
              <p className="text-muted-foreground mb-6">Service fee per opdracht</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Toegang tot 1000+ professionals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Prioritaire support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Binnen 24 uur match</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Vervanging garantie</span>
                </li>
              </ul>
              <Button className="w-full">
                Kies Professional
              </Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <p className="text-muted-foreground mb-6">Op maat gemaakte oplossingen</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Onbeperkt toegang</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">API integratie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Custom contracts</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Voorbeelden van flexibele inzet
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Seizoenspiek</h3>
              <p className="text-sm text-muted-foreground">
                Extra personeel tijdens drukke periodes zoals feestdagen of vakanties
              </p>
            </Card>

            <Card className="p-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Ziektevervanging</h3>
              <p className="text-sm text-muted-foreground">
                Snel een vervanger wanneer een medewerker ziek is
              </p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Projectbasis</h3>
              <p className="text-sm text-muted-foreground">
                Specialist voor specifieke projecten zonder vast contract
              </p>
            </Card>

            <Card className="p-6">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Evenementen</h3>
              <p className="text-sm text-muted-foreground">
                Tijdelijk personeel voor evenementen en conferenties
              </p>
            </Card>

            <Card className="p-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Proefperiode</h3>
              <p className="text-sm text-muted-foreground">
                Test een professional voordat je een vast contract aanbiedt
              </p>
            </Card>

            <Card className="p-6">
              <Euro className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Cost control</h3>
              <p className="text-sm text-muted-foreground">
                Flexibele kosten die meegroeien met je behoeften
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Beschikbare professionals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">&lt;24u</div>
              <div className="text-sm text-muted-foreground">Gemiddelde match tijd</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Klanttevredenheid</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Voltooide opdrachten</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om flexibel talent in te zetten?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Start vandaag nog en vind de perfecte professionals voor jouw opdrachten.
            Gratis registratie, geen verplichtingen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/registreren?type=employer">
                Gratis starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">
                Plan een demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
