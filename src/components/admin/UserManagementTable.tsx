import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  Ban, 
  Eye, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  user_type: 'professional' | 'employer' | 'admin';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  location?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_badges: string[];
  created_at: string;
  last_active_at?: string;
  assignments_count?: number;
  contracts_count?: number;
  rating?: number;
}

interface UserFilters {
  search: string;
  type: 'all' | 'professional' | 'employer' | 'admin';
  status: 'all' | 'active' | 'inactive' | 'blocked';
  verification: 'all' | 'verified' | 'unverified';
  sortBy: 'created_at' | 'last_active' | 'name' | 'assignments';
  sortOrder: 'asc' | 'desc';
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    type: 'all',
    status: 'all',
    verification: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          assignments:assignments(count),
          contracts:contracts(count),
          reviews:reviews(rating)
        `);

      // Apply filters
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      if (filters.type !== 'all') {
        query = query.eq('user_type', filters.type);
      }

      if (filters.status !== 'all') {
        if (filters.status === 'active') {
          query = query.eq('is_active', true);
        } else if (filters.status === 'inactive') {
          query = query.eq('is_active', false);
        } else if (filters.status === 'blocked') {
          query = query.eq('is_blocked', true);
        }
      }

      if (filters.verification !== 'all') {
        query = query.eq('is_verified', filters.verification === 'verified');
      }

      // Apply sorting
      const { data, error } = await query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      if (error) throw error;

      // Transform data
      const transformedUsers: User[] = (data || []).map(user => ({
        ...user,
        assignments_count: user.assignments?.[0]?.count || 0,
        contracts_count: user.contracts?.[0]?.count || 0,
        rating: user.reviews?.length > 0 
          ? user.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / user.reviews.length 
          : undefined
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: true, is_active: false })
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: false, is_active: true })
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'verify' | 'block' | 'unblock') => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading('bulk');
      
      const updates: any = {};
      if (action === 'verify') updates.is_verified = true;
      if (action === 'block') updates.is_blocked = true;
      if (action === 'unblock') updates.is_blocked = false;

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .in('id', selectedUsers);

      if (error) throw error;
      
      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const exportUsers = async () => {
    try {
      const csv = [
        ['Email', 'Type', 'Naam', 'Bedrijf', 'Status', 'Verificatie', 'Aangemaakt', 'Laatst actief', 'Opdrachten', 'Contracten', 'Rating'].join(','),
        ...users.map(user => [
          user.email,
          user.user_type,
          `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          user.company_name || '',
          user.is_active ? 'Actief' : 'Inactief',
          user.is_verified ? 'Geverifieerd' : 'Niet geverifieerd',
          new Date(user.created_at).toLocaleDateString('nl-NL'),
          user.last_active_at ? new Date(user.last_active_at).toLocaleDateString('nl-NL') : 'Nooit',
          user.assignments_count || 0,
          user.contracts_count || 0,
          user.rating?.toFixed(1) || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.is_blocked) {
      return <Badge className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" />Geblokkeerd</Badge>;
    }
    if (!user.is_active) {
      return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Inactief</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Actief</Badge>;
  };

  const filteredCount = users.length;
  const selectedCount = selectedUsers.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gebruikersbeheer</h2>
          <p className="text-muted-foreground">
            {filteredCount} gebruiker{filteredCount !== 1 ? 's' : ''}
            {selectedCount > 0 && ` (${selectedCount} geselecteerd)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('verify')}
                disabled={actionLoading === 'bulk'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Verifieer ({selectedCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('block')}
                disabled={actionLoading === 'bulk'}
                className="text-red-600 hover:text-red-700"
              >
                <Ban className="h-4 w-4 mr-2" />
                Blokkeer ({selectedCount})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Exporteer CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op email, naam of bedrijf..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="justify-between"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  <SelectItem value="professional">Professionals</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="active">Actief</SelectItem>
                  <SelectItem value="inactive">Inactief</SelectItem>
                  <SelectItem value="blocked">Geblokkeerd</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.verification} onValueChange={(value: any) => setFilters(prev => ({ ...prev, verification: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Verificatie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="verified">Geverifieerd</SelectItem>
                  <SelectItem value="unverified">Niet geverifieerd</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sorteren" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Nieuwste eerst</SelectItem>
                  <SelectItem value="created_at-asc">Oudste eerst</SelectItem>
                  <SelectItem value="last_active-desc">Laatst actief</SelectItem>
                  <SelectItem value="name-asc">Naam A-Z</SelectItem>
                  <SelectItem value="assignments-desc">Meeste opdrachten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <Checkbox
                      checked={selectedCount === filteredCount && filteredCount > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Gebruiker</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Verificatie</th>
                  <th className="text-left p-4 font-medium">Geregistreerd</th>
                  <th className="text-left p-4 font-medium">Activiteit</th>
                  <th className="text-left p-4 font-medium">Statistieken</th>
                  <th className="text-left p-4 font-medium">Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.user_type === 'professional' 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Geen naam'
                            : user.company_name || 'Geen bedrijf'
                          }
                        </div>
                        {user.phone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        {user.location && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.user_type === 'professional' ? 'default' : 'secondary'}>
                        {user.user_type === 'professional' ? 'Professional' : 
                         user.user_type === 'admin' ? 'Admin' : 'Employer'}
                      </Badge>
                    </td>
                    <td className="p-4">{getStatusBadge(user)}</td>
                    <td className="p-4">
                      {user.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Geverifieerd
                        </Badge>
                      ) : (
                        <Badge variant="outline">Niet geverifieerd</Badge>
                      )}
                      {user.verification_badges && user.verification_badges.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">
                            {user.verification_badges.length} badges
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(user.created_at).toLocaleDateString('nl-NL')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {user.last_active_at ? (
                          <>
                            <div>{formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true, locale: nl })}</div>
                            <div className="text-xs text-muted-foreground">
                              Laatst gezien
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Nooit</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span>{user.assignments_count || 0} opdrachten</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{user.contracts_count || 0} contracten</span>
                        </div>
                        {user.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{user.rating.toFixed(1)} rating</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Gebruiker Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="text-sm">{selectedUser.user_type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Naam</label>
                                    <p className="text-sm">
                                      {selectedUser.first_name} {selectedUser.last_name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Bedrijf</label>
                                    <p className="text-sm">{selectedUser.company_name || '-'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Telefoon</label>
                                    <p className="text-sm">{selectedUser.phone || '-'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Locatie</label>
                                    <p className="text-sm">{selectedUser.location || '-'}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                  {!selectedUser.is_verified && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleVerifyUser(selectedUser.id)}
                                      disabled={actionLoading === selectedUser.id}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Verifieer
                                    </Button>
                                  )}
                                  {selectedUser.is_blocked ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUnblockUser(selectedUser.id)}
                                      disabled={actionLoading === selectedUser.id}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Deblokkeer
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleBlockUser(selectedUser.id)}
                                      disabled={actionLoading === selectedUser.id}
                                    >
                                      <Ban className="h-4 w-4 mr-2" />
                                      Blokkeer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Geen gebruikers gevonden</h3>
              <p className="text-muted-foreground">Probeer je filters aan te passen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
