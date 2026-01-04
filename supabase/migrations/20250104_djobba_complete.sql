-- DJOBBA Complete Database Schema
-- Migration: 20250104_djobba_complete.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- A. MICROCOPY SYSTEM (PRIORITEIT 1)
CREATE TABLE microcopy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  text_nl TEXT NOT NULL,
  text_en TEXT,
  context TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert essential microcopy entries
INSERT INTO microcopy (key, category, text_nl, text_en) VALUES
-- Homepage
('homepage.headline', 'home', 'DJOBBA: Het platform voor flexibel werk en vaste contracten', 'DJOBBA: The platform for flexible work and permanent contracts'),
('homepage.subtitle', 'home', 'Vind korte klussen met snelle betaling of solliciteer op vaste contracten bij topbedrijven.', 'Find short gigs with fast payment or apply for permanent contracts at top companies.'),
('homepage.professionals.short', 'home', 'Korte klussen met snelle betaling', 'Short gigs with fast payment'),
('homepage.professionals.long', 'home', 'Vaste contracten bij topbedrijven', 'Permanent contracts at top companies'),

-- Landing Pages
('landing.professionals.short.headline', 'professionals', '⚡ KORTE OPDRACHTEN', '⚡ SHORT ASSIGNMENTS'),
('landing.professionals.short.subtitle', 'professionals', 'Werk wanneer je wilt, betaald zoals jij wilt.', 'Work when you want, paid your way.'),
('landing.professionals.short.bullet1', 'professionals', 'Accepteer klussen per dag/week', 'Accept gigs per day/week'),
('landing.professionals.short.bullet2', 'professionals', 'Kies: binnen 3 dagen betaald of later', 'Choose: paid within 3 days or later'),
('landing.professionals.short.bullet3', 'professionals', 'Geen vast contract, maximale flexibiliteit', 'No fixed contract, maximum flexibility'),

('landing.professionals.long.headline', 'professionals', '🏢 VASTE CONTRACTEN', '🏢 PERMANENT CONTRACTS'),
('landing.professionals.long.subtitle', 'professionals', 'Zekerheid van een vast contract met alle voordelen.', 'Security of a permanent contract with all benefits.'),
('landing.professionals.long.bullet1', 'professionals', 'In dienst bij het bedrijf', 'Employed by the company'),
('landing.professionals.long.bullet2', 'professionals', 'Vast salaris + secundaire voorwaarden', 'Fixed salary + secondary benefits'),
('landing.professionals.long.bullet3', 'professionals', 'Langdurige projecten (7+ maanden)', 'Long-term projects (7+ months)'),

-- Business
('landing.business.flex.headline', 'business', '⚡ FLEXIBELE INZET', '⚡ FLEXIBLE DEPLOYMENT'),
('landing.business.flex.subtitle', 'business', 'Professionals voor korte projecten, direct beschikbaar.', 'Professionals for short projects, immediately available.'),
('landing.business.flex.bullet1', 'business', 'Professionals binnen 24 uur', 'Professionals within 24 hours'),
('landing.business.flex.bullet2', 'business', 'Per dag, week of maand beschikbaar', 'Available per day, week, or month'),
('landing.business.flex.bullet3', 'business', 'Geen lange verplichtingen', 'No long-term commitments'),

('landing.business.permanent.headline', 'business', '🎯 VAST TALENT', '🎯 PERMANENT TALENT'),
('landing.business.permanent.subtitle', 'business', 'Vind de juiste professionals voor vaste posities.', 'Find the right professionals for permanent positions.'),
('landing.business.permanent.bullet1', 'business', 'Vooraf gescreende kandidaten', 'Pre-screened candidates'),
('landing.business.permanent.bullet2', 'business', 'Gemiddelde plaatsing: 2 weken', 'Average placement: 2 weeks'),
('landing.business.permanent.bullet3', 'business', '6 maanden garantie', '6 months guarantee'),

-- UI Elements
('ui.account_type.title', 'ui', 'Wat zoek je?', 'What are you looking for?'),
('ui.account_type.option1', 'ui', 'Ik wil flexibel werken (korte opdrachten)', 'I want to work flexibly (short assignments)'),
('ui.account_type.option2', 'ui', 'Ik zoek een vast contract (7+ maanden)', 'I am looking for a permanent contract (7+ months)'),
('ui.account_type.option3', 'ui', 'Beide', 'Both'),

