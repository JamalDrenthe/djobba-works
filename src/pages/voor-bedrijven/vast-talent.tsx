import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MicrocopyText } from "@/lib/microcopy";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Building2,
  Award,
  Target,
  Clock,
  Search,
  Handshake
} from "lucide-react";

export default function VastTalentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/5 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-secondary/40 text-secondary-foreground text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <MicrocopyText key="landing.business.permanent.subtitle" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              <MicrocopyText key="landing.business.permanent.headline" />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vind de beste professionals voor vaste posities. 
              Vooraf gescreend, gematcht en gegarandeerd.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link to="/registreren?type=employer">
                  Vind vast talent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/opdrachten?new&type=permanent">
                  Plaats vacature
                  <Search className="ml-2 h-5 w-5" />
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
                  <Search className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.permanent.bullet1" />
                </h3>
                <p className="text-muted-foreground">
                  Alle kandidaten zijn vooraf gescreend op vaardigheden, ervaring en motivatie.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-secondary/40 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.permanent.bullet2" />
                </h3>
                <p className="text-muted-foreground">
                  Gemiddeld binnen 2 weken de perfecte kandidaat gevonden en geplaatst.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center p-8 border-2 border-transparent hover:border-secondary/40 transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  <MicrocopyText key="landing.business.permanent.bullet3" />
                </h3>
                <p className="text-muted-foreground">
                  Niet tevreden? Binnen 6 maanden vervanging van de kandidaat kosteloos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ons bewezen plaatsingsproces
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Van intake tot plaatsing in 5 duidelijke stappen
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Intake</h3>
              <p className="text-sm text-muted-foreground">
                We bespreken je wensen en eisen
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Profiel</h3>
              <p className="text-sm text-muted-foreground">
                Opstellen van ideaal kandidaatprofiel
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">
                Actief zoeken naar geschikte kandidaten
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Selectie</h3>
              <p className="text-sm text-muted-foreground">
                Interviews en assessments
              </p>
            </div>

            {/* Step 5 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                5
              </div>
              <h3 className="font-semibold mb-2">Plaatsing</h3>
              <p className="text-sm text-muted-foreground">
                Contract tekenen en onboarden
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Complete werving & selectie
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Executive search</h4>
                    <p className="text-muted-foreground">Werving van C-level en senior management posities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Technical recruitment</h4>
                    <p className="text-muted-foreground">Specialisten in IT, engineering en technische rollen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Volume hiring</h4>
                    <p className="text-muted-foreground">Meerdere posities tegelijk invullen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Interim management</h4>
                    <p className="text-muted-foreground">Tijdelijke managers voor transitieperiodes</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contact?type=recruitment">
                  Plan kennismaking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6">Inbegrepen bij elke plaatsing</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Voorscreening van alle kandidaten</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Competentie assessments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Referentiechecks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>6 maanden garantie</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Handshake className="h-5 w-5 text-primary" />
                    <span>Onderhandeling support</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sectoren waarin we excelleren
            </h2>
            <p className="text-lg text-muted-foreground">
              Gespecialiseerd in diverse industrieën
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Technology</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Software, IT, Data & AI
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Finance</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Banking, Accounting, Investment
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Healthcare</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Medical, Pharma, Biotech
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Sales & Marketing</h4>
              <p className="text-sm text-muted-foreground mt-2">
                B2B, B2C, Digital Marketing
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Legal</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Corporate Law, Compliance
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">HR</h4>
              <p className="text-sm text-muted-foreground mt-2">
                HRBP, Recruitment, L&D
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Operations</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Supply Chain, Logistics, Manufacturing
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold">Consulting</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Strategy, Management, IT Consulting
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Succesverhalen
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
                "Binnen 2 weken een perfecte developer gevonden. De screening was top en we bespaarden maanden werven."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Jan de Vries</p>
                  <p className="text-xs text-muted-foreground">CTO, TechCorp</p>
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
                "De 6 maanden garantie gaf ons vertrouwen. De kandidaat is nog steeds bij ons en presteert uitstekend."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Maria Sanchez</p>
                  <p className="text-xs text-muted-foreground">HR Director, InnovateCo</p>
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
                "5 posities binnen 1 maand ingevuld. Onvergelijkbaar met traditionele recruitment bureaus."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Erik Johnson</p>
                  <p className="text-xs text-muted-foreground">CEO, ScaleUp Inc</p>
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
            Klaar voor top talent?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Laat ons het zware werk doen. Focus op je business terwijl wij de perfecte kandidaten vinden.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link to="/contact?type=recruitment">
                Start werving
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/tarieven">
                Bekijk tarieven
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
