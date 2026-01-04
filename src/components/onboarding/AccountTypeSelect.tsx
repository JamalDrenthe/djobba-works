import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MicrocopyText } from '@/lib/microcopy';
import { 
  User, 
  Building2, 
  ArrowRight, 
  Check, 
  Briefcase,
  Zap
} from 'lucide-react';

export type AccountType = 'professional' | 'employer' | 'both';
export type WorkPreference = 'short' | 'permanent' | 'both';

interface AccountTypeSelectProps {
  onSelect: (type: AccountType, preferences?: WorkPreference[]) => void;
  defaultType?: AccountType;
  showPreferences?: boolean;
  className?: string;
}

export function AccountTypeSelect({ 
  onSelect, 
  defaultType,
  showPreferences = true,
  className = ''
}: AccountTypeSelectProps) {
  const [selectedType, setSelectedType] = useState<AccountType>(defaultType || 'professional');
  const [selectedPreferences, setSelectedPreferences] = useState<WorkPreference[]>(['short', 'permanent']);
  const [step, setStep] = useState(1);

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type);
    if (type === 'both' || !showPreferences) {
      onSelect(type, type === 'both' ? ['short', 'permanent'] : undefined);
    } else {
      setStep(2);
    }
  };

  const handlePreferenceSelect = (preference: WorkPreference) => {
    if (preference === 'both') {
      setSelectedPreferences(['short', 'permanent']);
    } else {
      setSelectedPreferences([preference]);
    }
  };

  const handleContinue = () => {
    onSelect(selectedType, selectedPreferences);
  };

  const accountTypes = [
    {
      type: 'professional' as AccountType,
      title: 'Professional',
      subtitle: 'Ik zoek werk',
      description: 'Vind korte opdrachten of vaste contracten',
      icon: User,
      color: 'border-primary hover:border-primary/60 bg-primary/5',
    },
    {
      type: 'employer' as AccountType,
      title: 'Opdrachtgever',
      subtitle: 'Ik zoek talent',
      description: 'Vind professionals voor flexibele of vaste posities',
      icon: Building2,
      color: 'border-secondary hover:border-secondary/60 bg-secondary/5',
    },
    {
      type: 'both' as AccountType,
      title: 'Beide',
      subtitle: 'Zoek werk & plaats opdrachten',
      description: 'Maximale flexibiliteit voor freelancers en agencies',
      icon: Briefcase,
      color: 'border-accent hover:border-accent/60 bg-accent/5',
    },
  ];

  const workPreferences = [
    {
      type: 'short' as WorkPreference,
      title: 'Ik wil flexibel werken',
      subtitle: 'Korte opdrachten',
      description: 'Per dag/week werken, snel betaald',
      icon: Zap,
      color: 'border-primary hover:border-primary/60 bg-primary/5',
    },
    {
      type: 'permanent' as WorkPreference,
      title: 'Ik zoek een vast contract',
      subtitle: '7+ maanden',
      description: 'Vast salaris, secundaire voorwaarden',
      icon: Building2,
      color: 'border-secondary hover:border-secondary/60 bg-secondary/5',
    },
    {
      type: 'both' as WorkPreference,
      title: 'Beide',
      subtitle: 'Open voor alles',
      description: 'Flexibel en vast allebei mogelijk',
      icon: Briefcase,
      color: 'border-accent hover:border-accent/60 bg-accent/5',
    },
  ];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Indicator */}
      {showPreferences && (
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Account Type Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              <MicrocopyText key="ui.account_type.title" />
            </h2>
            <p className="text-muted-foreground">
              Kies het type account dat het beste bij je past
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {accountTypes.map((accountType) => {
              const Icon = accountType.icon;
              const isSelected = selectedType === accountType.type;

              return (
                <Card
                  key={accountType.type}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  } ${accountType.color}`}
                  onClick={() => handleTypeSelect(accountType.type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{accountType.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{accountType.subtitle}</p>
                    <p className="text-sm">{accountType.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Je kunt dit later altijd aanpassen in je profiel
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Work Preference Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Wat zoek je precies?
            </h2>
            <p className="text-muted-foreground">
              Selecteer je voorkeuren voor werk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {workPreferences.map((preference) => {
              const Icon = preference.icon;
              const isSelected = selectedPreferences.includes(preference.type);

              return (
                <Card
                  key={preference.type}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  } ${preference.color}`}
                  onClick={() => handlePreferenceSelect(preference.type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{preference.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{preference.subtitle}</p>
                    <p className="text-sm">{preference.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              Terug
            </Button>
            
            <Button onClick={handleContinue}>
              Doorgaan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for quick selection
export function AccountTypeSelectCompact({ 
  onSelect,
  className = ''
}: { 
  onSelect: (type: AccountType) => void;
  className?: string;
}) {
  const [selectedType, setSelectedType] = useState<AccountType>('professional');

  const handleSelect = (type: AccountType) => {
    setSelectedType(type);
    onSelect(type);
  };

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      <Button
        variant={selectedType === 'professional' ? 'default' : 'outline'}
        onClick={() => handleSelect('professional')}
        className="h-auto p-4 flex flex-col gap-2"
      >
        <User className="h-6 w-6" />
        <span className="text-sm">Professional</span>
      </Button>
      
      <Button
        variant={selectedType === 'employer' ? 'default' : 'outline'}
        onClick={() => handleSelect('employer')}
        className="h-auto p-4 flex flex-col gap-2"
      >
        <Building2 className="h-6 w-6" />
        <span className="text-sm">Opdrachtgever</span>
      </Button>
      
      <Button
        variant={selectedType === 'both' ? 'default' : 'outline'}
        onClick={() => handleSelect('both')}
        className="h-auto p-4 flex flex-col gap-2"
      >
        <Briefcase className="h-6 w-6" />
        <span className="text-sm">Beide</span>
      </Button>
    </div>
  );
}

export default AccountTypeSelect;