-- Wallet
('wallet.title', 'wallet', 'Mijn Wallet', 'My Wallet'),
('wallet.pending', 'wallet', 'In afwachting', 'Pending'),
('wallet.available', 'wallet', 'Beschikbaar', 'Available'),
('wallet.total_earned', 'wallet', 'Totaal verdiend', 'Total earned'),
('wallet.disclaimer', 'wallet', 'Let op: Wallet is alleen voor korte opdrachten. Vaste contracten worden direct door het bedrijf betaald.', 'Note: Wallet is only for short assignments. Permanent contracts are paid directly by the company.'),

-- Badges
('badge.email_verified', 'badge', 'E-mail geverifieerd', 'Email verified'),
('badge.phone_verified', 'badge', 'Telefoon geverifieerd', 'Phone verified'),
('badge.id_verified', 'badge', 'ID geverifieerd', 'ID verified'),
('badge.address_verified', 'badge', 'Adres geverifieerd', 'Address verified'),
('badge.company_verified', 'badge', 'Bedrijf geverifieerd', 'Company verified'),

-- Reviews
('review.invitation', 'review', 'Hoe was je ervaring met {name}?', 'How was your experience with {name}?'),
('review.would_recommend', 'review', 'Zou je {name} aanraden aan anderen?', 'Would you recommend {name} to others?'),
('review.submit', 'review', 'Review plaatsen', 'Submit review'),

-- Factoring
('factoring.title', 'factoring', 'Factoring Optie', 'Factoring Option'),
('factoring.subtitle', 'factoring', 'Kies: direct betaald of wacht op betalingstermijn', 'Choose: get paid immediately or wait for payment term'),
('factoring.immediate', 'factoring', 'Direct betaald (3% kosten)', 'Immediate payment (3% fee)'),
('factoring.standard', 'factoring', 'Standaard (30 dagen)', 'Standard (30 days)'),
('factoring.recommended', 'factoring', 'AANBEVOLEN', 'RECOMMENDED');

-- B. VERIFICATION BADGES TABLE
CREATE TABLE verification_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('email_verified', 'phone_verified', 'id_verified', 'address_verified', 'company_verified')),
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id), -- Admin who verified
  evidence JSONB DEFAULT '{}'::jsonb, -- Store evidence of verification
  PRIMARY KEY (user_id, badge_type)
);

-- C. REVIEWS SYSTEM
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID,
  assignment_id UUID,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN NOT NULL,
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, contract_id) -- One review per contract
);

-- D. WALLET SYSTEM
CREATE TABLE wallets (
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  pending_balance_cents INTEGER DEFAULT 0 CHECK (pending_balance_cents >= 0),
  available_balance_cents INTEGER DEFAULT 0 CHECK (available_balance_cents >= 0),
  total_earned_cents INTEGER DEFAULT 0 CHECK (total_earned_cents >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(professional_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('earning', 'withdrawal', 'fee', 'bonus')),
  amount_cents INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- Reference to contract/assignment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E. CHAT SYSTEM
CREATE TABLE message_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, assignment_id)
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G. USER PROFILES EXTENSION
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  account_type VARCHAR(20) CHECK (account_type IN ('professional', 'employer', 'both')) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Nederland',
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '{}'::jsonb, -- Store availability preferences
  hourly_rate_cents INTEGER,
  company_name VARCHAR(100),
  vat_number VARCHAR(50),
  chamber_of_commerce VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- H. ASSIGNMENTS/CONTRACTS
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('short', 'permanent')),
  category VARCHAR(50),
  location VARCHAR(100),
  remote_allowed BOOLEAN DEFAULT false,
  duration_days INTEGER, -- For short assignments
  salary_cents INTEGER, -- For permanent contracts
  hourly_rate_cents INTEGER, -- For short assignments
  requirements JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'closed', 'draft')),
  application_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_rate_cents INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, professional_id)
);

CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('short', 'permanent')),
  start_date DATE NOT NULL,
  end_date DATE, -- Null for permanent contracts
  rate_cents INTEGER NOT NULL,
  factoring_enabled BOOLEAN DEFAULT false,
  factoring_fee_percent INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'paused')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- I. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- J. FACTORING
CREATE TABLE factoring_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  fee_percent INTEGER NOT NULL DEFAULT 3,
  fee_cents INTEGER NOT NULL,
  payout_amount_cents INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- K. METRICS VIEWS
CREATE MATERIALIZED VIEW assignment_metrics AS
SELECT 
  a.type,
  a.category,
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN a.status = 'filled' THEN 1 END) as filled_assignments,
  COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_assignments,
  AVG(CASE WHEN a.type = 'short' THEN a.hourly_rate_cents WHEN a.type = 'permanent' THEN a.salary_cents END) as avg_rate,
  DATE_TRUNC('week', a.created_at) as week
