import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  MapPin
} from 'lucide-react';

// Email template interfaces
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'registration' | 'assignment' | 'payment' | 'review' | 'system';
  htmlContent: string;
  variables: string[];
  preview?: string;
}

// Template data with MJML-like structure
const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welkomst Email',
    subject: 'Welkom bij DJOBBA! 🎉',
    category: 'registration',
    variables: ['user_name', 'user_type', 'verification_link'],
    htmlContent: `
      <mjml>
        <mj-head>
          <mj-attributes>
            <mj-all font-family="Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-image src="https://djobba.nl/logo.png" width="150px" />
              <mj-divider border-color="#e0e0e0" border-width="1px" />
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                Welkom bij DJOBBA, {{user_name}}! 👋
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Bedankt voor je registratie als {{user_type}}. We zijn excited om je te helpen bij het vinden van de perfecte opdracht of professional.
              </mj-text>
              <mj-button background-color="#3b82f6" color="white" href="{{verification_link}}">
                Verifieer je email adres
              </mj-button>
              <mj-text font-size="14px" color="#999999" padding="20px 0">
                Deze link verloopt over 24 uur.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Welkom bij DJOBBA! Bedankt voor je registratie...'
  },
  {
    id: 'email_verification',
    name: 'Email Verificatie',
    subject: 'Verifieer je DJOBBA account',
    category: 'registration',
    variables: ['user_name', 'verification_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                Verifieer je email adres
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Hoi {{user_name}},<br/><br/>
                Klik op de onderstaande knop om je email adres te verifiëren en je account te activeren.
              </mj-text>
              <mj-button background-color="#3b82f6" color="white" href="{{verification_link}}">
                Verifieer Email
              </mj-button>
              <mj-text font-size="14px" color="#999999" padding="20px 0">
                Of kopieer en plak deze link in je browser:<br/>
                {{verification_link}}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Verifieer je email adres om je account te activeren'
  },
  {
    id: 'new_application',
    name: 'Nieuwe Sollicitatie (Employer)',
    subject: 'Nieuwe sollicitatie op je opdracht: {{assignment_title}}',
    category: 'assignment',
    variables: ['employer_name', 'assignment_title', 'professional_name', 'professional_skills', 'application_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <Briefcase className="inline mr-2" />
                Nieuwe Sollicitatie!
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{employer_name}},<br/><br/>
                Goed nieuws! {{professional_name}} heeft gesolliciteerd op je opdracht:
              </mj-text>
              <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                <mj-text font-size="18px" font-weight="bold" color="#333333">
                  {{assignment_title}}
                </mj-text>
                <mj-text font-size="14px" color="#666666" padding="10px 0">
                  <strong>Skills:</strong> {{professional_skills}}
                </mj-text>
              </mj-box>
              <mj-button background-color="#3b82f6" color="white" href="{{application_link}}">
                Bekijk Sollicitatie
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Nieuwe sollicitatie op je opdracht'
  },
  {
    id: 'interview_invitation',
    name: 'Uitnodiging voor Gesprek',
    subject: 'Uitnodiging voor gesprek: {{assignment_title}}',
    category: 'assignment',
    variables: ['professional_name', 'employer_name', 'assignment_title', 'interview_date', 'interview_location', 'confirmation_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <Calendar className="inline mr-2" />
                Uitnodiging voor Gesprek!
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                {{employer_name}} heeft je uitgenodigd voor een gesprek voor de opdracht:
              </mj-text>
              <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                <mj-text font-size="18px" font-weight="bold" color="#333333">
                  {{assignment_title}}
                </mj-text>
                <mj-text font-size="14px" color="#666666" padding="10px 0">
                  <Calendar className="inline mr-1" />
                  <strong>Datum:</strong> {{interview_date}}<br/>
                  <MapPin className="inline mr-1" />
                  <strong>Locatie:</strong> {{interview_location}}
                </mj-text>
              </mj-box>
              <mj-button background-color="#10b981" color="white" href="{{confirmation_link}}">
                Bevestig Aanwezigheid
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Uitnodiging voor gesprek'
  },
  {
    id: 'contract_offer',
    name: 'Contractaanbod',
    subject: 'Contractaanbod: {{assignment_title}}',
    category: 'assignment',
    variables: ['professional_name', 'assignment_title', 'company_name', 'start_date', 'salary', 'contract_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <FileText className="inline mr-2" />
                Contractaanbod!
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                Gefeliciteerd! {{company_name}} wil je graag contracteren voor:
              </mj-text>
              <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                <mj-text font-size="18px" font-weight="bold" color="#333333">
                  {{assignment_title}}
                </mj-text>
                <mj-text font-size="14px" color="#666666" padding="10px 0">
                  <Calendar className="inline mr-1" />
                  <strong>Startdatum:</strong> {{start_date}}<br/>
                  <DollarSign className="inline mr-1" />
                  <strong>Salaris:</strong> {{salary}}
                </mj-text>
              </mj-box>
              <mj-button background-color="#10b981" color="white" href="{{contract_link}}">
                Bekijk en Accepteer Contract
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Contractaanbod ontvangen'
  },
  {
    id: 'factoring_request',
    name: 'Factoring Verzoek',
    subject: 'Factoring verzoek ontvangen: €{{amount}}',
    category: 'payment',
    variables: ['professional_name', 'assignment_title', 'amount', 'fee_percentage', 'payout_amount', 'dashboard_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <CreditCard className="inline mr-2" />
                Factoring Verzoek Ontvangen
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                Je factoring verzoek is ontvangen voor:
              </mj-text>
              <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                <mj-text font-size="18px" font-weight="bold" color="#333333">
                  {{assignment_title}}
                </mj-text>
                <mj-text font-size="14px" color="#666666" padding="10px 0">
                  <DollarSign className="inline mr-1" />
                  <strong>Bedrag:</strong> €{{amount}}<br/>
                  <AlertCircle className="inline mr-1" />
                  <strong>Fee ({{fee_percentage}}%):</strong> €{{fee_amount}}<br/>
                  <CheckCircle2 className="inline mr-1" />
                  <strong>Uitbetaling:</strong> €{{payout_amount}}
                </mj-text>
              </mj-box>
              <mj-text font-size="14px" color="#666666">
                De uitbetaling wordt binnen 24-48 uur verwerkt.
              </mj-text>
              <mj-button background-color="#3b82f6" color="white" href="{{dashboard_link}}">
                Bekijk Status
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Factoring verzoek ontvangen'
  },
  {
    id: 'payment_received',
    name: 'Betaling Ontvangen',
    subject: 'Betaling ontvangen: €{{amount}}',
    category: 'payment',
    variables: ['professional_name', 'assignment_title', 'amount', 'payment_date', 'transaction_id'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <DollarSign className="inline mr-2" />
                Betaling Ontvangen!
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                Je betaling is succesvol ontvangen:
              </mj-text>
              <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                <mj-text font-size="18px" font-weight="bold" color="#333333">
                  {{assignment_title}}
                </mj-text>
                <mj-text font-size="14px" color="#666666" padding="10px 0">
                  <DollarSign className="inline mr-1" />
                  <strong>Bedrag:</strong> €{{amount}}<br/>
                  <Calendar className="inline mr-1" />
                  <strong>Datum:</strong> {{payment_date}}<br/>
                  <FileText className="inline mr-1" />
                  <strong>Transactie ID:</strong> {{transaction_id}}
                </mj-text>
              </mj-box>
              <mj-text font-size="14px" color="#10b981">
                <CheckCircle2 className="inline mr-1" />
                Het bedrag is bijgeschreven op je wallet.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Betaling succesvol ontvangen'
  },
  {
    id: 'review_request',
    name: 'Review Verzoek',
    subject: 'Deel je ervaring: {{assignment_title}}',
    category: 'review',
    variables: ['professional_name', 'employer_name', 'assignment_title', 'review_link', 'completion_date'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <Star className="inline mr-2" />
                Hoe was je ervaring?
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                Je opdracht "{{assignment_title}}" voor {{employer_name}} is afgerond op {{completion_date}}.
              </mj-text>
              <mj-text font-size="16px" color="#666666">
                Help de community door je ervaring te delen. Jouw feedback helpt anderen bij het maken van de beste keuze.
              </mj-text>
              <mj-button background-color="#f59e0b" color="white" href="{{review_link}}">
                Schrijf een Review
              </mj-button>
              <mj-text font-size="14px" color="#999999" padding="20px 0">
                Het duurt maar 2 minuten en is enorm waardevol!
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Deel je ervaring en schrijf een review'
  },
  {
    id: 'monthly_performance',
    name: 'Maandelijkse Performance Review',
    subject: 'Je {{month}} performance rapport',
    category: 'review',
    variables: ['professional_name', 'month', 'completed_assignments', 'total_earned', 'average_rating', 'top_skill'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#333333">
                <TrendingUp className="inline mr-2" />
                {{month}} Performance Rapport
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{professional_name}},<br/><br/>
                Bekijk je prestaties voor {{month}}:
              </mj-text>
              <mj-grid columns="2" width="100%">
                <mj-column>
                  <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                    <mj-text font-size="24px" font-weight="bold" color="#3b82f6" align="center">
                      {{completed_assignments}}
                    </mj-text>
                    <mj-text font-size="14px" color="#666666" align="center">
                      Opdrachten voltooid
                    </mj-text>
                  </mj-box>
                </mj-column>
                <mj-column>
                  <mj-box background-color="#f8f8f8" padding="20px" border-radius="8px">
                    <mj-text font-size="24px" font-weight="bold" color="#10b981" align="center">
                      €{{total_earned}}
                    </mj-text>
                    <mj-text font-size="14px" color="#666666" align="center">
                      Totaal verdiend
                    </mj-text>
                  </mj-box>
                </mj-column>
              </mj-grid>
              <mj-box background-color="#fef3c7" padding="20px" border-radius="8px" margin="20px 0">
                <mj-text font-size="16px" color="#92400e" align="center">
                  <Star className="inline mr-1" />
                  Gemiddelde rating: {{average_rating}}/5 ⭐
                </mj-text>
                <mj-text font-size="14px" color="#92400e" align="center" padding="10px 0">
                  Top vaardigheid: {{top_skill}}
                </mj-text>
              </mj-box>
              <mj-button background-color="#3b82f6" color="white" href="{{dashboard_link}}">
                Bekijk Details
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Bekijk je maandelijkse performance rapport'
  },
  {
    id: 'admin_alert',
    name: 'Admin Alert',
    subject: 'Alert: {{alert_type}}',
    category: 'system',
    variables: ['admin_name', 'alert_type', 'user_email', 'details', 'action_link'],
    htmlContent: `
      <mjml>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#dc2626">
                <AlertCircle className="inline mr-2" />
                Admin Alert: {{alert_type}}
              </mj-text>
              <mj-text font-size="16px" color="#666666" padding="20px 0">
                Beste {{admin_name}},<br/><br/>
                Er is een {{alert_type}} gedetecteerd:
              </mj-text>
              <mj-box background-color="#fef2f2" padding="20px" border-radius="8px" border="1px solid #fecaca">
                <mj-text font-size="14px" color="#991b1b">
                  <strong>Gebruiker:</strong> {{user_email}}<br/>
                  <strong>Details:</strong> {{details}}
                </mj-text>
              </mj-box>
              <mj-button background-color="#dc2626" color="white" href="{{action_link}}">
                Neem Actie
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `,
    preview: 'Admin alert - onmiddellijke actie vereist'
  }
];

// Template categories with icons
const templateCategories = {
  registration: { label: 'Registratie & Verificatie', icon: User, color: 'bg-blue-100 text-blue-800' },
  assignment: { label: 'Opdracht & Sollicitatie', icon: Briefcase, color: 'bg-green-100 text-green-800' },
  payment: { label: 'Betalingen & Factoring', icon: CreditCard, color: 'bg-purple-100 text-purple-800' },
  review: { label: 'Reviews & Feedback', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
  system: { label: 'Systeem & Admin', icon: Shield, color: 'bg-red-100 text-red-800' }
};

// Email sending function
export const sendEmail = async (templateId: string, to: string, variables: Record<string, string>) => {
  try {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    // Replace variables in subject and content
    let subject = template.subject;
    let htmlContent = template.htmlContent;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Send via Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        htmlContent,
        templateId
      }
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Preview component for email templates
export const EmailPreview = ({ templateId, variables }: { templateId: string; variables: Record<string, string> }) => {
  const template = emailTemplates.find(t => t.id === templateId);
  if (!template) return null;

  let content = template.htmlContent;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <span className="text-sm font-medium">Preview: {template.name}</span>
      </div>
      <div className="bg-white p-4">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

// Export all templates and utilities
export { emailTemplates, templateCategories };
export default emailTemplates;
