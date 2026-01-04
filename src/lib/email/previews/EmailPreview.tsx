import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Eye, 
  Download, 
  Copy, 
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Star,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Code,
  FileDown
} from 'lucide-react';
import { emailTemplates, templateCategories, EmailPreview as EmailPreviewComponent } from './templates';

interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'number';
  defaultValue: string;
}

const templateVariables: Record<string, TemplateVariable[]> = {
  welcome: [
    { key: 'user_name', label: 'Naam gebruiker', type: 'text', defaultValue: 'Jan Jansen' },
    { key: 'user_type', label: 'Type gebruiker', type: 'text', defaultValue: 'professional' },
    { key: 'verification_link', label: 'Verificatie link', type: 'text', defaultValue: 'https://djobba.nl/verify/abc123' }
  ],
  email_verification: [
    { key: 'user_name', label: 'Naam gebruiker', type: 'text', defaultValue: 'Jan Jansen' },
    { key: 'verification_link', label: 'Verificatie link', type: 'text', defaultValue: 'https://djobba.nl/verify/abc123' }
  ],
  new_application: [
    { key: 'employer_name', label: 'Naam employer', type: 'text', defaultValue: 'Tech Corp BV' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'professional_skills', label: 'Skills professional', type: 'text', defaultValue: 'React, TypeScript, Node.js' },
    { key: 'application_link', label: 'Sollicitatie link', type: 'text', defaultValue: 'https://djobba.nl/applications/123' }
  ],
  interview_invitation: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'employer_name', label: 'Naam employer', type: 'text', defaultValue: 'Tech Corp BV' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'interview_date', label: 'Gespreksdatum', type: 'text', defaultValue: 'Vrijdag 15 januari 2024 om 14:00' },
    { key: 'interview_location', label: 'Locatie', type: 'text', defaultValue: 'Tech Corp kantoor, Amsterdam' },
    { key: 'confirmation_link', label: 'Bevestigingslink', type: 'text', defaultValue: 'https://djobba.nl/interview/confirm/456' }
  ],
  contract_offer: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'company_name', label: 'Bedrijfsnaam', type: 'text', defaultValue: 'Tech Corp BV' },
    { key: 'start_date', label: 'Startdatum', type: 'text', defaultValue: '1 februari 2024' },
    { key: 'salary', label: 'Salaris', type: 'text', defaultValue: '€5.500 per maand' },
    { key: 'contract_link', label: 'Contract link', type: 'text', defaultValue: 'https://djobba.nl/contract/789' }
  ],
  factoring_request: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'amount', label: 'Bedrag', type: 'text', defaultValue: '2.500' },
    { key: 'fee_percentage', label: 'Fee percentage', type: 'text', defaultValue: '3' },
    { key: 'fee_amount', label: 'Fee bedrag', type: 'text', defaultValue: '75' },
    { key: 'payout_amount', label: 'Uitbetaling', type: 'text', defaultValue: '2.425' },
    { key: 'dashboard_link', label: 'Dashboard link', type: 'text', defaultValue: 'https://djobba.nl/dashboard' }
  ],
  payment_received: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'amount', label: 'Bedrag', type: 'text', defaultValue: '2.500' },
    { key: 'payment_date', label: 'Betaaldatum', type: 'text', defaultValue: '10 januari 2024' },
    { key: 'transaction_id', label: 'Transactie ID', type: 'text', defaultValue: 'TXN-2024-01-10-001' }
  ],
  review_request: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'employer_name', label: 'Naam employer', type: 'text', defaultValue: 'Tech Corp BV' },
    { key: 'assignment_title', label: 'Titel opdracht', type: 'text', defaultValue: 'Senior React Developer' },
    { key: 'review_link', label: 'Review link', type: 'text', defaultValue: 'https://djobba.nl/review/123' },
    { key: 'completion_date', label: 'Afrondingsdatum', type: 'text', defaultValue: '8 januari 2024' }
  ],
  monthly_performance: [
    { key: 'professional_name', label: 'Naam professional', type: 'text', defaultValue: 'Pieter de Vries' },
    { key: 'month', label: 'Maand', type: 'text', defaultValue: 'januari 2024' },
    { key: 'completed_assignments', label: 'Voltooide opdrachten', type: 'number', defaultValue: '3' },
    { key: 'total_earned', label: 'Totaal verdiend', type: 'text', defaultValue: '7.500' },
    { key: 'average_rating', label: 'Gemiddelde rating', type: 'text', defaultValue: '4.8' },
    { key: 'top_skill', label: 'Top skill', type: 'text', defaultValue: 'React' },
    { key: 'dashboard_link', label: 'Dashboard link', type: 'text', defaultValue: 'https://djobba.nl/dashboard' }
  ],
  admin_alert: [
    { key: 'admin_name', label: 'Naam admin', type: 'text', defaultValue: 'Admin User' },
    { key: 'alert_type', label: 'Alert type', type: 'text', defaultValue: 'Suspicious Activity' },
    { key: 'user_email', label: 'Gebruiker email', type: 'email', defaultValue: 'suspicious@example.com' },
    { key: 'details', label: 'Details', type: 'text', defaultValue: 'Multiple failed login attempts detected' },
    { key: 'action_link', label: 'Actie link', type: 'text', defaultValue: 'https://djobba.nl/admin/users/123' }
  ]
};

