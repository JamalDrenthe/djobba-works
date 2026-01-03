import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
            D
          </div>
          <span className="text-xl font-bold text-foreground">DJOBBA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/opdrachten" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Opdrachten
          </Link>
          <Link to="/voor-professionals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Voor Professionals
          </Link>
          <Link to="/voor-bedrijven" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Voor Bedrijven
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Inloggen</Link>
          </Button>
          <Button asChild>
            <Link to="/registreren">Registreren</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 flex flex-col gap-3">
            <Link 
              to="/opdrachten" 
              className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Opdrachten
            </Link>
            <Link 
              to="/voor-professionals" 
              className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Voor Professionals
            </Link>
            <Link 
              to="/voor-bedrijven" 
              className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Voor Bedrijven
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <Button variant="ghost" asChild className="w-full justify-center">
                <Link to="/login">Inloggen</Link>
              </Button>
              <Button asChild className="w-full justify-center">
                <Link to="/registreren">Registreren</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
