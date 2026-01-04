import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Briefcase
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

  // Filter assignments based on search and filters
  const filteredShortAssignments = useMemo(() => {
    return shortAssignments.filter(assignment => {
      const matchesSearch = !searchQuery || 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || assignment.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || assignment.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [shortAssignments, searchQuery, selectedCategory, selectedLocation]);

  const filteredLongAssignments = useMemo(() => {
    return longAssignments.filter(assignment => {
      const matchesSearch = !searchQuery || 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || assignment.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || assignment.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [longAssignments, searchQuery, selectedCategory, selectedLocation]);

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
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek opdrachten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Locatie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle locaties</SelectItem>
                {allLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
              >
                Filters wissen
              </Button>
            )}
          </div>
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
                  <ShortAssignmentCard
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
                  <LongAssignmentCard
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

// Short Assignment Card Component
function ShortAssignmentCard({ 
  assignment, 
  onClick 
}: { 
  assignment: AssignmentWithDetails;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {assignment.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {assignment.company_name || assignment.employer_name}
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Kort
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm">
            {assignment.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {assignment.location}
              </div>
            )}
            {assignment.duration_days && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {assignment.duration_days} dagen
              </div>
            )}
            {assignment.hourly_rate_cents && (
              <div className="flex items-center gap-1 text-primary font-medium">
                <Euro className="h-4 w-4" />
                {assignment.hourly_rate_cents / 100}/uur
              </div>
            )}
            {assignment.remote_allowed && (
              <Badge variant="secondary">Remote</Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {assignment.application_count} sollicitant{assignment.application_count !== 1 ? 'en' : ''}
            </div>
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}>
              Bekijk opdracht
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Long Assignment Card Component
function LongAssignmentCard({ 
  assignment, 
  onClick 
}: { 
  assignment: AssignmentWithDetails;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {assignment.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {assignment.company_name || assignment.employer_name}
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Briefcase className="h-3 w-3" />
              Vast
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm">
            {assignment.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {assignment.location}
              </div>
            )}
            {assignment.salary_cents && (
              <div className="flex items-center gap-1 text-primary font-medium">
                <Euro className="h-4 w-4" />
                {new Intl.NumberFormat('nl-NL').format(assignment.salary_cents / 100)}/jaar
              </div>
            )}
            {assignment.application_deadline && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Deadline: {new Date(assignment.application_deadline).toLocaleDateString('nl-NL')}
              </div>
            )}
            {assignment.remote_allowed && (
              <Badge variant="secondary">Remote</Badge>
            )}
          </div>

          {/* Benefits */}
          {assignment.benefits && assignment.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {assignment.benefits.slice(0, 3).map((benefit: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
              {assignment.benefits.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{assignment.benefits.length - 3} meer
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {assignment.application_count} sollicitant{assignment.application_count !== 1 ? 'en' : ''}
            </div>
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}>
              Bekijk opdracht
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