export default function EmailPreview() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const template = emailTemplates.find(t => t.id === selectedTemplate);
  const category = template ? templateCategories[template.category] : null;

  // Initialize variables with defaults
  React.useEffect(() => {
    if (selectedTemplate && templateVariables[selectedTemplate]) {
      const defaults: Record<string, string> = {};
      templateVariables[selectedTemplate].forEach(v => {
        defaults[v.key] = v.defaultValue;
      });
      setVariables(defaults);
    }
  }, [selectedTemplate]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Voer een test email adres in');
      return;
    }

    setSending(true);
    try {
      // Here you would call the actual email sending function
      console.log('Sending test email to:', testEmail);
      console.log('Template:', selectedTemplate);
      console.log('Variables:', variables);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Test email verzonden!');
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Fout bij verzenden van test email');
    } finally {
      setSending(false);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.key] || '';
    
    switch (variable.type) {
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
            placeholder={variable.defaultValue}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
            placeholder={variable.defaultValue}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
            placeholder={variable.defaultValue}
          />
        );
    }
  };

  if (!template) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Beheer en preview email templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCode(!showCode)}>
            <Code className="h-4 w-4 mr-2" />
            {showCode ? 'Verberg' : 'Toon'} Code
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection & Variables */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Selecteer Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templateCategories).map(([key, cat]) => (
                    <div key={key}>
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        {cat.label}
                      </div>
                      {emailTemplates
                        .filter(t => t.category === key)
                        .map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>

              {category && (
                <Badge className={category.color}>
                  {category.icon && <category.icon className="h-3 w-3 mr-1" />}
                  {category.label}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Template Variabelen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templateVariables[selectedTemplate]?.map(variable => (
                <div key={variable.key} className="space-y-2">
                  <label className="text-sm font-medium">
                    {variable.label}
                    <span className="text-muted-foreground ml-1">
                      ({{variable.key}})
                    </span>
                  </label>
                  {renderVariableInput(variable)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle>Verstuur Test Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button 
                className="w-full" 
                onClick={handleSendTestEmail}
                disabled={sending || !testEmail}
              >
                {sending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Verstuur Test Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview: {template.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Tabs value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                    <TabsList>
                      <TabsTrigger value="desktop" className="flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        Desktop
                      </TabsTrigger>
                      <TabsTrigger value="tablet" className="flex items-center gap-1">
                        <Tablet className="h-4 w-4" />
                        Tablet
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4" />
                        Mobile
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieer HTML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white mx-auto" style={{ width: getPreviewWidth() }}>
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Onderwerp: {template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match)}
                    </span>
                    <Badge variant="outline">{previewMode}</Badge>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    <EmailPreviewComponent templateId={selectedTemplate} variables={variables} />
                  </div>
                </div>
              </div>

              {showCode && (
                <div className="mt-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{template.htmlContent}</code>
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
