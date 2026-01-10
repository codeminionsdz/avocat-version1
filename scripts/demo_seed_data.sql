-- ============================================
-- AVOCA DEMO DATA - PRESENTATION MODE
-- ============================================
-- WARNING: This is DEMO data for presentation purposes only
-- All data is fictional and should be removed before production
-- ============================================

-- IMPORTANT: BEFORE RUNNING THIS SCRIPT
-- You must first create the auth.users manually in Supabase Dashboard
-- OR use the Supabase service role to create them programmatically
-- The UUIDs in this script must match the auth.users IDs
-- 
-- Quick setup option: Use demo_create_auth_users.ts helper script
-- ============================================

BEGIN;

-- ============================================
-- 1. DEMO LAWYERS (8 lawyers across Algeria)
-- ============================================

-- Note: These insert into auth.users which may require service role
-- For Supabase, you may need to create these users via the dashboard first
-- Then update their profiles here
-- See demo_create_auth_users.ts for automated user creation

-- Assuming auth users already exist, we'll insert profiles and lawyer_profiles
-- You'll need to replace these UUIDs with actual user IDs from your auth.users table
-- Note: Email is stored in auth.users, not in profiles table

-- Lawyer 1: Karim Benali - Criminal Law Specialist (Algiers)
-- Email: karim.benali@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Karim Benali', '0661234567', 'alger', 'lawyer', NOW() - INTERVAL '180 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ALG-BAR-2019-4521',
  ARRAY['criminal', 'civil']::text[],
  'Avocat spécialisé en droit pénal avec plus de 15 ans d''expérience. Je défends vos droits avec rigueur et professionnalisme.',
  15,
  4.8,
  47,
  true,
  'active',
  ARRAY['first_instance', 'appeal', 'supreme_court']::text[],
  36.7538,
  3.0588,
  true,
  'Cabinet d''Avocats Benali, Rue Didouche Mourad, Alger Centre'
);

-- Lawyer 2: Amina Meziane - Family Law Expert (Oran)
-- Email: amina.meziane@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Amina Meziane', '0662345678', 'oran', 'lawyer', NOW() - INTERVAL '150 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'ORA-BAR-2015-3892',
  ARRAY['family', 'civil']::text[],
  'Avocate en droit de la famille. J''accompagne mes clients avec empathie dans les moments difficiles: divorce, garde d''enfants, héritage.',
  10,
  4.9,
  63,
  true,
  'active',
  ARRAY['first_instance', 'appeal']::text[],
  35.6969,
  -0.6331,
  true,
  'Cabinet Meziane, Boulevard de la Soummam, Oran'
);

-- Lawyer 3: Yacine Boudjenah - Commercial Law (Constantine)
-- Email: yacine.boudjenah@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Yacine Boudjenah', '0663456789', 'constantine', 'lawyer', NOW() - INTERVAL '200 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'CST-BAR-2012-2871',
  ARRAY['commercial', 'civil']::text[],
  'Conseil juridique pour entreprises et startups. Spécialisé en contrats commerciaux, création de société, et litiges commerciaux.',
  12,
  4.7,
  38,
  true,
  'active',
  ARRAY['first_instance', 'appeal']::text[],
  36.3650,
  6.6147,
  true,
  'Cabinet Boudjenah & Associés, Place des Martyrs, Constantine'
);

-- Lawyer 4: Leila Hamidi - Labor Law (Annaba)
-- Email: leila.hamidi@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('44444444-4444-4444-4444-444444444444', 'Leila Hamidi', '0664567890', 'annaba', 'lawyer', NOW() - INTERVAL '120 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'ANB-BAR-2016-5643',
  ARRAY['labor', 'administrative']::text[],
  'Défense des droits des travailleurs. Licenciement abusif, harcèlement, accidents de travail. Je vous aide à faire valoir vos droits.',
  8,
  4.6,
  29,
  true,
  'active',
  ARRAY['first_instance']::text[],
  36.9000,
  7.7667,
  true,
  'Cabinet Hamidi, Avenue de la Révolution, Annaba'
);

