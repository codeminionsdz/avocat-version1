/**
 * AVOCA DEMO DATA - Auth Users Creation Script
 * 
 * This script creates demo auth.users in Supabase for the seed data
 * Run this BEFORE executing demo_seed_data.sql
 * 
 * Requirements:
 * - SUPABASE_SERVICE_ROLE_KEY environment variable
 * - Run with: npx tsx scripts/demo_create_auth_users.ts
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo users configuration
const demoUsers = [
  // Lawyers
  { id: '11111111-1111-1111-1111-111111111111', email: 'karim.benali@demo.avoca.dz', name: 'Karim Benali' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'amina.meziane@demo.avoca.dz', name: 'Amina Meziane' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'yacine.boudjenah@demo.avoca.dz', name: 'Yacine Boudjenah' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'leila.hamidi@demo.avoca.dz', name: 'Leila Hamidi' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'mohamed.saadi@demo.avoca.dz', name: 'Mohamed Saadi' },
  { id: '66666666-6666-6666-6666-666666666666', email: 'farida.khelifi@demo.avoca.dz', name: 'Farida Khelifi' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'rachid.benmoussa@demo.avoca.dz', name: 'Rachid Benmoussa' },
  { id: '88888888-8888-8888-8888-888888888888', email: 'sarah.boukhari@demo.avoca.dz', name: 'Sarah Boukhari' },
  
  // Clients
  { id: 'c1111111-1111-1111-1111-111111111111', email: 'client1@demo.avoca.dz', name: 'Sofiane Cherif' },
  { id: 'c2222222-2222-2222-2222-222222222222', email: 'client2@demo.avoca.dz', name: 'Nadia Ferhat' },
  { id: 'c3333333-3333-3333-3333-333333333333', email: 'client3@demo.avoca.dz', name: 'Mehdi Taleb' },
  { id: 'c4444444-4444-4444-4444-444444444444', email: 'client4@demo.avoca.dz', name: 'Hanane Bouzid' },
  { id: 'c5555555-5555-5555-5555-555555555555', email: 'client5@demo.avoca.dz', name: 'Amine Larbi' },
  { id: 'c6666666-6666-6666-6666-666666666666', email: 'client6@demo.avoca.dz', name: 'Faiza Mansouri' },
  { id: 'c7777777-7777-7777-7777-777777777777', email: 'client7@demo.avoca.dz', name: 'Bilal Hadj' },
  { id: 'c8888888-8888-8888-8888-888888888888', email: 'client8@demo.avoca.dz', name: 'Samira Ziani' },
  { id: 'c9999999-9999-9999-9999-999999999999', email: 'client9@demo.avoca.dz', name: 'Omar Belaidi' },
  { id: 'c0000000-0000-0000-0000-000000000000', email: 'client10@demo.avoca.dz', name: 'Meriem Kaddour' },
]

const DEFAULT_PASSWORD = 'Demo2026!' // Strong password for all demo users

async function createDemoUsers() {
  console.log('🚀 Creating demo auth users in Supabase...\n')

  let successCount = 0
  let errorCount = 0

  for (const user of demoUsers) {
    try {
      // Create user with admin API (service role)
      const { data, error } = await supabase.auth.admin.createUser({
        user_metadata: {
          full_name: user.name
        },
        email: user.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true, // Auto-confirm email
      })

      if (error) {
        // Check if user already exists
        if (error.message.includes('already registered')) {
          console.log(`⚠️  ${user.name} (${user.email}) - Already exists`)
        } else {
          console.error(`❌ ${user.name} (${user.email}) - Error: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`✅ ${user.name} (${user.email})`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ ${user.name} - Unexpected error:`, err)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Successfully created: ${successCount} users`)
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`)
  }
  console.log('='.repeat(60))
  
  console.log('\n📝 NEXT STEPS:')
  console.log('1. Run the SQL seed script in Supabase SQL Editor:')
  console.log('   scripts/demo_seed_data.sql')
  console.log('\n2. All demo users have password: ' + DEFAULT_PASSWORD)
  console.log('   You can login with any demo email address\n')
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('✨ Demo user creation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
