import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Succesvol ingelogd",
          description: "Welkom terug!",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const accountType = formData.get("accountType") as string;

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(email, password, { accountType });
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Account aangemaakt",
          description: "Check je e-mail voor bevestiging",
        });
      }
    } catch (err) {
      setError("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground font-bold text-xl rounded-lg">
              D
            </div>
          </div>
          <CardTitle>Welkom bij DJOBBA</CardTitle>
          <CardDescription>
            Log in of maak een account aan
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Inloggen</TabsTrigger>
              <TabsTrigger value="register">Registreren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="jouw@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Wachtwoord</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Laden..." : "Inloggen"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="jouw@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Wachtwoord</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Bevestig wachtwoord</Label>
                  <Input
                    id="register-confirm"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <select 
                    name="accountType" 
                    className="w-full p-2 border rounded-md" 
                    required
                    aria-label="Kies account type"
                    title="Kies account type"
                  >
                    <option value="">Kies type</option>
                    <option value="professional">Professional</option>
                    <option value="employer">Opdrachtgever</option>
                    <option value="both">Beide</option>
                  </select>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Laden..." : "Registreren"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Test accounts: <br />
            Professional: professional@test.com / test123456 <br />
            Opdrachtgever: employer@test.com / test123456
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