-- Lawyer 5: Mohamed Saadi - Administrative Law (Sétif)
-- Email: mohamed.saadi@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('55555555-5555-5555-5555-555555555555', 'Mohamed Saadi', '0665678901', 'setif', 'lawyer', NOW() - INTERVAL '250 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  'SET-BAR-2008-1234',
  ARRAY['administrative', 'civil']::text[],
  'Avocat au Conseil d''État. Spécialisé en contentieux administratif, litiges avec l''administration, et marchés publics.',
  18,
  4.9,
  52,
  true,
  'active',
  ARRAY['first_instance', 'appeal', 'council_of_state']::text[],
  36.1905,
  5.4139,
  true,
  'Cabinet Saadi, Centre-ville, Sétif'
);

-- Lawyer 6: Farida Khelifi - Criminal & Family (Blida)
-- Email: farida.khelifi@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('66666666-6666-6666-6666-666666666666', 'Farida Khelifi', '0666789012', 'blida', 'lawyer', NOW() - INTERVAL '90 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  'BLI-BAR-2018-7821',
  ARRAY['criminal', 'family']::text[],
  'Avocate passionnée par la défense pénale et le droit familial. Accompagnement humain et professionnel de A à Z.',
  6,
  4.5,
  21,
  true,
  'active',
  ARRAY['first_instance', 'appeal']::text[],
  36.4700,
  2.8300,
  true,
  'Cabinet Khelifi, Boulevard Larbi Tebessi, Blida'
);

-- Lawyer 7: Rachid Benmoussa - Commercial Law (Tlemcen)
-- Email: rachid.benmoussa@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('77777777-7777-7777-7777-777777777777', 'Rachid Benmoussa', '0667890123', 'tlemcen', 'lawyer', NOW() - INTERVAL '300 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  'TLM-BAR-2010-4567',
  ARRAY['commercial', 'civil']::text[],
  'Expert en droit des affaires et contentieux commercial. Plus de 20 ans d''expérience au service des entreprises.',
  22,
  4.8,
  71,
  true,
  'active',
  ARRAY['first_instance', 'appeal', 'supreme_court']::text[],
  34.8780,
  -1.3150,
  false,
  'Cabinet Benmoussa, Centre-ville, Tlemcen'
);

-- Lawyer 8: Sarah Boukhari - Family & Civil (Batna)
-- Email: sarah.boukhari@demo.avoca.dz
INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('88888888-8888-8888-8888-888888888888', 'Sarah Boukhari', '0668901234', 'batna', 'lawyer', NOW() - INTERVAL '60 days');

INSERT INTO public.lawyer_profiles (
  id, bar_number, specialties, bio, years_of_experience, 
  rating, consultations_count, is_available, status, 
  authorized_courts, latitude, longitude, location_visibility, office_address
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  'BAT-BAR-2020-9012',
  ARRAY['family', 'civil']::text[],
  'Jeune avocate dynamique. Spécialisée en droit de la famille et successions. Disponible et à l''écoute.',
  4,
  4.7,
  15,
  true,
  'active',
  ARRAY['first_instance']::text[],
  35.5559,
  6.1740,
  true,
  'Cabinet Boukhari, Rue de l''Indépendance, Batna'
);

-- ============================================
-- 2. DEMO CLIENTS (10 clients)
-- ============================================
-- Emails: client1-10@demo.avoca.dz