FROM assignments a
GROUP BY a.type, a.category, DATE_TRUNC('week', a.created_at);

CREATE MATERIALIZED VIEW professional_metrics AS
SELECT 
  p.id as professional_id,
  COUNT(DISTINCT c.id) as total_contracts,
  COUNT(DISTINCT CASE WHEN c.type = 'short' THEN c.id END) as short_contracts,
  COUNT(DISTINCT CASE WHEN c.type = 'permanent' THEN c.id END) as permanent_contracts,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.id) as total_reviews,
  COALESCE(w.total_earned_cents, 0) as total_earned,
  DATE_TRUNC('month', c.created_at) as month
FROM user_profiles p
LEFT JOIN contracts c ON p.id = c.professional_id
LEFT JOIN reviews r ON p.id = r.reviewed_id
LEFT JOIN wallets w ON p.id = w.professional_id
WHERE p.account_type IN ('professional', 'both')
GROUP BY p.id, w.total_earned_cents, DATE_TRUNC('month', c.created_at);

-- Enable RLS
ALTER TABLE microcopy ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE factoring_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Microcopy - Everyone can read
CREATE POLICY "Public read access for microcopy" ON microcopy FOR SELECT USING (true);

-- Verification badges - Users can read their own, admins can read all
CREATE POLICY "Users can read own badges" ON verification_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON verification_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews - Participants can read reviews for their contracts
CREATE POLICY "Users can read relevant reviews" ON reviews FOR SELECT USING (
  reviewer_id = auth.uid() OR 
  reviewed_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM contracts c 
    WHERE c.id = reviews.contract_id 
    AND (c.professional_id = auth.uid() OR c.employer_id = auth.uid())
  )
);

-- Wallets - Users can read/update own wallet
CREATE POLICY "Users can manage own wallet" ON wallets FOR ALL USING (auth.uid() = professional_id);

-- Wallet transactions - Users can read own transactions
CREATE POLICY "Users can read own transactions" ON wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM wallets w WHERE w.professional_id = auth.uid() AND w.professional_id = wallet_transactions.wallet_id)
);

-- Message threads - Participants can read their threads
CREATE POLICY "Users can read own message threads" ON message_threads FOR SELECT USING (
  participant1_id = auth.uid() OR participant2_id = auth.uid()
);

-- Messages - Thread participants can read messages
CREATE POLICY "Users can read messages in their threads" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM message_threads mt 
    WHERE mt.id = messages.thread_id 
    AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
  )
);

-- Audit logs - Users can read their own logs
CREATE POLICY "Users can read own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- User profiles - Everyone can read, users can update own
CREATE POLICY "Public read access for profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Assignments - Everyone can read active assignments
CREATE POLICY "Public read access for active assignments" ON assignments FOR SELECT USING (status = 'active');
CREATE POLICY "Employers can manage own assignments" ON assignments FOR ALL USING (
  auth.uid() = employer_id
);

-- Applications - Users can manage own applications
CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (
  auth.uid() = professional_id
);
CREATE POLICY "Employers can read applications for their assignments" ON applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assignments a 
    WHERE a.id = applications.assignment_id 
    AND a.employer_id = auth.uid()
  )
);

-- Contracts - Participants can read their contracts
CREATE POLICY "Users can read own contracts" ON contracts FOR SELECT USING (
  professional_id = auth.uid() OR employer_id = auth.uid()
);

-- Notifications - Users can manage own notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Factoring requests - Users can manage own requests
CREATE POLICY "Users can manage own factoring requests" ON factoring_requests FOR ALL USING (auth.uid() = professional_id);

