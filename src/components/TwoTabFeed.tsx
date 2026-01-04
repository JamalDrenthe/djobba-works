import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { AssignmentWithDetails } from '@/types/database';
import { AssignmentCard } from '@/components/AssignmentCard';
import { 
  Calendar,
  Clock,
  Euro,
  MapPin,
  Users,
  Building2,
  Filter,
  Search,
  Zap,
  Briefcase,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Save,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface TwoTabFeedProps {
  shortAssignments: AssignmentWithDetails[];
  longAssignments: AssignmentWithDetails[];
  onAssignmentClick: (assignment: AssignmentWithDetails) => void;
  loading?: boolean;
  className?: string;
}

export function TwoTabFeed({ 
  shortAssignments, 
  longAssignments, 
  onAssignmentClick,
  loading = false,
  className = ''
}: TwoTabFeedProps) {
  const [activeTab, setActiveTab] = useState<'short' | 'long'>('short');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100]);
  const [duration, setDuration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<{
    id: number;
    query: string;
    category: string;
    location: string;
    salaryRange: [number, number];
    duration: string;
    sortBy: string;
    createdAt: string;
  }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchHistory]);

  // Get unique categories and locations from assignments
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    [...shortAssignments, ...longAssignments].forEach(a => {
      if (a.category) categories.add(a.category);
    });
    return Array.from(categories);
  }, [shortAssignments, longAssignments]);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    [...shortAssignments, ...longAssignments].forEach(a => {
      if (a.location) locations.add(a.location);
    });
    return Array.from(locations);
  }, [shortAssignments, longAssignments]);

  // Get salary range from assignments
  const salaryData = useMemo(() => {
    const rates = [...shortAssignments, ...longAssignments]
      .map(a => a.rate_cents / 100)
      .filter(rate => rate > 0);
    
    if (rates.length === 0) return { min: 0, max: 100 };
    
    return {
      min: Math.min(...rates),
      max: Math.max(...rates)
    };
  }, [shortAssignments, longAssignments]);

  // Filter assignments based on all criteria
  const filterAssignments = useCallback((assignments: AssignmentWithDetails[]) => {
    return assignments.filter(assignment => {
      // Search query filter
      if (debouncedQuery) {
        const query = debouncedQuery.toLowerCase();
        const matchesTitle = assignment.title.toLowerCase().includes(query);
        const matchesCompany = assignment.employer_name?.toLowerCase().includes(query) || '';
        const matchesDescription = assignment.description?.toLowerCase().includes(query) || '';
        const matchesCategory = assignment.category?.toLowerCase().includes(query) || '';
        
        if (!matchesTitle && !matchesCompany && !matchesDescription && !matchesCategory) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory !== 'all' && assignment.category !== selectedCategory) {
        return false;
      }
      
      // Location filter
      if (selectedLocation !== 'all' && assignment.location !== selectedLocation) {
        return false;
      }
      
      // Salary filter
      const rate = assignment.rate_cents / 100;
      if (rate < salaryRange[0] || rate > salaryRange[1]) {
        return false;
      }
      
      // Duration filter for short assignments
      if (activeTab === 'short' && duration !== 'all') {
        if (duration === 'day' && !assignment.title.toLowerCase().includes('dag')) {
          return false;
        }
        if (duration === 'week' && !assignment.title.toLowerCase().includes('week')) {
          return false;
        }
        if (duration === 'month' && !assignment.title.toLowerCase().includes('maand')) {
          return false;
        }
      }
      
      return true;
    });
  }, [debouncedQuery, selectedCategory, selectedLocation, salaryRange, duration, activeTab]);

  // Sort assignments
  const sortAssignments = useCallback((assignments: AssignmentWithDetails[]) => {
    const sorted = [...assignments];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'salary_high':
        return sorted.sort((a, b) => b.rate_cents - a.rate_cents);
      case 'salary_low':
        return sorted.sort((a, b) => a.rate_cents - b.rate_cents);
      case 'deadline':
        return sorted.sort((a, b) => {
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aDeadline - bDeadline;
        });
      default:
        return sorted;
    }
  }, [sortBy]);

  // Apply filters and sorting
  const filteredShortAssignments = useMemo(() => {
    return sortAssignments(filterAssignments(shortAssignments));
  }, [shortAssignments, filterAssignments, sortAssignments]);

  const filteredLongAssignments = useMemo(() => {
    return sortAssignments(filterAssignments(longAssignments));
  }, [longAssignments, filterAssignments, sortAssignments]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    
    const suggestions = new Set<string>();
    const query = debouncedQuery.toLowerCase();
    
    [...shortAssignments, ...longAssignments].forEach(assignment => {
      if (assignment.title.toLowerCase().includes(query)) {
        suggestions.add(assignment.title);
      }
      if (assignment.employer_name && assignment.employer_name.toLowerCase().includes(query)) {
        suggestions.add(assignment.employer_name);
      }
      if (assignment.category && assignment.category.toLowerCase().includes(query)) {
        suggestions.add(assignment.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [debouncedQuery, shortAssignments, longAssignments]);

  // Save current search
  const saveSearch = () => {
    const search = {
      id: Date.now(),
      query: searchQuery,
      category: selectedCategory,
      location: selectedLocation,
      salaryRange,
      duration,
      sortBy,
      createdAt: new Date().toISOString()
    };
    
    setSavedSearches(prev => [search, ...prev.slice(0, 4)]);
  };

  // Load saved search
  const loadSavedSearch = (search: {
    id: number;
    query: string;
    category: string;
    location: string;
    salaryRange: [number, number];
    duration: string;
    sortBy: string;
    createdAt: string;
  }) => {
    setSearchQuery(search.query);
    setSelectedCategory(search.category);
    setSelectedLocation(search.location);
    setSalaryRange(search.salaryRange);
    setDuration(search.duration);
    setSortBy(search.sortBy);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSalaryRange([salaryData.min, salaryData.max]);
    setDuration('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || 
    selectedCategory !== 'all' || 
    selectedLocation !== 'all' || 
    salaryRange[0] > salaryData.min || 
    salaryRange[1] < salaryData.max ||
    duration !== 'all' ||
    sortBy !== 'newest';


  const shortAssignmentCount = filteredShortAssignments.length;
  const longAssignmentCount = filteredLongAssignments.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Beschikbare opdrachten</h2>
          <p className="text-muted-foreground">
            {shortAssignmentCount + longAssignmentCount} opdrachten beschikbaar
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            {shortAssignmentCount} kort
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Briefcase className="h-3 w-3" />
            {longAssignmentCount} vast
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          {/* Search Bar with Suggestions */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Zoek op titel, bedrijf, categorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Locatie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle locaties</SelectItem>
                {allLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sorteren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Nieuwste eerst</SelectItem>
                <SelectItem value="oldest">Oudste eerst</SelectItem>
                <SelectItem value="salary_high">Salaris hoog → laag</SelectItem>
                <SelectItem value="salary_low">Salaris laag → hoog</SelectItem>
                <SelectItem value="deadline">Deadline eerst</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Geavanceerd
              </span>
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Salarisbereik (€/uur)</Label>
                <Slider
                  value={salaryRange}
                  onValueChange={(value: [number, number]) => setSalaryRange(value)}
                  max={salaryData.max}
                  min={salaryData.min}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>€{salaryRange[0]}</span>
                  <span>€{salaryRange[1]}</span>
                </div>
              </div>

              {activeTab === 'short' && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Duur</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies duur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle duur</SelectItem>
                      <SelectItem value="day">Per dag</SelectItem>
                      <SelectItem value="week">Per week</SelectItem>
                      <SelectItem value="month">Per maand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveSearch}>
                    <Save className="h-4 w-4 mr-2" />
                    Zoekopdracht opslaan
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Filters wissen
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {activeTab === 'short' ? filteredShortAssignments.length : filteredLongAssignments.length} resultaten
                </div>
              </div>
            </div>
          )}

          {/* Search History & Saved Searches */}
          {(searchHistory.length > 0 || savedSearches.length > 0) && (
            <div className="border-t pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {searchHistory.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Recent gezocht
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(query)}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {savedSearches.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Opgeslagen zoekopdrachten
                    </Label>
                    <div className="space-y-1">
                      {savedSearches.map((search) => (
                        <Button
                          key={search.id}
                          variant="outline"
                          size="sm"
                          onClick={() => loadSavedSearch(search)}
                          className="justify-start w-full"
                        >
                          {search.query || 'Alle opdrachten'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'short' | 'long')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="short" className="gap-2">
            <Zap className="h-4 w-4" />
            Vandaag/morgen
            {shortAssignmentCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {shortAssignmentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="long" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Vaste contracten
            {longAssignmentCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {longAssignmentCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Short Assignments Tab */}
        <TabsContent value="short" className="space-y-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-20 bg-muted rounded" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20" />
                        <div className="h-8 bg-muted rounded w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredShortAssignments.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                {shortAssignmentCount} korte opdracht{shortAssignmentCount !== 1 ? 'en' : ''} gevonden
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {filteredShortAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick(assignment)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Zap}
              title="Geen korte opdrachten gevonden"
              description="Probeer je filters aan te passen of kom later terug."
            />
          )}
        </TabsContent>

        {/* Long Assignments Tab */}
        <TabsContent value="long" className="space-y-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-20 bg-muted rounded" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20" />
                        <div className="h-8 bg-muted rounded w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLongAssignments.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                {longAssignmentCount} vast contract{longAssignmentCount !== 1 ? 'en' : ''} gevonden
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {filteredLongAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick(assignment)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="Geen vaste contracten gevonden"
              description="Probeer je filters aan te passen of kom later terug."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default TwoTabFeed;
