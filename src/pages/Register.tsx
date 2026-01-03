import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  User,
  Briefcase
} from "lucide-react";

type UserType = "professional" | "employer" | null;
type WorkPreference = "short" | "long" | "both" | null;

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "employer" ? "employer" : null;
  
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(initialType);
  const [workPreference, setWorkPreference] = useState<WorkPreference>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    name: "",
    companyName: "",
    kvkNumber: "",
    agreeTerms: false,
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast({
        title: "Voorwaarden accepteren",
        description: "Je moet de algemene voorwaarden accepteren om door te gaan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account aangemaakt!",
      description: "Welkom bij DJOBBA. Je kunt nu inloggen.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Stap {step} van 3</span>
            </div>
            <div className="h-2 bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: User Type */}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welkom bij DJOBBA</CardTitle>
                <CardDescription>
                  Hoe wil je DJOBBA gebruiken?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => { setUserType("professional"); setStep(2); }}
                  className={`w-full p-6 border-2 text-left transition-all hover:border-primary/50 ${
                    userType === "professional" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Ik zoek werk</h3>
                      <p className="text-sm text-muted-foreground">
                        Vind flexibele opdrachten of solliciteer op vaste contracten
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
                  </div>
                </button>

                <button
                  onClick={() => { setUserType("employer"); setStep(2); }}
                  className={`w-full p-6 border-2 text-left transition-all hover:border-primary/50 ${
                    userType === "employer" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center shrink-0">
                      <Briefcase className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Ik zoek personeel</h3>
                      <p className="text-sm text-muted-foreground">
                        Plaats opdrachten en vind de juiste professionals
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
                  </div>
                </button>

                <p className="text-center text-sm text-muted-foreground pt-4">
                  Al een account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Inloggen
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Work Preference (Professional) or Company Info (Employer) */}
          {step === 2 && userType === "professional" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Hoe wil je werken?</CardTitle>
                <CardDescription>
                  Kies wat het beste bij jou past
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => { setWorkPreference("short"); setStep(3); }}
                  className={`w-full p-6 border-2 text-left transition-all hover:border-primary/50 ${
                    workPreference === "short" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Ik wil flexibel werken</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Per dag/week</li>
                        <li>• Zelf tarief bepalen</li>
                        <li>• Uitbetaling via DJOBBA (snel of standaard)</li>
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setWorkPreference("long"); setStep(3); }}
                  className={`w-full p-6 border-2 text-left transition-all hover:border-primary/50 ${
                    workPreference === "long" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Ik zoek een vast contract</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• In dienst bij het bedrijf</li>
                        <li>• Vast salaris, secundaire voorwaarden</li>
                        <li>• Door DJOBBA gematcht</li>
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setWorkPreference("both"); setStep(3); }}
                  className={`w-full p-6 border-2 text-left transition-all hover:border-primary/50 ${
                    workPreference === "both" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Beide</h3>
                      <p className="text-sm text-muted-foreground">
                        Ik wil toegang tot zowel korte opdrachten als vaste contracten
                      </p>
                    </div>
                  </div>
                </button>

                <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                  Terug
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && userType === "employer" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Bedrijfsgegevens</CardTitle>
                <CardDescription>
                  Vertel ons meer over je bedrijf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Bedrijfsnaam</Label>
                    <Input 
                      id="companyName" 
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Bedrijfsnaam B.V."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kvkNumber">KVK-nummer</Label>
                    <Input 
                      id="kvkNumber" 
                      required
                      value={formData.kvkNumber}
                      onChange={(e) => setFormData({ ...formData, kvkNumber: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                      Terug
                    </Button>
                    <Button type="submit" className="flex-1">
                      Verder
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Account Details */}
          {step === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Maak je account aan</CardTitle>
                <CardDescription>
                  Vul je gegevens in om te beginnen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {userType === "professional" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Volledige naam</Label>
                      <Input 
                        id="name" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jan de Vries"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input 
                      id="email" 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jan@voorbeeld.nl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <Input 
                      id="password" 
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimaal 8 karakters"
                      minLength={8}
                    />
                  </div>
                  
                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      Ik ga akkoord met de{" "}
                      <Link to="/algemene-voorwaarden" className="text-primary hover:underline">
                        algemene voorwaarden
                      </Link>
                      {" "}en het{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        privacybeleid
                      </Link>
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">
                      Terug
                    </Button>
                    <Button type="submit" className="flex-1">
                      Account aanmaken
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