-- Create indexes for performance
CREATE INDEX idx_microcopy_key ON microcopy(key);
CREATE INDEX idx_verification_badges_user ON verification_badges(user_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX idx_reviews_contract ON reviews(contract_id);
CREATE INDEX idx_wallets_professional ON wallets(professional_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_message_threads_participants ON message_threads(participant1_id, participant2_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_user_profiles_type ON user_profiles(account_type);
CREATE INDEX idx_assignments_type ON assignments(type);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_applications_assignment ON applications(assignment_id);
CREATE INDEX idx_applications_professional ON applications(professional_id);
CREATE INDEX idx_contracts_professional ON contracts(professional_id);
CREATE INDEX idx_contracts_employer ON contracts(employer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create functions for automated workflows

-- Function to update wallet when contract is completed
CREATE OR REPLACE FUNCTION update_wallet_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Only update wallet for short contracts
    IF NEW.type = 'short' THEN
      UPDATE wallets 
      SET 
        pending_balance_cents = pending_balance_cents + NEW.rate_cents,
        total_earned_cents = total_earned_cents + NEW.rate_cents,
        updated_at = NOW()
      WHERE professional_id = NEW.professional_id;
      
      -- Create transaction record
      INSERT INTO wallet_transactions (wallet_id, type, amount_cents, description, reference_id)
      VALUES (
        NEW.professional_id,
        'earning',
        NEW.rate_cents,
        'Contract completion: ' || (SELECT title FROM assignments WHERE id = NEW.assignment_id),
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet updates
CREATE TRIGGER trigger_update_wallet_on_completion
  AFTER UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_on_completion();

-- Function to automatically create wallet for new professionals
CREATE OR REPLACE FUNCTION create_wallet_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_type IN ('professional', 'both') THEN
    INSERT INTO wallets (professional_id) VALUES (NEW.id)
    ON CONFLICT (professional_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet creation
CREATE TRIGGER trigger_create_wallet_on_signup
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_on_signup();

-- Function to log audit entries
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (NEW.id, v_action, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (COALESCE(NEW.id, OLD.id), v_action, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values)
    VALUES (OLD.id, v_action, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers for important tables
CREATE TRIGGER audit_contracts AFTER INSERT OR UPDATE OR DELETE ON contracts
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_assignment_metrics_hourly()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY assignment_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY professional_metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every hour (requires pg_cron)
SELECT cron.schedule('refresh-metrics-hourly', '0 * * * *', 'SELECT refresh_assignment_metrics_hourly();');

-- Create function to check badge requirements
CREATE OR REPLACE FUNCTION check_badge_requirements(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count
  FROM verification_badges
  WHERE user_id = p_user_id;
  
  RETURN badge_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get professional stats
CREATE OR REPLACE FUNCTION get_professional_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_contracts', COALESCE(COUNT(DISTINCT c.id), 0),
    'active_contracts', COALESCE(COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END), 0),
    'completed_contracts', COALESCE(COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END), 0),
    'avg_rating', COALESCE(AVG(r.rating), 0),
    'total_reviews', COALESCE(COUNT(DISTINCT r.id), 0),
    'wallet_balance', COALESCE(w.available_balance_cents, 0),
    'pending_earnings', COALESCE(w.pending_balance_cents, 0),
    'total_earned', COALESCE(w.total_earned_cents, 0)
  ) INTO result
  FROM user_profiles p
  LEFT JOIN contracts c ON p.id = c.professional_id
  LEFT JOIN reviews r ON p.id = r.reviewed_id
  LEFT JOIN wallets w ON p.id = w.professional_id
  WHERE p.id = p_user_id
  GROUP BY p.id, w.available_balance_cents, w.pending_balance_cents, w.total_earned_cents;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Create function to send review invitation
CREATE OR REPLACE FUNCTION send_review_invitation()
RETURNS void AS $$
DECLARE
  completed_contracts RECORD;
BEGIN
  FOR completed_contracts IN 
    SELECT c.id, c.professional_id, c.employer_id, c.completed_at
    FROM contracts c
    WHERE c.status = 'completed'
      AND c.completed_at < NOW() - INTERVAL '48 hours'
      AND NOT EXISTS (
        SELECT 1 FROM reviews r 
        WHERE r.contract_id = c.id 
        AND r.reviewer_id = c.employer_id
      )
  LOOP
    -- Create notification for employer to review professional
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      completed_contracts.employer_id,
      'review_invitation',
      'Deel je ervaring',
      'Hoe was je samenwerking met deze professional?',
      json_build_object('contract_id', completed_contracts.id, 'professional_id', completed_contracts.professional_id)
    );
    
    -- Also notify professional to review employer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      completed_contracts.professional_id,
      'review_invitation',
      'Deel je ervaring',
      'Hoe was je ervaring met deze opdrachtgever?',
      json_build_object('contract_id', completed_contracts.id, 'employer_id', completed_contracts.employer_id, 'review_employer', true)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule review invitations daily
SELECT cron.schedule('send-review-invitations', '0 9 * * *', 'SELECT send_review_invitation();');

-- Create view for assignment feed with filtering
CREATE VIEW assignment_feed AS
SELECT 
  a.*,
  up.first_name || ' ' || up.last_name as employer_name,
  up.company_name,
  COUNT(ap.id) as application_count
FROM assignments a
LEFT JOIN user_profiles up ON a.employer_id = up.id
LEFT JOIN applications ap ON a.id = ap.assignment_id
WHERE a.status = 'active'
  AND (a.application_deadline IS NULL OR a.application_deadline > NOW())
GROUP BY a.id, up.first_name, up.last_name, up.company_name;