INSERT INTO public.profiles (id, full_name, phone, city, role, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Sofiane Cherif', '0671234567', 'alger', 'client', NOW() - INTERVAL '25 days'),
('c2222222-2222-2222-2222-222222222222', 'Nadia Ferhat', '0672345678', 'oran', 'client', NOW() - INTERVAL '18 days'),
('c3333333-3333-3333-3333-333333333333', 'Mehdi Taleb', '0673456789', 'constantine', 'client', NOW() - INTERVAL '22 days'),
('c4444444-4444-4444-4444-444444444444', 'Hanane Bouzid', '0674567890', 'annaba', 'client', NOW() - INTERVAL '12 days'),
('c5555555-5555-5555-5555-555555555555', 'Amine Larbi', '0675678901', 'setif', 'client', NOW() - INTERVAL '28 days'),
('c6666666-6666-6666-6666-666666666666', 'Faiza Mansouri', '0676789012', 'blida', 'client', NOW() - INTERVAL '8 days'),
('c7777777-7777-7777-7777-777777777777', 'Bilal Hadj', '0677890123', 'tlemcen', 'client', NOW() - INTERVAL '15 days'),
('c8888888-8888-8888-8888-888888888888', 'Samira Ziani', '0678901234', 'batna', 'client', NOW() - INTERVAL '5 days'),
('c9999999-9999-9999-9999-999999999999', 'Omar Belaidi', '0679012345', 'alger', 'client', NOW() - INTERVAL '20 days'),
('c0000000-0000-0000-0000-000000000000', 'Meriem Kaddour', '0670123456', 'oran', 'client', NOW() - INTERVAL '10 days');

-- ============================================
-- 3. ACTIVE SUBSCRIPTIONS FOR LAWYERS
-- ============================================

INSERT INTO public.subscriptions (lawyer_id, plan, amount, status, starts_at, ends_at, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'annual', 15000, 'active', NOW() - INTERVAL '180 days', NOW() + INTERVAL '185 days', NOW() - INTERVAL '180 days'),
('22222222-2222-2222-2222-222222222222', 'annual', 15000, 'active', NOW() - INTERVAL '150 days', NOW() + INTERVAL '215 days', NOW() - INTERVAL '150 days'),
('33333333-3333-3333-3333-333333333333', 'annual', 15000, 'active', NOW() - INTERVAL '200 days', NOW() + INTERVAL '165 days', NOW() - INTERVAL '200 days'),
('44444444-4444-4444-4444-444444444444', 'annual', 15000, 'active', NOW() - INTERVAL '120 days', NOW() + INTERVAL '245 days', NOW() - INTERVAL '120 days'),
('55555555-5555-5555-5555-555555555555', 'annual', 15000, 'active', NOW() - INTERVAL '250 days', NOW() + INTERVAL '115 days', NOW() - INTERVAL '250 days'),
('66666666-6666-6666-6666-666666666666', 'annual', 15000, 'active', NOW() - INTERVAL '90 days', NOW() + INTERVAL '275 days', NOW() - INTERVAL '90 days'),
('77777777-7777-7777-7777-777777777777', 'annual', 15000, 'active', NOW() - INTERVAL '300 days', NOW() + INTERVAL '65 days', NOW() - INTERVAL '300 days'),
('88888888-8888-8888-8888-888888888888', 'annual', 15000, 'active', NOW() - INTERVAL '60 days', NOW() + INTERVAL '305 days', NOW() - INTERVAL '60 days');

-- ============================================
-- 4. LEGAL INSIGHTS (12 educational posts)
-- ============================================

INSERT INTO public.legal_insights (lawyer_id, category, title, content, is_published, helpful_count, not_helpful_count, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'criminal',
  'Garde à vue en Algérie: vos droits essentiels',
  'En cas de garde à vue, vous avez le droit de rester silencieux, de demander un avocat dès les premières heures, et d''informer un proche. La durée maximale est de 48h, extensible à 12 jours pour certaines infractions. Ne signez rien sans avocat.',
  true,
  24,
  2,
  NOW() - INTERVAL '12 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'family',
  'Procédure de divorce en Algérie: ce qu''il faut savoir',
  'Le divorce peut être judiciaire (khol3, chiqaq) ou consensuel. La garde des enfants est généralement accordée à la mère jusqu''à 10 ans (garçon) ou mariage (fille). La pension alimentaire est obligatoire. Comptez 6-18 mois de procédure selon les cas.',
  true,
  45,
  3,
  NOW() - INTERVAL '10 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'commercial',
  'Risques juridiques lors de la création d''une SARL',
  'La création d''une SARL nécessite un capital minimum de 100,000 DZD. Attention aux responsabilités des gérants: faute de gestion peut engager leur responsabilité personnelle. Rédigez des statuts clairs concernant la répartition des bénéfices et les modalités de sortie.',
  true,
  18,
  1,
  NOW() - INTERVAL '8 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'labor',
  'Licenciement abusif: comment réagir?',
  'Un licenciement sans motif réel et sérieux est abusif. Vous avez 2 mois pour saisir l''inspection du travail. Les indemnités peuvent inclure: préavis, congés, licenciement, et dommages-intérêts. Conservez tous les documents (contrat, bulletins de paie, courriers).',
  true,
  32,
  2,
  NOW() - INTERVAL '6 days'
),
(
  '55555555-5555-5555-5555-555555555555',
  'administrative',
  'Contentieux avec l''administration: délais et procédures',
  'Le recours gracieux doit être déposé dans les 4 mois suivant la décision. Le recours contentieux dans les 2 mois après rejet du gracieux. Le Conseil d''État juge en dernier ressort. Un avocat spécialisé est fortement recommandé.',
  true,
  15,
  0,
  NOW() - INTERVAL '13 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'family',
  'Succession en Algérie: règles et partage',
  'La succession suit le droit musulman. Les héritiers réservataires sont: enfants, conjoint, parents. Les filles héritent la moitié de la part des garçons. Le testament (wasiya) est limité à 1/3 du patrimoine pour les non-héritiers. Notaire obligatoire.',
  true,
  38,
  4,
  NOW() - INTERVAL '11 days'
),
(
  '77777777-7777-7777-7777-777777777777',
  'commercial',
  'Contrats commerciaux: clauses à ne jamais oublier',
  'Tout contrat doit préciser: objet, prix, délais, pénalités de retard, clause résolutoire, juridiction compétente. Attention aux clauses abusives. La loi protège la partie faible. Faites relire vos contrats par un avocat avant signature.',
  true,
  21,
  1,
  NOW() - INTERVAL '9 days'
),
(
  '11111111-1111-1111-1111-111111111111',
  'criminal',
  'Plainte pour escroquerie: mode d''emploi',
  'Vous pouvez déposer plainte au commissariat ou directement auprès du procureur. Rassemblez toutes les preuves: messages, contrats, virements. L''escroquerie est punie de 1 à 5 ans de prison et d''une amende. Le préjudice financier peut être récupéré par constitution de partie civile.',
  true,
  28,
  2,
  NOW() - INTERVAL '7 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'labor',
  'Accident de travail: vos droits et démarches',
  'L''employeur doit déclarer l''accident dans les 48h à la CNAS. Vous avez droit aux soins gratuits, indemnités journalières (80-100% du salaire), et réparation du préjudice si faute de l''employeur. Consultez un avocat pour évaluer l''indemnisation.',
  true,
  19,
  1,
  NOW() - INTERVAL '5 days'
),
(
  '66666666-6666-6666-6666-666666666666',
  'family',
  'Pension alimentaire: calcul et recouvrement',
  'Le montant dépend des besoins de l''enfant et des ressources du débiteur. En cas de non-paiement, saisie sur salaire possible. Le recouvrement peut être confié au Trésor Public. Vous pouvez demander une révision du montant en cas de changement de situation.',
  true,
  26,
  3,
  NOW() - INTERVAL '4 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'commercial',
  'Protection de la propriété intellectuelle pour startups',
  'Déposez votre marque à l''INAPI dès le lancement. Protégez vos créations (logiciels, designs) par le droit d''auteur. Les brevets protègent les inventions techniques. Attention à la contrefaçon: action en justice possible. Coût: 10,000-50,000 DZD selon le type.',
  true,
  14,
  0,
  NOW() - INTERVAL '3 days'
),
(
  '88888888-8888-8888-8888-888888888888',
  'civil',
  'Achat immobilier: précautions juridiques',
  'Vérifiez l''origine de propriété (certificat de propriété). Exigez un acte notarié. Contrôlez l''absence d''hypothèques. Le vendeur doit fournir: acte de propriété, quitus fiscal, certificat de non-hypothèque. Prévoyez 5-7% de frais de notaire et taxes.',
  true,
  30,
  2,
  NOW() - INTERVAL '2 days'
);

-- ============================================
-- 5. CONSULTATIONS (15 consultation requests)
-- ============================================

-- Status: completed (4)
INSERT INTO public.consultations (client_id, lawyer_id, category, description, status, consultation_type, lawyer_notes, created_at, updated_at) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'criminal',
  'J''ai reçu une convocation au commissariat pour une affaire d''escroquerie dont je suis victime. J''ai besoin de conseils sur mes droits et la procédure à suivre.',
  'completed',
  'chat',
  'Client orienté sur la constitution de partie civile. Documents préparés. Dossier solide.',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '18 days'
),
(
  'c2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'family',
  'Je souhaite divorcer après 8 ans de mariage. Nous avons 2 enfants. Mon mari refuse le divorce à l''amiable. Quelles sont mes options?',
  'completed',
  'in_person',
  'Divorce pour préjudice (chiqaq) engagé. Garde des enfants demandée. Pension alimentaire fixée à 30,000 DZD/mois.',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '10 days'
),
(
  'c5555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'labor',
  'Mon employeur veut me licencier sans raison valable. Je travaille dans l''entreprise depuis 5 ans. Ai-je un recours?',
  'completed',
  'phone',
  'Licenciement abusif confirmé. Négociation avec employeur réussie: 600,000 DZD d''indemnités + certificat de travail.',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '8 days'
),
(
  'c7777777-7777-7777-7777-777777777777',
  '77777777-7777-7777-7777-777777777777',
  'commercial',
  'Je lance une startup dans le e-commerce. J''ai besoin d''aide pour choisir la forme juridique et rédiger les statuts.',
  'completed',
  'chat',
  'SARL créée avec succès. Statuts rédigés. Capital: 100,000 DZD. Enregistrement au CNRC finalisé.',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '15 days'
);

