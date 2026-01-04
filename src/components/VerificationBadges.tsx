import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase/client';
import { VerificationBadge } from '@/types/database';
import { 
  Mail, 
  Phone, 
  IdCard, 
  MapPin, 
  Building, 
  Check, 
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';

interface VerificationBadgesProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

const badgeConfig = {
  email_verified: {
    icon: Mail,
    label: 'E-mail geverifieerd',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'E-mailadres is geverifieerd',
  },
  phone_verified: {
    icon: Phone,
    label: 'Telefoon geverifieerd',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Telefoonnummer is geverifieerd',
  },
  id_verified: {
    icon: IdCard,
    label: 'ID geverifieerd',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Identiteitsbewijs is geverifieerd',
  },
  address_verified: {
    icon: MapPin,
    label: 'Adres geverifieerd',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Adres is geverifieerd',
  },
  company_verified: {
    icon: Building,
    label: 'Bedrijf geverifieerd',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Bedrijfsgegevens zijn geverifieerd',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function VerificationBadges({ 
  userId, 
  size = 'md', 
  showLabels = true, 
  interactive = false,
  className = ''
}: VerificationBadgesProps) {
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationLevel, setVerificationLevel] = useState(0);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_badges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      setBadges(data || []);
      setVerificationLevel((data || []).length);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-6 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const hasAllBadges = badges.length === 5;
  const hasRequiredBadges = badges.length >= 3;

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-3 ${className}`}>
        {/* Verification Level Indicator */}
        {interactive && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
              <div 
                className={`
                  bg-primary h-2 rounded-full transition-all duration-300
                  ${badges.length === 0 ? 'w-0' : ''}
                  ${badges.length === 1 ? 'w-1/5' : ''}
                  ${badges.length === 2 ? 'w-2/5' : ''}
                  ${badges.length === 3 ? 'w-3/5' : ''}
                  ${badges.length === 4 ? 'w-4/5' : ''}
                  ${badges.length === 5 ? 'w-full' : ''}
                `}
              />
            </div>
            <span className="text-muted-foreground min-w-[60px] text-right">
              {badges.length}/5 badges
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(badgeConfig).map(([badgeType, config]) => {
            const hasBadge = badges.some(b => b.badge_type === badgeType);
            const Icon = config.icon;

            return (
              <Tooltip key={badgeType}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={hasBadge ? 'default' : 'secondary'}
                    className={`${hasBadge ? config.color : 'bg-gray-100 text-gray-500 border-gray-200'} 
                      ${sizeClasses[size]} 
                      ${interactive && !hasBadge ? 'cursor-pointer hover:bg-gray-200' : ''}
                      transition-all duration-200`}
                  >
                    <Icon className={`${iconSizes[size]} ${showLabels ? 'mr-1' : ''}`} />
                    {showLabels && (
                      <span className={hasBadge ? '' : 'line-through'}>
                        {config.label}
                      </span>
                    )}
                    {hasBadge ? (
                      <Check className={`${iconSizes[size]} ml-1`} />
                    ) : interactive ? (
                      <Clock className={`${iconSizes[size]} ml-1`} />
                    ) : null}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {hasBadge 
                        ? `${config.description} - ${badges.find(b => b.badge_type === badgeType)?.verified_at ? 
                            `Geverifieerd op ${new Date(badges.find(b => b.badge_type === badgeType)!.verified_at).toLocaleDateString('nl-NL')}` 
                            : 'Geverifieerd'}`
                        : 'Nog niet geverifieerd'
                      }
                    </p>
                    {!hasBadge && interactive && (
                      <p className="text-xs text-primary mt-2">
                        Klik om te verifiëren
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Status Messages */}
        {interactive && (
          <div className="space-y-2">
            {hasAllBadges && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Profiel volledig geverifieerd! Je kunt solliciteren op alle opdrachten.</span>
              </div>
            )}
            
            {hasRequiredBadges && !hasAllBadges && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Info className="h-4 w-4" />
                <span>Je hebt {badges.length} badges. Solliciteren op vaste contracten is mogelijk.</span>
              </div>
            )}
            
            {!hasRequiredBadges && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Je hebt minimaal 3 badges nodig om te solliciteren op vaste contracten.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Compact version for profile cards
export function VerificationBadgesCompact({ 
  userId, 
  className = '' 
}: { 
  userId: string; 
  className?: string; 
}) {
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadgeCount();
  }, [userId]);

  const fetchBadgeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('verification_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      
      setBadgeCount(count || 0);
    } catch (error) {
      console.error('Error fetching badge count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="w-20 h-4 bg-muted animate-pulse rounded" />;
  }

  const hasAllBadges = badgeCount === 5;
  const hasRequiredBadges = badgeCount >= 3;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-1">
        {[...Array(Math.min(badgeCount, 3))].map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center"
          >
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        ))}
        {badgeCount > 3 && (
          <div className="w-5 h-5 bg-muted rounded-full border-2 border-background flex items-center justify-center">
            <span className="text-xs font-medium">+{badgeCount - 3}</span>
          </div>
        )}
      </div>
      
      <span className="text-xs text-muted-foreground">
        {badgeCount} badges
        {hasAllBadges && ' ✓'}
        {hasRequiredBadges && !hasAllBadges && ' ✓'}
      </span>
    </div>
  );
}

// Badge requirement indicator for assignments
export function BadgeRequirementIndicator({ 
  required = 3, 
  userBadges = 0,
  className = ''
}: { 
  required?: number; 
  userBadges?: number; 
  className?: string; 
}) {
  const meetsRequirement = userBadges >= required;

  return (
    <div className={`flex items-center gap-2 text-sm ${meetsRequirement ? 'text-green-600' : 'text-amber-600'} ${className}`}>
      {meetsRequirement ? (
        <Check className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span>
        {meetsRequirement 
          ? `Je hebt ${userBadges} badges (vereist: ${required})`
          : `Je hebt ${userBadges} badges, nodig: ${required}`
        }
      </span>
    </div>
  );
}

export default VerificationBadges;
