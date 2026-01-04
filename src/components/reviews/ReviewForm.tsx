import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  MessageSquare, 
  User, 
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react';
import { Review } from '@/types/database';
import { submitReview } from '@/lib/business-logic';

interface ReviewFormProps {
  contractId: string;
  reviewerId: string;
  reviewedId: string;
  assignmentId?: string;
  reviewedName: string;
  reviewedType: 'professional' | 'employer';
  onSubmit?: (review: Review) => void;
  onCancel?: () => void;
}

export function ReviewForm({ 
  contractId,
  reviewerId,
  reviewedId,
  assignmentId,
  reviewedName,
  reviewedType,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Selecteer een sterrenrating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'> = {
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        contract_id: contractId,
        assignment_id: assignmentId || null,
        rating,
        would_recommend: wouldRecommend,
        comment: comment.trim() || null,
        is_anonymous: isAnonymous
      };

      const result = await submitReview(reviewData);

      if (result.success) {
        setSuccess(true);
        onSubmit?.(reviewData as Review);
      } else {
        setError(result.error || 'Er is een fout opgetreden');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het verzenden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Slecht';
      case 2:
        return 'Matig';
      case 3:
        return 'Gemiddeld';
      case 4:
        return 'Goed';
      case 5:
        return 'Uitstekend';
      default:
        return '';
    }
  };

  const getRecommendationText = () => {
    if (reviewedType === 'professional') {
      return 'Zou je deze professional aanbevelen bij andere opdrachtgevers?';
    } else {
      return 'Zou je deze werkgever aanbevelen bij andere professionals?';
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Review verzonden!</h3>
          <p className="text-muted-foreground mb-4">
            Bedankt voor je feedback. Dit helpt de community om betere keuzes te maken.
          </p>
          <Button onClick={onCancel} variant="outline">
            Sluiten
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Schrijf een review voor {reviewedName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-medium">Beoordeling</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {getRatingText(rating)}
                </span>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="recommend"
              checked={wouldRecommend}
              onCheckedChange={(checked) => setWouldRecommend(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="recommend"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {getRecommendationText()}
              </Label>
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Opmerkingen (optioneel)</Label>
            <Textarea
              id="comment"
              placeholder="Deel je ervaring..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 karakters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Anoniem posten
              </Label>
              <p className="text-xs text-muted-foreground">
                Je naam wordt niet getoond in de review
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Message */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Reviews zijn zichtbaar voor alle gebruikers en helpen de community om betere beslissingen te nemen.
              Wees eerlijk en constructief in je feedback.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuleren
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || rating === 0} className="flex-1">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  Verzenden...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Review verzenden
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Review Trigger Component - Shows 48 hours after contract completion
interface ReviewTriggerProps {
  contractId: string;
  reviewerId: string;
  reviewedId: string;
  assignmentId?: string;
  reviewedName: string;
  reviewedType: 'professional' | 'employer';
  completedAt: string;
}

export function ReviewTrigger({
  contractId,
  reviewerId,
  reviewedId,
  assignmentId,
  reviewedName,
  reviewedType,
  completedAt
}: ReviewTriggerProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [timeSinceCompletion, setTimeSinceCompletion] = useState<string>('');

  React.useEffect(() => {
    const calculateTimeSince = () => {
      const now = new Date();
      const completion = new Date(completedAt);
      const hoursSince = Math.floor((now.getTime() - completion.getTime()) / (1000 * 60 * 60));
      
      if (hoursSince < 48) {
        const hoursLeft = 48 - hoursSince;
        setTimeSinceCompletion(`Beschikbaar over ${hoursLeft} uur`);
      } else {
        setTimeSinceCompletion('Klaar om te reviewen');
      }
    };

    calculateTimeSince();
    const interval = setInterval(calculateTimeSince, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [completedAt]);

  const canReview = timeSinceCompletion === 'Klaar om te reviewen';

  if (showReviewForm) {
    return (
      <ReviewForm
        contractId={contractId}
        reviewerId={reviewerId}
        reviewedId={reviewedId}
        assignmentId={assignmentId}
        reviewedName={reviewedName}
        reviewedType={reviewedType}
        onSubmit={() => setShowReviewForm(false)}
        onCancel={() => setShowReviewForm(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Deel je ervaring</h3>
            <p className="text-sm text-muted-foreground">{timeSinceCompletion}</p>
          </div>
          <Button
            onClick={() => setShowReviewForm(true)}
            disabled={!canReview}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Schrijf Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReviewForm;
