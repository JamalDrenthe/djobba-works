-- Create test data for DJOBBA platform
-- Note: Users are already created via auth API

-- Create profiles for test users
INSERT INTO user_profiles (
  id,
  first_name,
  last_name,
  account_type
) VALUES 
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'Jan',
  'Janssen',
  'professional'
),
(
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  'Marieke',
  'de Vries',
  'employer'
) ON CONFLICT (id) DO NOTHING;

-- Create wallets for professional
INSERT INTO wallets (
  professional_id,
  available_balance_cents,
  pending_balance_cents,
  total_earned_cents
) VALUES 
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  50000, -- €500.00
  25000, -- €250.00
  125000 -- €1250.00 total earned
) ON CONFLICT (professional_id) DO NOTHING;

-- Add verification badges for professional
INSERT INTO verification_badges (
  user_id,
  badge_type,
  verified_at
) VALUES 
-- Professional has all badges
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'email_verified',
  now()
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'phone_verified',
  now()
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'id_verified',
  now()
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'address_verified',
  now()
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  'company_verified',
  now()
),
-- Employer has basic badges
(
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  'email_verified',
  now()
),
(
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  'company_verified',
  now()
) ON CONFLICT (user_id, badge_type) DO NOTHING;

-- Create sample assignments for employer
INSERT INTO assignments (
  employer_id,
  title,
  description,
  type,
  category,
  location,
  remote_allowed,
  hourly_rate_cents,
  salary_cents,
  duration_days,
  application_deadline,
  status,
  created_at,
  updated_at
) VALUES 
-- Short assignment
(
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  'Website ontwikkeling - Landing page',
  'We need a landing page for our new product. Must be responsive and SEO optimized.',
  'short',
  'Web Development',
  'Amsterdam',
  true,
  7500, -- €75/hour
  null,
  5,
  now() + interval '7 days',
  'active',
  now(),
  now()
),
-- Permanent assignment
(
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  'Senior Frontend Developer',
  'We are looking for an experienced frontend developer to join our team.',
  'permanent',
  'IT & Development',
  'Utrecht',
  true,
  null,
  6500000, -- €65,000/year
  null,
  now() + interval '30 days',
  'active',
  now(),
  now()
);

-- Create sample transactions for professional
INSERT INTO wallet_transactions (
  wallet_id,
  type,
  amount_cents,
  description,
  created_at
) VALUES 
(
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional_id is the wallet_id
  'earning',
  50000,
  'Website development project',
  now() - interval '1 day'
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1',
  'withdrawal',
  -25000,
  'Withdrawal to bank account',
  now() - interval '3 days'
),
(
  '30cb3659-2242-4e31-a389-90f6a26236d1',
  'earning',
  75000,
  'Mobile app development',
  now() - interval '1 week'
);

-- Create sample reviews
INSERT INTO reviews (
  contract_id,
  reviewer_id,
  reviewed_id,
  rating,
  would_recommend,
  comment,
  is_anonymous,
  created_at,
  updated_at
) VALUES 
-- From employer to professional
(
  gen_random_uuid(),
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  5,
  true,
  'Excellent work! Very professional and delivered on time.',
  false,
  now() - interval '2 days',
  now()
),
(
  gen_random_uuid(),
  '4c12a796-39b7-4ee3-996b-9dab5e65aab2', -- employer@test.com
  '30cb3659-2242-4e31-a389-90f6a26236d1', -- professional@test.com
  4,
  true,
  'Good communication and quality work.',
  false,
  now() - interval '1 week',
  now()
);
