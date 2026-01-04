# 🔐 SECURITY & AUTH FLOW AUDIT REPORT
## QR → SIGNUP → CONSULTATION VERIFICATION

**Audit Date**: 2026-01-04  
**Audited By**: GitHub Copilot (Claude Sonnet 4.5)  
**Status**: ⚠️ **1 CRITICAL VULNERABILITY FOUND + FIX PROVIDED**

---

## 📋 EXECUTIVE SUMMARY

| Component | Status | Severity | Action Required |
|-----------|--------|----------|-----------------|
| **Client Registration** | ✅ SECURE | - | Already fixed (role hardcoded) |
| **Login Page** | ❌ VULNERABLE | **CRITICAL** | **FIX REQUIRED** (still accepts role param) |
| **Public Lawyer Profile** | ✅ SECURE | - | No auth required to view |
| **Consultation Modal** | ✅ SECURE | - | Auth gate works correctly |
| **Database Trigger** | ⚠️ RISKY | HIGH | Uses raw_user_meta_data (relies on frontend) |
| **RLS Policy** | ✅ SECURE | - | New policy blocks role updates |
| **Lawyer Registration** | ✅ SECURE | - | No role parameter, only updates existing users |

---

## 🚨 CRITICAL VULNERABILITY: LOGIN PAGE ACCEPTS ROLE PARAMETER

### **Location**: [app/auth/login/page.tsx](app/auth/login/page.tsx#L18)

### **Vulnerable Code**:
```typescript
const role = searchParams.get("role") || "client"  // ❌ ACCEPTS 'lawyer' FROM URL

// Later in the code:
if (role === "lawyer" && userRole !== "lawyer") {
  setError("This account is not registered as a lawyer")
  await supabase.auth.signOut()
  return
}
```

### **Problem**:
While this code VALIDATES roles (which is good), it still ACCEPTS the role parameter from the URL. This creates:

1. **User confusion**: URL manipulation can show confusing error messages
2. **Security theater**: Makes users think role can be changed via URL
3. **Inconsistency**: Register page is fixed but login is not
4. **Attack surface**: Provides a vector for social engineering

### **Attack Scenario**:
```
User visits: /auth/login?role=lawyer
- If they login with client account → "This account is not registered as a lawyer"
- Creates confusion about whether accounts can be "upgraded"
- Phishing opportunity: "Click here to upgrade your account to lawyer"
```

### **Recommended Fix**:
Remove role parameter entirely from login flow. The system should auto-detect role from database.

---

## 🔍 DETAILED AUDIT FINDINGS

### ✅ **A. CLIENT REGISTRATION - SECURE**

**File**: `app/auth/register/page.tsx`

**Finding**: ✅ **PROPERLY FIXED** (from previous security patch)

```typescript
// Line 18 - SECURE
const role = "client"  // ALWAYS client, ignores URL

// Line 46 - SECURE  
data: {
  role: "client",  // Force client role
  full_name: fullName,
  phone: phone,
}

// Line 60 - SECURE
redirectUrl = `${baseUrl}/client/onboarding`  // Always client
```

**Verification**: ✅ PASS
- Role is hardcoded to "client"
- No URL parameter accepted
- Redirect always goes to client onboarding
- Security comments present

---

### ❌ **B. LOGIN PAGE - VULNERABLE**

**File**: `app/auth/login/page.tsx`

**Finding**: ❌ **ACCEPTS ROLE PARAMETER** (security inconsistency)

```typescript
// Line 18 - VULNERABLE
const role = searchParams.get("role") || "client"  // Accepts from URL

// Line 50-63 - VALIDATION (but still problematic)
if (role === "lawyer" && userRole !== "lawyer") {
  setError("This account is not registered as a lawyer")
  await supabase.auth.signOut()
  return
}
```

**Issue**: While it validates, it shouldn't accept role from URL at all.

