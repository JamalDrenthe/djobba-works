import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VerificationBadges } from "@/components/VerificationBadges";
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  Briefcase,
  Globe,
  Upload,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { UserProfile, VerificationBadge } from '@/types/database';

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    bio: '',
    hourly_rate_cents: 0,
    company_name: '',
    vat_number: '',
    chamber_of_commerce: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchBadges();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = 'current-user-id'; // Replace with actual auth
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || '',
          bio: data.bio || '',
          hourly_rate_cents: data.hourly_rate_cents || 0,
          company_name: data.company_name || '',
          vat_number: data.vat_number || '',
          chamber_of_commerce: data.chamber_of_commerce || ''
        });
        setSkills(data.skills || []);
        setCvUrl(data.cv_url || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBadges = async () => {
    try {
      const userId = 'current-user-id';
      
      const { data, error } = await supabase
        .from('verification_badges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'address',
      'city',
      'postal_code',
      'country',
      'bio',
      'hourly_rate_cents'
    ];
    
    const completed = fields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value !== '' && value !== null && value !== undefined;
    }).length;
    
    const hasSkills = skills.length > 0;
    const hasCv = cvUrl !== null;
    const hasBadges = badges.length > 0;
    
    return Math.round(((completed + (hasSkills ? 1 : 0) + (hasCv ? 1 : 0) + (hasBadges ? 1 : 0)) / 13) * 100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const userId = 'current-user-id';
      
      const updateData = {
        ...formData,
        skills,
        cv_url: cvUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      
      setSaveMessage({ type: 'success', text: 'Profiel succesvol opgeslagen!' });
      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: 'Er is een fout opgetreden bij het opslaan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      const userId = 'current-user-id';
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cv.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      setCvUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const completionPercentage = calculateCompletion();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 bg-muted/30">
          <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground">Profiel Bewerken</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="visibility" className="text-sm">Profiel zichtbaar</Label>
                    <Switch
                      id="visibility"
                      checked={profileVisibility}
                      onCheckedChange={setProfileVisibility}
                    />
                    {profileVisibility ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profiel compleetheid</span>
                  <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Een compleet profiel verhoogt je kans op opdrachten
                </p>
              </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <Alert className={`mb-6 ${saveMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {saveMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'basic', label: 'Basisinformatie', icon: User },
                        { id: 'skills', label: 'Vaardigheden', icon: Briefcase },
                        { id: 'documents', label: 'Documenten', icon: FileText },
                        { id: 'verification', label: 'Verificatie', icon: CheckCircle2 }
                      ].map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 ${
                              activeSection === section.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {section.label}
                          </button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>

                {/* Verification Status */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Verificatie Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VerificationBadges 
                      userId="current-user-id"
                      size="sm"
                      showLabels={true}
                      interactive={false}
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                      Meer badges verhogen je zichtbaarheid en betrouwbaarheid
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Basic Information */}
                {activeSection === 'basic' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basisinformatie
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Voornaam</Label>
                          <Input
                            id="firstName"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Achternaam</Label>
                          <Input
                            id="lastName"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefoonnummer</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Geboortedatum</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Vertel iets over jezelf..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="address">Adres</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Stad</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postcode</Label>
                          <Input
                            id="postalCode"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Land</Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="hourlyRate">Uurtarief (€)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={formData.hourly_rate_cents / 100}
                            onChange={(e) => setFormData({ ...formData, hourly_rate_cents: Math.floor(parseFloat(e.target.value) * 100) })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills */}
                {activeSection === 'skills' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Vaardigheden
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Voeg vaardigheden toe</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Bijv: JavaScript, Projectmanagement..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                          <Button onClick={addSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Jouw vaardigheden</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-red-500"
                                aria-label={`Vaardigheid ${skill} verwijderen`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {skills.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Nog geen vaardigheden toegevoegd
                            </p>
                          )}
                        </div>
                      </div>

                      <Alert>
                        <Briefcase className="h-4 w-4" />
                        <AlertDescription>
                          Voeg relevante vaardigheden toe die passen bij de opdrachten die je zoekt.
                          Dit helpt opdrachtgevers om je beter te vinden.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                {activeSection === 'documents' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documenten
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>CV Upload</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCvFile(file);
                                handleFileUpload(file);
                              }
                            }}
                            className="hidden"
                            id="cv-upload"
                          />
                          <label
                            htmlFor="cv-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <div className="text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Klik om CV te uploaden (PDF, DOC, DOCX)
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {cvUrl && (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">CV</p>
                              <p className="text-sm text-muted-foreground">
                                Geüpload op {new Date().toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a 
                                href={cvUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="CV downloaden"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCvUrl(null);
                                setCvFile(null);
                              }}
                              aria-label="CV verwijderen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          Een actueel CV verhoogt je kans op opdrachten aanzienlijk.
                          Zorg ervoor dat je relevante ervaring en vaardigheden benadrukt.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Verification */}
                {activeSection === 'verification' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Verificatie Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <VerificationBadges 
                        userId="current-user-id"
                        size="lg"
                        showLabels={true}
                        interactive={true}
                      />

                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Verificatie badges bouwen vertrouwen op bij opdrachtgevers.
                          Sommige opdrachten vereisen een minimum aantal badges.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Beschikbare verificaties:</h4>
                        <div className="grid gap-3">
                          {[
                            { type: 'email_verified', name: 'E-mailadres', description: 'Verifieer je e-mailadres' },
                            { type: 'phone_verified', name: 'Telefoonnummer', description: 'Verifieer je telefoonnummer' },
                            { type: 'id_verified', name: 'ID-Verificatie', description: 'Upload je identiteitsbewijs' },
                            { type: 'address_verified', name: 'Adresverificatie', description: 'Verifieer je woonadres' },
                            { type: 'company_verified', name: 'Bedrijfsverificatie', description: 'Verifieer je bedrijf' }
                          ].map((badge) => {
                            const hasBadge = badges.some(b => b.badge_type === badge.type);
                            return (
                              <div key={badge.type} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h5 className="font-medium">{badge.name}</h5>
                                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                                </div>
                                {hasBadge ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Geverifieerd
                                  </Badge>
                                ) : (
                                  <Button variant="outline" size="sm">
                                    Verifiëren
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
