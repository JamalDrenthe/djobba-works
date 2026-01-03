import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { AssignmentCard } from "@/components/AssignmentCard";
import { mockAssignments } from "@/data/mockAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Zap, Building2, MapPin } from "lucide-react";

const sectors = [
  "Alle sectoren",
  "Zorg",
  "Sales",
  "Logistiek",
  "IT",
  "Bouw",
  "Entertainment",
  "HR & Recruitment",
];

const locations = [
  "Alle locaties",
  "Amsterdam",
  "Rotterdam",
  "Utrecht",
  "Den Haag",
  "Eindhoven",
];

export default function Assignments() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("type") === "lang" ? "long" : "all";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("Alle sectoren");
  const [selectedLocation, setSelectedLocation] = useState("Alle locaties");

  const filteredAssignments = mockAssignments.filter((assignment) => {
    // Tab filter
    if (activeTab === "short" && assignment.type !== "short") return false;
    if (activeTab === "long" && assignment.type !== "long") return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = assignment.title.toLowerCase().includes(query);
      const matchesCompany = assignment.company.toLowerCase().includes(query);
      if (!matchesTitle && !matchesCompany) return false;
    }

    // Sector filter
    if (selectedSector !== "Alle sectoren" && assignment.sector !== selectedSector) {
      return false;
    }

    // Location filter
    if (selectedLocation !== "Alle locaties" && !assignment.location.includes(selectedLocation)) {
      return false;
    }

    return true;
  });

  const shortCount = mockAssignments.filter(a => a.type === "short").length;
  const longCount = mockAssignments.filter(a => a.type === "long").length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/30 border-b border-border">
          <div className="container py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Opdrachten
            </h1>
            <p className="text-muted-foreground">
              Ontdek {mockAssignments.length} beschikbare opdrachten
            </p>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="container py-8">
          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op functie of bedrijf..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[180px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Locatie" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                Alles ({mockAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="short" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Kort ({shortCount})
              </TabsTrigger>
              <TabsTrigger value="long" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Vast ({longCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results */}
          {filteredAssignments.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Geen opdrachten gevonden
              </h3>
              <p className="text-muted-foreground mb-6">
                Probeer je zoekopdracht aan te passen of filters te verwijderen
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSector("Alle sectoren");
                  setSelectedLocation("Alle locaties");
                  setActiveTab("all");
                }}
              >
                Filters wissen
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
