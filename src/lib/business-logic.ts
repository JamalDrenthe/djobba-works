// Business Logic Utilities
// Contains core business logic for DJOBBA platform

import { supabase } from '@/lib/supabase/client';
import { 
  Assignment, 
  Application, 
  Contract, 
  Review, 
  Wallet, 
  WalletTransaction,
  VerificationBadge,
  Notification,
  FactoringRequest
} from '@/types/database';

// ==============================
// BADGE GATING LOGIC
// ==============================

/**
 * Check if user meets badge requirements for assignment type
 */
export async function checkBadgeRequirements(
  userId: string, 
  assignmentType: 'short' | 'permanent'
): Promise<{ meetsRequirements: boolean; badgeCount: number; requiredBadges: number }> {
  try {
    // Count user's badges
    const { count: badgeCount, error: badgeError } = await supabase
      .from('verification_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (badgeError) throw badgeError;

    const requiredBadges = assignmentType === 'permanent' ? 3 : 0;
    const meetsRequirements = (badgeCount || 0) >= requiredBadges;

    return {
      meetsRequirements,
      badgeCount: badgeCount || 0,
      requiredBadges
    };
  } catch (error) {
    console.error('Error checking badge requirements:', error);
    return {
      meetsRequirements: false,
      badgeCount: 0,
      requiredBadges: assignmentType === 'permanent' ? 3 : 0
    };
  }
}

/**
 * Get user's verification badges
 */
export async function getUserBadges(userId: string): Promise<VerificationBadge[]> {
  try {
    const { data, error } = await supabase
      .from('verification_badges')
      .select('*')
      .eq('user_id', userId)
      .order('verified_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

// ==============================
// WALLET LOGIC
// ==============================

/**
 * Update wallet when contract is completed
 */
export async function updateWalletOnContractCompletion(contractId: string): Promise<boolean> {
  try {
    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) throw contractError || new Error('Contract not found');

    // Only update wallet for short contracts
    if (contract.type !== 'short') {
      console.log('Skipping wallet update for permanent contract');
      return true;
    }

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        pending_balance_cents: supabase.rpc('increment', { amount: contract.rate_cents }),
        total_earned_cents: supabase.rpc('increment', { amount: contract.rate_cents }),
        updated_at: new Date().toISOString()
      })
      .eq('professional_id', contract.professional_id);

    if (walletError) throw walletError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: contract.professional_id,
        type: 'earning',
        amount_cents: contract.rate_cents,
        description: `Contract completion: ${contractId}`,
        reference_id: contractId
      });

    if (transactionError) throw transactionError;

    // Send notification
    await sendNotification(
      contract.professional_id,
      'payment',
      'Nieuwe betaling ontvangen',
      `€${(contract.rate_cents / 100).toFixed(2)} is toegevoegd aan je wallet.`,
      { contract_id: contractId, amount: contract.rate_cents }
    );

    return true;
  } catch (error) {
    console.error('Error updating wallet:', error);
    return false;
  }
}

/**
 * Get user's wallet information
 */
export async function getUserWallet(userId: string): Promise<Wallet | null> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('professional_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    return data;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(
  userId: string, 
  limit = 50,
  offset = 0
): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Request withdrawal from wallet
 */
export async function requestWithdrawal(
  userId: string,
  amountCents: number,
  bankAccount: { iban: string; accountHolder: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get wallet
    const wallet = await getUserWallet(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    // Check sufficient balance
    if (wallet.available_balance_cents < amountCents) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create withdrawal transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: userId,
        type: 'withdrawal',
        amount_cents: -amountCents,
        description: `Withdrawal to ${bankAccount.iban}`,
        reference_id: null
      });

    if (transactionError) throw transactionError;

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        available_balance_cents: wallet.available_balance_cents - amountCents,
        updated_at: new Date().toISOString()
      })
      .eq('professional_id', userId);

    if (walletError) throw walletError;

    // Send notification
    await sendNotification(
      userId,
      'payment',
      'Opname verwerkt',
      `€${(amountCents / 100).toFixed(2)} is overgemaakt naar je rekening.`,
      { amount: amountCents }
    );

    return { success: true };
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return { success: false, error: 'Failed to process withdrawal' };
  }
}