-- Status: accepted (5)
INSERT INTO public.consultations (client_id, lawyer_id, category, description, status, consultation_type, lawyer_notes, created_at, updated_at) VALUES
(
  'c3333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'commercial',
  'Mon partenaire commercial ne respecte pas nos accords. Le contrat est flou sur certains points. Comment faire valoir mes droits?',
  'accepted',
  'in_person',
  'RDV prévu pour étude du contrat. Possibilité de mise en demeure puis tribunal de commerce.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days'
),
(
  'c4444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'family',
  'Mon ex-mari ne paie plus la pension alimentaire depuis 6 mois. Mes enfants en souffrent. Que puis-je faire?',
  'accepted',
  'chat',
  'Demande de recouvrement par Trésor Public en cours. Mise en demeure envoyée.',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 days'
),
(
  'c6666666-6666-6666-6666-666666666666',
  '88888888-8888-8888-8888-888888888888',
  'family',
  'Succession de mon père: conflits avec mes frères sur le partage. Comment résoudre ce litige familial?',
  'accepted',
  'phone',
  'Médiation familiale proposée avant procédure judiciaire. Inventaire des biens en cours.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days'
),
(
  'c8888888-8888-8888-8888-888888888888',
  '44444444-4444-4444-4444-444444444444',
  'labor',
  'J''ai eu un accident de travail il y a 3 mois. La CNAS tarde à traiter mon dossier. Comment accélérer?',
  'accepted',
  'chat',
  'Relance CNAS avec courrier recommandé. Préparation recours si refus. Consolidation à prévoir.',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days'
),
(
  'c9999999-9999-9999-9999-999999999999',
  '11111111-1111-1111-1111-111111111111',
  'criminal',
  'Je suis accusé à tort de vol par mon employeur. Il menace de porter plainte. Comment me défendre?',
  'accepted',
  'in_person',
  'Rassemblement des preuves d''innocence. Préparation défense si garde à vue.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
);

