import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-bold">
                D
              </div>
              <span className="text-lg font-bold">DJOBBA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Het platform voor flexibel werk en vaste contracten in Nederland.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Voor Professionals</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/opdrachten" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Opdrachten zoeken
                </Link>
              </li>
              <li>
                <Link to="/registreren" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Registreren
                </Link>
              </li>
              <li>
                <Link to="/voor-professionals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hoe het werkt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Voor Bedrijven</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/voor-bedrijven" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Talent vinden
                </Link>
              </li>
              <li>
                <Link to="/registreren" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Account aanmaken
                </Link>
              </li>
              <li>
                <Link to="/voor-bedrijven" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Over DJOBBA</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/over-ons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Over ons
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 DJOBBA. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6">
            <Link to="/algemene-voorwaarden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Algemene voorwaarden
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacybeleid
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