// ==============================
// FACTORING LOGIC
// ==============================

/**
 * Request factoring for a contract
 */
export async function requestFactoring(
  contractId: string,
  professionalId: string
): Promise<{ success: boolean; error?: string; factoringRequest?: FactoringRequest }> {
  try {
    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) throw contractError || new Error('Contract not found');

    // Check if factoring already requested
    const { data: existingRequest } = await supabase
      .from('factoring_requests')
      .select('*')
      .eq('contract_id', contractId)
      .single();

    if (existingRequest) {
      return { success: false, error: 'Factoring already requested for this contract' };
    }

    // Calculate fees
    const feePercent = 3;
    const feeCents = Math.floor(contract.rate_cents * (feePercent / 100));
    const payoutAmountCents = contract.rate_cents - feeCents;

    // Create factoring request
    const { data: factoringRequest, error: factoringError } = await supabase
      .from('factoring_requests')
      .insert({
        contract_id: contractId,
        professional_id: professionalId,
        amount_cents: contract.rate_cents,
        fee_percent: feePercent,
        fee_cents: feeCents,
        payout_amount_cents: payoutAmountCents,
        status: 'pending'
      })
      .select()
      .single();

    if (factoringError) throw factoringError;

    // Update contract to enable factoring
    await supabase
      .from('contracts')
      .update({ factoring_enabled: true })
      .eq('id', contractId);

    // Send notification
    await sendNotification(
      professionalId,
      'payment',
      'Factoring aangevraagd',
      `Je hebt factoring aangevraagd voor €${(payoutAmountCents / 100).toFixed(2)}.`,
      { factoring_request_id: factoringRequest.id }
    );

    return { success: true, factoringRequest };
  } catch (error) {
    console.error('Error requesting factoring:', error);
    return { success: false, error: 'Failed to request factoring' };
  }
}

// ==============================
// REVIEW LOGIC
// ==============================

/**
 * Submit a review
 */
export async function submitReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', review.reviewer_id)
      .eq('contract_id', review.contract_id)
      .single();

    if (existingReview) {
      return { success: false, error: 'Review already submitted for this contract' };
    }

    // Insert review
    const { error: insertError } = await supabase
      .from('reviews')
      .insert(review);

    if (insertError) throw insertError;

    // Send notification to reviewed user
    await sendNotification(
      review.reviewed_id,
      'review',
      'Nieuwe review ontvangen',
      `Je hebt een ${review.rating}-sterren review ontvangen.`,
      { review_id: review.id, rating: review.rating }
    );

    return { success: true };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}

/**
 * Get reviews for a user
 */