-- Status: pending (6 - new requests waiting for lawyer response)
INSERT INTO public.consultations (client_id, lawyer_id, category, description, status, consultation_type, created_at) VALUES
(
  'c0000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'family',
  'Je veux modifier la garde de mes enfants car mon ex a déménagé dans une autre wilaya. Est-ce possible?',
  'pending',
  'chat',
  NOW() - INTERVAL '1 day'
),
(
  'c1111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  'administrative',
  'La mairie refuse mon permis de construire sans raison valable. Puis-je contester cette décision?',
  'pending',
  'phone',
  NOW() - INTERVAL '2 days'
),
(
  'c2222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'commercial',
  'Mon fournisseur ne livre pas les marchandises commandées malgré le paiement. Que faire?',
  'pending',
  'chat',
  NOW() - INTERVAL '1 day'
),
(
  'c3333333-3333-3333-3333-333333333333',
  '66666666-6666-6666-6666-666666666666',
  'criminal',
  'Mon voisin porte plainte contre moi pour des faits que je n''ai pas commis. Comment prouver mon innocence?',
  'pending',
  'in_person',
  NOW() - INTERVAL '3 days'
),
(
  'c4444444-4444-4444-4444-444444444444',
  '77777777-7777-7777-7777-777777777777',
  'commercial',
  'Je veux créer une SPA (société par actions). Quelles sont les démarches et le coût?',
  'pending',
  'chat',
  NOW() - INTERVAL '12 hours'
),
(
  'c5555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'labor',
  'Mon patron me harcèle moralement au travail. Insultes quotidiennes, pression excessive. Quels sont mes recours?',
  'pending',
  'phone',
  NOW() - INTERVAL '6 hours'
);

