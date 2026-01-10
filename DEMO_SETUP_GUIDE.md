# Avoca Demo Data Setup Guide

## Overview

This guide helps you populate your Avoca database with realistic demo data for presentations and testing.

## 📦 What's Included

- **8 Lawyers** across different Algerian cities with specialties
- **10 Clients** with realistic Algerian names
- **12 Legal Insights** (educational posts)
- **15 Consultations** (4 completed, 5 accepted, 6 pending)
- **Sample chat messages**
- **Active subscriptions** for all lawyers

## 🚀 Quick Start (2 Steps)

### Step 1: Create Auth Users

First, create the authentication users in Supabase:

```bash
# Set your Supabase service role key (from Supabase Dashboard > Settings > API)
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the user creation script
npx tsx scripts/demo_create_auth_users.ts
```

**Expected output:**
```
✅ Karim Benali (karim.benali@demo.avoca.dz)
✅ Amina Meziane (amina.meziane@demo.avoca.dz)
...
✅ Successfully created: 18 users
```

### Step 2: Run SQL Seed Script

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content of `scripts/demo_seed_data.sql`
3. Paste and execute

**That's it!** Your database now has realistic demo data.

## 🔑 Demo User Credentials

All demo users share the same password: **`Demo2026!`**

### Lawyer Logins

| Email | Name | City | Specialty |
|-------|------|------|-----------|
| karim.benali@demo.avoca.dz | Karim Benali | Alger | Criminal, Civil |
| amina.meziane@demo.avoca.dz | Amina Meziane | Oran | Family, Civil |
| yacine.boudjenah@demo.avoca.dz | Yacine Boudjenah | Constantine | Commercial, Civil |
| leila.hamidi@demo.avoca.dz | Leila Hamidi | Annaba | Labor, Administrative |
| mohamed.saadi@demo.avoca.dz | Mohamed Saadi | Sétif | Administrative, Civil |
| farida.khelifi@demo.avoca.dz | Farida Khelifi | Blida | Criminal, Family |
| rachid.benmoussa@demo.avoca.dz | Rachid Benmoussa | Tlemcen | Commercial, Civil |
| sarah.boukhari@demo.avoca.dz | Sarah Boukhari | Batna | Family, Civil |

### Client Logins

| Email | Name | City |
|-------|------|------|
| client1@demo.avoca.dz | Sofiane Cherif | Alger |
| client2@demo.avoca.dz | Nadia Ferhat | Oran |
| client3@demo.avoca.dz | Mehdi Taleb | Constantine |
| client4@demo.avoca.dz | Hanane Bouzid | Annaba |
| client5@demo.avoca.dz | Amine Larbi | Sétif |
| client6@demo.avoca.dz | Faiza Mansouri | Blida |
| client7@demo.avoca.dz | Bilal Hadj | Tlemcen |
| client8@demo.avoca.dz | Samira Ziani | Batna |
| client9@demo.avoca.dz | Omar Belaidi | Alger |
| client10@demo.avoca.dz | Meriem Kaddour | Oran |

## 📊 Demo Data Details

### Legal Insights Topics

1. Garde à vue en Algérie: vos droits essentiels
2. Procédure de divorce en Algérie: ce qu'il faut savoir
3. Risques juridiques lors de la création d'une SARL
4. Licenciement abusif: comment réagir?
5. Contentieux avec l'administration: délais et procédures
6. Succession en Algérie: règles et partage
7. Contrats commerciaux: clauses à ne jamais oublier
8. Plainte pour escroquerie: mode d'emploi
9. Accident de travail: vos droits et démarches
10. Pension alimentaire: calcul et recouvrement
11. Protection de la propriété intellectuelle pour startups
12. Achat immobilier: précautions juridiques

### Consultation Statuses

- **Completed (4)**: Show successful lawyer-client interactions
- **Accepted (5)**: Active consultations with lawyer notes
- **Pending (6)**: Fresh consultation requests waiting for lawyers

## 🧹 Cleanup (Remove Demo Data)

When you're done with the presentation, run this in Supabase SQL Editor:

```sql
-- Delete messages
DELETE FROM public.messages WHERE consultation_id IN (
  SELECT id FROM public.consultations WHERE client_id LIKE 'c%'
);

-- Delete consultations
DELETE FROM public.consultations WHERE client_id LIKE 'c%' OR lawyer_id LIKE '%-%';

-- Delete insights
DELETE FROM public.legal_insights WHERE lawyer_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Delete subscriptions
DELETE FROM public.subscriptions WHERE lawyer_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Delete lawyer profiles
DELETE FROM public.lawyer_profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Delete profiles
DELETE FROM public.profiles WHERE id LIKE '%1111111%' OR id LIKE 'c%';
```

Then delete the auth users from **Supabase Dashboard → Authentication → Users** (filter by `@demo.avoca.dz`).

## ⚠️ Important Notes

- **Not for production**: This is demo data only
- **Fictional data**: All names, phone numbers, and addresses are fictional
- **Fixed UUIDs**: The script uses predefined UUIDs for consistency
- **Emails auto-confirmed**: All users can login immediately

## 🔧 Troubleshooting

### Error: "column 'email' does not exist"

✅ Fixed! The updated script no longer includes email in profiles table.

### Error: "duplicate key value violates unique constraint"

Users already exist. Either:
- Skip user creation (they're already there)
- Delete existing demo users first
- Use different UUIDs

### Error: "SUPABASE_SERVICE_ROLE_KEY not found"

Get your service role key from:
**Supabase Dashboard → Settings → API → service_role (secret)**

⚠️ Never commit this key to version control!

## 📝 Files

- `demo_create_auth_users.ts` - Creates auth.users (TypeScript)
- `demo_seed_data.sql` - Populates profiles, lawyers, clients, insights, consultations
- `DEMO_SETUP_GUIDE.md` - This file

## 🎯 For Presentation

The demo data makes your app look:
- **Active**: Recent insights, pending consultations
- **Credible**: Professional lawyer profiles with experience
- **Diverse**: Multiple cities, specialties, and case types
- **Realistic**: Algerian names, cities, legal scenarios

Good luck with your national committee presentation! 🇩🇿