export async function getUserReviews(
  userId: string,
  type: 'given' | 'received' = 'received',
  limit = 10
): Promise<Review[]> {
  try {
    const column = type === 'given' ? 'reviewer_id' : 'reviewed_id';
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Calculate user's average rating
 */
export async function getUserAverageRating(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / data.length) * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
}

/**
 * Get "would recommend" percentage for a user
 */
export async function getUserRecommendationPercentage(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('would_recommend')
      .eq('reviewed_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const recommendCount = data.filter(review => review.would_recommend).length;
    return Math.round((recommendCount / data.length) * 100);
  } catch (error) {
    console.error('Error calculating recommendation percentage:', error);
    return 0;
  }
}

// ==============================
// NOTIFICATION LOGIC
// ==============================

/**
 * Send notification to user
 */
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data: Record<string, any> = {}
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsRead(
  userId: string,
  notificationIds?: string[]
): Promise<boolean> {
  try {
    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (notificationIds) {
      query = query.in('id', notificationIds);
    } else {
      query = query.eq('is_read', false);
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
}

// ==============================
// APPLICATION LOGIC
// ==============================

/**
 * Apply for an assignment
 */
export async function applyForAssignment(
  assignmentId: string,
  professionalId: string,
  applicationData: {
    cover_letter?: string;
    proposed_rate_cents?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('professional_id', professionalId)
      .single();

    if (existingApplication) {
      return { success: false, error: 'Already applied for this assignment' };
    }

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) throw assignmentError || new Error('Assignment not found');

    // Check badge requirements for permanent assignments
    if (assignment.type === 'permanent') {
      const { meetsRequirements } = await checkBadgeRequirements(professionalId, 'permanent');
      if (!meetsRequirements) {
        return { 
          success: false, 
          error: 'You need at least 3 verification badges to apply for permanent contracts' 
        };
      }
    }

    // Create application
    const { error: applicationError } = await supabase
      .from('applications')
      .insert({
        assignment_id: assignmentId,
        professional_id: professionalId,
        ...applicationData
      });

    if (applicationError) throw applicationError;

    // Send notification to employer
    await sendNotification(
      assignment.employer_id,
      'application',
      'Nieuwe sollicitatie',
      'Iemand heeft gesolliciteerd op je opdracht.',
      { assignment_id: assignmentId, professional_id }
    );

    return { success: true };
  } catch (error) {
    console.error('Error applying for assignment:', error);
    return { success: false, error: 'Failed to submit application' };
  }
}

/**
 * Accept an application and create contract
 */
export async function acceptApplication(
  applicationId: string,
  employerId: string,
  contractData: {
    start_date: string;
    end_date?: string;
    rate_cents: number;
  }
): Promise<{ success: boolean; error?: string; contract?: Contract }> {
  try {
    // Get application details
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('*, assignments(*)')
      .eq('id', applicationId)
      .single();

    if (applicationError || !application) throw applicationError || new Error('Application not found');

    // Verify employer owns the assignment
    if (application.assignments.employer_id !== employerId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update application status
    await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId);

    // Reject other applications
    await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('assignment_id', application.assignment_id)
      .neq('id', applicationId);

    // Create contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        assignment_id: application.assignment_id,
        professional_id: application.professional_id,
        employer_id: employerId,
        type: application.assignments.type,
        ...contractData
      })
      .select()
      .single();

    if (contractError) throw contractError;

    // Update assignment status
    await supabase
      .from('assignments')
      .update({ status: 'filled' })
      .eq('id', application.assignment_id);

    // Send notification to professional
    await sendNotification(
      application.professional_id,
      'contract',
      'Sollicitatie geaccepteerd!',
      'Je sollicitatie is geaccepteerd. Check je contract.',
      { contract_id: contract.id }
    );

    return { success: true, contract };
  } catch (error) {
    console.error('Error accepting application:', error);
    return { success: false, error: 'Failed to accept application' };
  }
}

// ==============================
// CONTRACT LOGIC
// ==============================

/**
 * Complete a contract
 */
export async function completeContract(
  contractId: string,
  userId: string // Either professional or employer
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) throw contractError || new Error('Contract not found');

    // Verify user is part of contract
    if (contract.professional_id !== userId && contract.employer_id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update contract status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) throw updateError;

    // Update wallet if it's a short contract
    if (contract.type === 'short') {
      await updateWalletOnContractCompletion(contractId);
    }

    // Schedule review invitations (48 hours later)
    // This would typically be handled by a cron job or database trigger

    return { success: true };
  } catch (error) {
    console.error('Error completing contract:', error);
    return { success: false, error: 'Failed to complete contract' };
  }
}

export default {
  // Badge functions
  checkBadgeRequirements,
  getUserBadges,
  
  // Wallet functions
  updateWalletOnContractCompletion,
  getUserWallet,
  getWalletTransactions,
  requestWithdrawal,
  
  // Factoring functions
  requestFactoring,
  
  // Review functions
  submitReview,
  getUserReviews,
  getUserAverageRating,
  getUserRecommendationPercentage,
  
  // Notification functions
  sendNotification,
  getUnreadNotifications,
  markNotificationsRead,
  
  // Application functions
  applyForAssignment,
  acceptApplication,
  
  // Contract functions
  completeContract,
};