**Impact**:
- LOW risk of actual privilege escalation (validation blocks it)
- HIGH risk of user confusion
- MEDIUM risk of social engineering attacks
- Inconsistent with fixed register page

**Recommendation**: Remove role parameter, auto-detect from database

---

### ✅ **C. PUBLIC LAWYER PROFILE - SECURE**

**File**: `app/lawyer/[id]/page.tsx`

**Finding**: ✅ **NO AUTH REQUIRED** (correct behavior)

```typescript
// Lines 33-53 - SECURE
export default function PublicLawyerProfile({ params }: PublicLawyerProfileProps) {
  // No auth check here - CORRECT
  const [lawyer, setLawyer] = useState<LawyerWithProfile | null>(null)
  
  useEffect(() => {
    params.then((resolvedParams) => {
      setLawyerId(resolvedParams.id)
      fetchLawyerProfile(resolvedParams.id)  // Public API call
```

**Verification**: ✅ PASS
- Page loads without authentication
- Profile data fetched from public API
- QR scanning works for unauthenticated users
- Correctly implements business rule #1

---

### ✅ **D. CONSULTATION REQUEST GATE - SECURE**

**File**: `app/lawyer/[id]/page.tsx`

**Finding**: ✅ **AUTH GATE WORKS CORRECTLY**

```typescript
// Lines 106-114 - SECURE
const handleRequestConsultation = async () => {
  // Check authentication before opening modal
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    setShowSignInModal(true)  // Show sign in prompt
    return
  }
  
  setShowRequestModal(true)  // Only if authenticated
}
```

**Verification**: ✅ PASS
- Consultation button accessible to everyone
- Auth check happens on click
- Unauthenticated users see sign-in modal
- Correctly implements business rule #1

---

### ✅ **E. RETURN URL FLOW - SECURE**

**File**: `app/lawyer/[id]/page.tsx`

**Finding**: ✅ **PRESERVES LAWYER CONTEXT AFTER AUTH**

```typescript
// Lines 118-122 - SECURE
const handleSignIn = () => {
  const currentPath = `/lawyer/${lawyerId}?openConsultation=true`
  router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`)
}

const handleCreateAccount = () => {
  const currentPath = `/lawyer/${lawyerId}?openConsultation=true`
  router.push(`/auth/register?returnUrl=${encodeURIComponent(currentPath)}`)
}

// Lines 64-78 - AUTO-OPEN MODAL AFTER LOGIN
useEffect(() => {
  const checkAuthAndOpenModal = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const shouldOpenModal = urlParams.get('openConsultation') === 'true'
    
    if (shouldOpenModal && lawyerId) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        window.history.replaceState({}, '', window.location.pathname)
        setShowRequestModal(true)  // Auto-open!
      }
    }
  }
  
  checkAuthAndOpenModal()
}, [lawyerId])
```

**Verification**: ✅ PASS
- Returns to lawyer profile after login
- Auto-opens consultation modal
- Clean URL after modal opens
- Perfect UX flow

---

### ⚠️ **F. DATABASE TRIGGER - USES RAW_USER_META_DATA**

**File**: `scripts/007_create_triggers.sql`

**Finding**: ⚠️ **RELIES ON FRONTEND DATA** (risky but mitigated)

```sql
-- Lines 10-16 - RISKY PATTERN
INSERT INTO public.profiles (id, role, full_name, phone, city)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),  -- ⚠️ Uses frontend data
  COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
  COALESCE(NEW.raw_user_meta_data ->> 'city', NULL)
)

-- Lines 20-38 - DANGEROUS IF EXPLOITED
IF NEW.raw_user_meta_data ->> 'role' = 'lawyer' THEN
  INSERT INTO public.lawyer_profiles (...)  -- Auto-creates lawyer profile!
