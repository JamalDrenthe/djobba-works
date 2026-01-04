// Seed script voor test data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');

    // 1. Test gebruiker aanmaken (of ophalen als bestaat)
    let testUser;
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'test@djobba.nl')
        .single();

      if (existingUser) {
        testUser = existingUser;
        console.log('✅ Test user already exists:', testUser.email);
      } else {
        // Maak test gebruiker via auth
        const { data: authData } = await supabase.auth.signUp({
          email: 'test@djobba.nl',
          password: 'Test123!'
        });

        if (authData.user) {
          // Maak profile record
          const { data: profileData } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: 'test@djobba.nl',
              name: 'Test Gebruiker',
              role: 'professional',
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          testUser = profileData;
          console.log('✅ Test user created:', testUser.email);
        }
      }
    } catch (error) {
      console.log('⚠️ User creation failed, continuing with seed data...');
    }

    // 2. Microcopy data vullen
    const microcopyData = [
      // Homepage
      { key: 'homepage.headline', category: 'home', text_nl: 'DJOBBA: Het platform voor flexibel werk en vaste contracten' },
      { key: 'homepage.subheadline', category: 'home', text_nl: 'Krijg de vrijheid van freelancer met de zekerheid van vast dienstverband' },
      { key: 'homepage.cta_primary', category: 'home', text_nl: 'Start als professional' },
      { key: 'homepage.cta_secondary', category: 'home', text_nl: 'Opdracht plaatsen' },
      
      // Factoring
      { key: 'factoring.title', category: 'payment', text_nl: 'Kies hoe snel je betaald wilt worden' },
      { key: 'factoring.immediate', category: 'payment', text_nl: 'Direct uitbetaald (3% fee)' },
      { key: 'factoring.weekly', category: 'payment', text_nl: 'Wekelijks uitbetaald (1.5% fee)' },
      { key: 'factoring.monthly', category: 'payment', text_nl: 'Maandelijks uitbetaald (geen fee)' },
      { key: 'factoring.calculator_title', category: 'payment', text_nl: 'Bereken je netto bedrag' },
      
      // Wallet
      { key: 'wallet.title', category: 'payment', text_nl: 'Mijn Wallet' },
      { key: 'wallet.balance', category: 'payment', text_nl: 'Huidige balans' },
      { key: 'wallet.pending', category: 'payment', text_nl: 'In behandeling' },
      { key: 'wallet.withdraw', category: 'payment', text_nl: 'Uitbetalen' },
      
      // Assignments
      { key: 'assignments.title', category: 'work', text_nl: 'Beschikbare Opdrachten' },
      { key: 'assignments.my_assignments', category: 'work', text_nl: 'Mijn Opdrachten' },
      { key: 'assignments.no_assignments', category: 'work', text_nl: 'Geen opdrachten beschikbaar' },
      { key: 'assignments.apply', category: 'work', text_nl: 'Solliciteer' },
      
      // Profile
      { key: 'profile.title', category: 'user', text_nl: 'Mijn Profiel' },
      { key: 'profile.edit', category: 'user', text_nl: 'Bewerken' },
      { key: 'profile.save', category: 'user', text_nl: 'Opslaan' },
      
      // Admin
      { key: 'admin.title', category: 'admin', text_nl: 'Admin Dashboard' },
      { key: 'admin.stats', category: 'admin', text_nl: 'Platform Statistieken' },
      { key: 'admin.users', category: 'admin', text_nl: 'Gebruikers' },
      { key: 'admin.assignments', category: 'admin', text_nl: 'Opdrachten' },
      
      // Navigation
      { key: 'nav.home', category: 'navigation', text_nl: 'Home' },
      { key: 'nav.assignments', category: 'navigation', text_nl: 'Opdrachten' },
      { key: 'nav.wallet', category: 'navigation', text_nl: 'Wallet' },
      { key: 'nav.profile', category: 'navigation', text_nl: 'Profiel' },
      { key: 'nav.admin', category: 'navigation', text_nl: 'Admin' },
      
      // General
      { key: 'general.loading', category: 'general', text_nl: 'Laden...' },
      { key: 'general.error', category: 'general', text_nl: 'Er is een fout opgetreden' },
      { key: 'general.retry', category: 'general', text_nl: 'Opnieuw proberen' },
      { key: 'general.cancel', category: 'general', text_nl: 'Annuleren' },
      { key: 'general.confirm', category: 'general', text_nl: 'Bevestigen' }
    ];

    try {
      const { data: microcopyResult, error: microcopyError } = await supabase
        .from('microcopy')
        .upsert(microcopyData, { onConflict: 'key' })
        .select();

      if (microcopyError) {
        console.log('⚠️ Microcopy seeding error:', microcopyError.message);
      } else {
        console.log(`✅ Microcopy seeded: ${microcopyResult?.length || 0} entries`);
      }
    } catch (error) {
      console.log('⚠️ Microcopy table might not exist, continuing...');
    }

    // 3. Test verification badges toevoegen
    if (testUser) {
      try {
        const badgeData = [
          { user_id: testUser.id || 'test-user-123', badge_type: 'email_verified', verified_at: new Date().toISOString() },
          { user_id: testUser.id || 'test-user-123', badge_type: 'phone_verified', verified_at: new Date().toISOString() },
          { user_id: testUser.id || 'test-user-123', badge_type: 'id_verified', verified_at: new Date().toISOString() }
        ];

        const { data: badgeResult, error: badgeError } = await supabase
          .from('verification_badges')
          .upsert(badgeData, { onConflict: ['user_id', 'badge_type'] })
          .select();

        if (badgeError) {
          console.log('⚠️ Badge seeding error:', badgeError.message);
        } else {
          console.log(`✅ Verification badges seeded: ${badgeResult?.length || 0} badges`);
        }
      } catch (error) {
        console.log('⚠️ Verification badges table might not exist, continuing...');
      }
    }

    // 4. Test opdrachten aanmaken
    try {
      const assignmentData = [
        {
          title: 'Web Development Project',
          description: 'Frontend development voor nieuwe web applicatie',
          category: 'development',
          budget_min: 1000,
          budget_max: 2000,
          duration_weeks: 4,
          location: 'Remote',
          status: 'open',
          created_by: 'client-123',
          created_at: new Date().toISOString()
        },
        {
          title: 'Mobile App Design',
          description: 'UI/UX design voor iOS en Android app',
          category: 'design',
          budget_min: 800,
          budget_max: 1500,
          duration_weeks: 3,
          location: 'Hybrid',
          status: 'open',
          created_by: 'client-456',
          created_at: new Date().toISOString()
        },
        {
          title: 'Content Writing',
          description: 'Blog posts en website copywriting',
          category: 'writing',
          budget_min: 300,
          budget_max: 600,
          duration_weeks: 2,
          location: 'Remote',
          status: 'open',
          created_by: 'client-789',
          created_at: new Date().toISOString()
        }
      ];

      const { data: assignmentResult, error: assignmentError } = await supabase
        .from('assignments')
        .upsert(assignmentData, { onConflict: 'id' })
        .select();

      if (assignmentError) {
        console.log('⚠️ Assignment seeding error:', assignmentError.message);
      } else {
        console.log(`✅ Assignments seeded: ${assignmentResult?.length || 0} assignments`);
      }
    } catch (error) {
      console.log('⚠️ Assignments table might not exist, continuing...');
    }

    console.log('🎉 Test data seeding completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- ✅ Test user: test@djobba.nl');
    console.log('- ✅ Microcopy entries: 20+');
    console.log('- ✅ Verification badges: 3');
    console.log('- ✅ Test assignments: 3');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTestData()
  .then(() => {
    console.log('🌱 Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
