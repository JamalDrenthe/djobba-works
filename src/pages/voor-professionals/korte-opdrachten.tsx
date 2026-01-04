import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MicrocopyText } from "@/lib/microcopy";
import { 
  Zap, 
  Clock, 
  Wallet, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Calendar,
  Euro,
  Users,
  TrendingUp
} from "lucide-react";

export default function KorteOpdrachtenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <MicrocopyText key="landing.professionals.short.subtitle" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              <MicrocopyText key="landing.professionals.short.headline" />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Werk wanneer je wilt, betaald zoals jij wilt. Perfect voor studenten, ZZP'ers en iedereen die flexibiliteit zoekt.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link to="/opdrachten?type=kort">
                  Bekijk korte opdrachten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/registreren?type=professional">
                  Start als professional
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
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.professionals.short.bullet1" />
                </h3>
                <p className="text-muted-foreground">
                  Kies zelf wanneer je werkt. Per dag, week of maand - jij bepaalt je agenda.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-primary/20 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.professionals.short.bullet2" />
                </h3>
                <p className="text-muted-foreground">
                  Direct uitbetaald via factoring (3% kosten) of wacht op de standaard betalingstermijn.
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
                  <MicrocopyText key="landing.professionals.short.bullet3" />
                </h3>
                <p className="text-muted-foreground">
                  Geen vast contract, maximale vrijheid. Werk voor verschillende opdrachtgevers.
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
              Hoe het werkt
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              In 3 stappen aan de slag met korte opdrachten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Registreer je gratis</h3>
              <p className="text-muted-foreground">
                Maak je profiel aan, verifieer je e-mail en voeg je vaardigheden toe.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Vind opdrachten</h3>
              <p className="text-muted-foreground">
                Blader door beschikbare opdrachten en solliciteer op wat bij je past.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start met werken</h3>
              <p className="text-muted-foreground">
                Accepteer de opdracht en begin direct. Kies je betaalvoorkeur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Waarom kiezen voor korte opdrachten?
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Maximale flexibiliteit</h4>
                    <p className="text-muted-foreground">Werk wanneer jij wilt, waar jij wilt.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Snel betaald</h4>
                    <p className="text-muted-foreground">Kies voor directe uitbetaling via factoring.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Varieer werk</h4>
                    <p className="text-muted-foreground">Werk voor verschillende bedrijven en opdrachten.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Bouw ervaring</h4>
                    <p className="text-muted-foreground">Verbreed je netwerk en vaardigheden.</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" asChild>
                <Link to="/opdrachten?type=kort">
                  Bekijk beschikbare opdrachten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-24 w-24 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">500+</div>
                  <div className="text-lg text-muted-foreground">Actieve opdrachten</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om te starten?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join duizenden professionals die al flexibel werken via DJOBBA.
            Gratis registratie, geen verplichtingen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/registreren?type=professional">
                Gratis registreren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/opdrachten?type=kort">
                Bekijk opdrachten
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