```

**Issue**: The trigger trusts `raw_user_meta_data` which comes from the frontend `signUp()` call.

**Current Mitigation**:
- ✅ Register page now hardcodes `role: "client"`
- ✅ RLS policy prevents role updates
- ✅ No frontend code passes `role: "lawyer"`

**Remaining Risk**:
- ⚠️ Direct Supabase API calls could bypass frontend
- ⚠️ If someone gets API keys, they could call `signUp({ data: { role: 'lawyer' } })`

**Recommendation**: 
```sql
-- BETTER: Always force 'client', ignore raw_user_meta_data
INSERT INTO public.profiles (id, role, full_name, phone, city)
VALUES (
  NEW.id,
  'client',  -- HARDCODED, don't trust frontend
  COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
  COALESCE(NEW.raw_user_meta_data ->> 'city', NULL)
)

-- REMOVE auto lawyer_profiles creation entirely
-- Lawyers should ONLY be created via backend admin flow
```

---

### ✅ **G. LAWYER REGISTRATION FLOW - SECURE**

**File**: `app/lawyer/register/page.tsx`

**Finding**: ✅ **DOES NOT CREATE ACCOUNTS** (updates existing)

```typescript
// Lines 88-100 - SECURE
const handleSubmit = async (e: React.FormEvent) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    setError("You must be logged in to complete registration")  // ✅ Requires auth
    return
  }

  // Update profile with city
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ city })  // ✅ UPDATE, not INSERT
    .eq("id", user.id)

  // Create or update lawyer profile
  const { error: lawyerError } = await supabase
    .from("lawyer_profiles")
    .upsert({ ... })  // ✅ Creates lawyer_profiles, not profiles
```

**Verification**: ✅ PASS
- Requires existing authenticated user
- Only updates profile city
- Creates lawyer_profiles entry (not profiles)
- Does NOT change role
- Correctly implements business rule #2

**Note**: This flow assumes the user already has `role='lawyer'` in their profile, which means there must be a separate admin/backend process that:
1. Creates the auth user
2. Sets `role='lawyer'` in the profile
3. Then directs them to `/lawyer/register` to complete their profile

**QUESTION**: How do lawyer accounts get `role='lawyer'` initially?

---

### ✅ **H. RLS POLICY - SECURE**

**File**: `scripts/019_secure_role_column.sql`

**Finding**: ✅ **PREVENTS ROLE UPDATES** (new security layer)

```sql
-- Lines 10-17 - SECURE
CREATE POLICY "prevent_role_self_escalation"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  -- User can update their profile BUT NOT change their role
  role = (SELECT role FROM profiles WHERE id = auth.uid())
);
```

**Verification**: ✅ PASS
- Users can update their profile
- Users CANNOT change their role field
- Enforced at database level
- Cannot be bypassed by frontend
- Defense in depth

**Status**: ⏳ **NOT YET DEPLOYED** - Must run this SQL in Supabase!

---

### ✅ **I. API ENDPOINTS - NO ROLE PARAMETER**

**Files Checked**:
- `app/api/auth/register/client/route.ts` - Placeholder (not used)
- `app/api/auth/register/lawyer/route.ts` - Placeholder (not used)  
- `app/api/consultations/route.ts` - Uses authenticated user ID only

**Finding**: ✅ **NO ROLE MANIPULATION**

```typescript
// Consultation creation uses auth.user.id automatically
const { data: { user } } = await supabase.auth.getUser()

const { data: consultation } = await supabase
  .from('consultations')
  .insert({
    client_id: user.id,  // ✅ Uses authenticated user
    lawyer_id,           // ✅ From request body (just an ID)
    // No role manipulation
  })