-- ============================================
-- 6. MESSAGES (Sample chat messages for accepted consultations)
-- ============================================

-- Messages for consultation 'c3333333...' with lawyer '33333333...'
INSERT INTO public.messages (consultation_id, sender_id, content, created_at) VALUES
-- Get consultation ID first (you'll need to update this with actual IDs)
((SELECT id FROM consultations WHERE client_id = 'c3333333-3333-3333-3333-333333333333' AND lawyer_id = '33333333-3333-3333-3333-333333333333'),
 'c3333333-3333-3333-3333-333333333333',
 'Bonjour Maître, merci d''accepter ma demande.',
 NOW() - INTERVAL '5 days'),
 
((SELECT id FROM consultations WHERE client_id = 'c3333333-3333-3333-3333-333333333333' AND lawyer_id = '33333333-3333-3333-3333-333333333333'),
 '33333333-3333-3333-3333-333333333333',
 'Bonjour. Pouvez-vous m''envoyer une copie du contrat commercial?',
 NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
 
((SELECT id FROM consultations WHERE client_id = 'c3333333-3333-3333-3333-333333333333' AND lawyer_id = '33333333-3333-3333-3333-333333333333'),
 'c3333333-3333-3333-3333-333333333333',
 'Oui bien sûr. Je vous l''envoie par email.',
 NOW() - INTERVAL '5 days' + INTERVAL '1 hour');

COMMIT;

-- ============================================
-- CLEANUP INSTRUCTIONS
-- ============================================
-- To remove all demo data later, run these in reverse order:
-- 
-- DELETE FROM public.messages WHERE consultation_id IN (
--   SELECT id FROM public.consultations WHERE client_id LIKE 'c%'
-- );
-- 
-- DELETE FROM public.consultations WHERE client_id LIKE 'c%' OR lawyer_id LIKE '%-%';
-- 
-- DELETE FROM public.legal_insights WHERE lawyer_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333',
--   '44444444-4444-4444-4444-444444444444',
--   '55555555-5555-5555-5555-555555555555',
--   '66666666-6666-6666-6666-666666666666',
--   '77777777-7777-7777-7777-777777777777',
--   '88888888-8888-8888-8888-888888888888'
-- );
-- 
-- DELETE FROM public.subscriptions WHERE lawyer_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333',
--   '44444444-4444-4444-4444-444444444444',
--   '55555555-5555-5555-5555-555555555555',
--   '66666666-6666-6666-6666-666666666666',
--   '77777777-7777-7777-7777-777777777777',
--   '88888888-8888-8888-8888-888888888888'
-- );
-- 
-- DELETE FROM public.lawyer_profiles WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333',
--   '44444444-4444-4444-4444-444444444444',
--   '55555555-5555-5555-5555-555555555555',
--   '66666666-6666-6666-6666-666666666666',
--   '77777777-7777-7777-7777-777777777777',
--   '88888888-8888-8888-8888-888888888888'
-- );
-- 
-- DELETE FROM public.profiles WHERE id LIKE '%1111111%' OR id LIKE 'c%';
-- 
-- -- Then delete from auth.users (requires service role or Supabase Dashboard)
-- -- Look for emails: *@demo.avoca.dz and client1-10@demo.avoca.dz
-- ============================================