```

**Verification**: ✅ PASS
- No API accepts role parameter
- User identity from session only
- Cannot spoof role via API

---

## 🎯 COMPLIANCE WITH BUSINESS RULES

| Business Rule | Compliance | Evidence |
|---------------|------------|----------|
| 1a. View lawyer profile without auth | ✅ YES | `app/lawyer/[id]/page.tsx` - no auth check |
| 1b. Sign in only on "Request Consultation" | ✅ YES | `handleRequestConsultation()` checks session |
| 1c. Always created as client | ⚠️ MOSTLY | Register ✅ / Login accepts param ❌ / Trigger risky ⚠️ |
| 1d. Never auto-created as lawyer | ⚠️ RISKY | Trigger could if raw_user_meta_data has role='lawyer' |
| 2a. Not creatable via QR/public pages | ✅ YES | Public page has no role parameter |
| 2b. Only via /lawyer/register | ⚠️ UNCLEAR | `/lawyer/register` updates existing users, doesn't set role |
| 2c. No frontend role parameters | ⚠️ MOSTLY | Register ✅ / Login ❌ |

---

## 🔧 REQUIRED FIXES

### **FIX #1: LOGIN PAGE ROLE PARAMETER** ⚠️ CRITICAL

**File**: `app/auth/login/page.tsx`

**Change**:
```typescript
// ❌ REMOVE THIS
const role = searchParams.get("role") || "client"

// ❌ REMOVE THIS VALIDATION
if (role === "lawyer" && userRole !== "lawyer") {
  setError("This account is not registered as a lawyer")
  await supabase.auth.signOut()
  return
}

if (role === "client" && userRole === "lawyer") {
  setError("This account is registered as a lawyer. Please use the lawyer login.")
  await supabase.auth.signOut()
  return
}

// ✅ REPLACE WITH AUTO-DETECTION
const userRole = data.user?.user_metadata?.role

// Redirect based on ACTUAL role (from database), not URL parameter
if (returnUrl) {
  router.replace(decodeURIComponent(returnUrl))
} else if (userRole === "lawyer") {
  router.replace("/lawyer")
} else {
  router.replace("/client/home")
}
```

---

### **FIX #2: DATABASE TRIGGER** ⚠️ HIGH PRIORITY

**File**: `scripts/007_create_triggers.sql`

**Change**:
```sql
-- ❌ REMOVE THIS
COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),

-- ✅ REPLACE WITH HARDCODED
'client',  -- ALWAYS client on signup

-- ❌ REMOVE ENTIRE AUTO-LAWYER BLOCK
IF NEW.raw_user_meta_data ->> 'role' = 'lawyer' THEN
  INSERT INTO public.lawyer_profiles (...)
END IF;

-- Lawyers should be promoted via backend admin API only
```

---

### **FIX #3: DEPLOY RLS POLICY** ⚠️ CRITICAL

**File**: `scripts/019_secure_role_column.sql`

**Action**: RUN IN SUPABASE SQL EDITOR

```bash
# This file already exists but hasn't been deployed yet
# Must be executed in Supabase to take effect
```

---

## 📊 RISK ASSESSMENT

| Vulnerability | Likelihood | Impact | Risk Level |
|---------------|------------|--------|------------|
| Login role parameter | Medium | Low | **MEDIUM** |
| Trigger trusts frontend | Low | Critical | **HIGH** |
| RLS policy not deployed | N/A | Critical | **CRITICAL** |
| Missing lawyer creation API | Medium | Medium | **MEDIUM** |

---

## ✅ SECURITY STRENGTHS

1. ✅ **Public profile access** - No unnecessary auth gates
2. ✅ **Consultation gate** - Auth required at right moment
3. ✅ **Return URL flow** - Preserves context perfectly
4. ✅ **Register page** - Role hardcoded correctly
5. ✅ **API endpoints** - No role manipulation possible
6. ✅ **RLS policy created** - Database-level protection (needs deployment)

---

## 📝 RECOMMENDATIONS

### **Immediate (Pre-Deployment)**
1. ⚠️ Fix login page role parameter
2. ⚠️ Deploy RLS policy (`019_secure_role_column.sql`)
3. ⚠️ Update trigger to ignore `raw_user_meta_data` role

### **Short-Term (Post-Deployment)**
4. 📋 Create backend admin API for lawyer account creation
5. 📋 Document lawyer onboarding process
6. 📋 Add audit logging for role changes
7. 📋 Create migration script to review existing accounts

### **Long-Term (Future Enhancement)**
8. 🔮 Implement lawyer verification system (bar number check)
9. 🔮 Add multi-factor authentication for lawyers
10. 🔮 Create admin dashboard for account management

---

## 🧪 MANUAL TEST SCENARIOS

### **Scenario 1: QR → View Profile (Unauthenticated)**
```
1. Logout completely
2. Scan QR code or visit /lawyer/[id]
3. Expected: Profile loads without login prompt ✅
4. Expected: Can see lawyer details, insights, map ✅
5. Expected: "Request Consultation" button visible ✅
```

### **Scenario 2: Click Consultation → Sign Up → Return**
```
1. Continue from Scenario 1 (not logged in)
2. Click "Request Consultation"
3. Expected: Modal shows "Sign In Required" ✅
4. Click "Create Account"
5. Expected: Redirected to /auth/register?returnUrl=/lawyer/[id]?openConsultation=true ✅
6. Complete registration
7. Expected: Profile.role = 'client' (CHECK IN DATABASE) ⚠️ VERIFY
8. Expected: Redirected back to /lawyer/[id] ✅
9. Expected: Consultation modal opens automatically ✅
10. Fill and submit consultation
11. Expected: Consultation created with client_id = your user ID ✅
```

### **Scenario 3: Attempt URL Manipulation**
```
1. Try: /auth/register?role=lawyer
2. Expected: Account created as 'client' anyway ✅
3. Try: /auth/login?role=lawyer (with client account)
4. Current: Shows error message ⚠️ (should ignore parameter)
5. Check database: SELECT role FROM profiles WHERE email = 'test@example.com'
6. Expected: role = 'client' (not changed) ✅
```

### **Scenario 4: Attempt Direct Database Update**
```sql
-- Try this as an authenticated user:
UPDATE profiles SET role = 'lawyer' WHERE id = auth.uid();

-- Expected: ERROR (blocked by RLS policy)
-- Actual (before deploying policy): SUCCESS ❌
-- Actual (after deploying policy): ERROR ✅
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Fix login page (remove role parameter)
- [ ] Update database trigger (hardcode client role)
- [ ] Deploy RLS policy (`019_secure_role_column.sql`)
- [ ] Test QR → Signup → Consultation flow end-to-end
- [ ] Verify URL manipulation attempts fail
- [ ] Test RLS policy blocks direct updates
- [ ] Audit existing accounts for unauthorized lawyers
- [ ] Document lawyer account creation process
- [ ] Update security documentation

---

## 🎯 FINAL VERDICT

**Overall Security Rating**: ⚠️ **B+ (Good, but needs fixes before production)**

**Summary**:
- ✅ Core flows are secure (QR, signup, consultation)
- ⚠️ Login page has inconsistency (accepts role param)
- ⚠️ Database trigger relies on frontend data
- ⚠️ RLS policy created but not deployed
- ✅ No way to escalate privileges via UI
- ⚠️ Direct API access could potentially bypass (if keys leaked)

**Recommendation**: **Fix 3 issues above before deploying to production.**

With fixes applied: **A- (Very Secure)**

---

## 📞 QUESTIONS FOR STAKEHOLDERS

1. **How are lawyer accounts initially created?**
   - Is there an admin panel?
   - Manual database insertion?
   - Backend API?
   - Need to document this process

2. **What happens to existing accounts?**
   - Any accounts with role='lawyer' that shouldn't be?
   - Need audit query to check

3. **Who can promote users to lawyers?**
   - Only super admins?
   - Automated verification system?
   - Manual approval process?

---

**End of Audit Report**

Generated: 2026-01-04  
Next Review: After deploying fixes  
Contact: GitHub Copilot for clarifications
