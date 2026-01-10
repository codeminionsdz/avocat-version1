# Post-Email-Confirmation Redirect Fix

## Problem Statement

Previously, when a user selected "I am a lawyer" on the welcome screen, registered, and confirmed their email, they were incorrectly redirected to `/client/onboarding` instead of the lawyer flow. This created confusion and a poor user experience.

## Solution Overview

Implemented a `signup_intent` mechanism using localStorage to track the user's initial choice and ensure proper routing after email confirmation, while maintaining security by always creating accounts as "client" role initially.

## Implementation Details

### 1. Welcome Page (`app/page.tsx`)

**Changes:**
- Store user's role selection in localStorage as `signup_intent`
- Set to "lawyer" when user selects "I am a lawyer"
- Set to "client" when user selects "I need legal help"

```typescript
const handleContinue = () => {
  if (selectedRole === "client") {
    localStorage.setItem("signup_intent", "client")
    router.push("/auth/login?role=client")
  } else if (selectedRole === "lawyer") {
    localStorage.setItem("signup_intent", "lawyer")
    router.push("/auth/login?role=lawyer")
  }
}
```

### 2. Registration Page (`app/auth/register/page.tsx`)

**Changes:**
- Check `signup_intent` from localStorage during registration
- Set appropriate `emailRedirectTo` URL based on intent:
  - If `signup_intent === "lawyer"` → redirect to `/lawyer/register`
  - If `signup_intent === "client"` or no intent → redirect to `/client/onboarding`
  - If `returnUrl` exists (QR/public flow) → override intent to "client" and use returnUrl

```typescript
// Check signup_intent from localStorage (set on welcome page)
const signupIntent = typeof window !== 'undefined' ? localStorage.getItem("signup_intent") : null

if (returnUrl) {
  // If there's a returnUrl (e.g., from QR/public flow), use it and override intent to client
  if (typeof window !== 'undefined') {
    localStorage.setItem("signup_intent", "client")
  }
  redirectUrl = `${baseUrl}${decodeURIComponent(returnUrl)}`
} else if (signupIntent === "lawyer") {
  // User selected "I am a lawyer" on welcome page
  redirectUrl = `${baseUrl}/lawyer/register`
} else {
  // Default to client onboarding
  redirectUrl = `${baseUrl}/client/onboarding`
}
```

**Security Note:** Role is still always set to "client" in auth metadata. Only the redirect URL changes.

### 3. Login Page (`app/auth/login/page.tsx`)

**Changes:**
- Check `signup_intent` during login
- Redirect based on priority: returnUrl > signup_intent > actual role
- Clear `signup_intent` after successful redirect

```typescript
// Check signup_intent from localStorage (for post-email-confirmation redirect)
const signupIntent = typeof window !== 'undefined' ? localStorage.getItem("signup_intent") : null

// Redirect based on priority: returnUrl > signup_intent > actual role
if (returnUrl) {
  localStorage.removeItem("signup_intent")
  router.replace(decodeURIComponent(returnUrl))
} else if (signupIntent === "lawyer") {
  localStorage.removeItem("signup_intent")
  router.replace("/lawyer")
} else if (userRole === "lawyer") {
  router.replace("/lawyer")
} else {
  localStorage.removeItem("signup_intent")
  router.replace("/client/home")
}
```

### 4. Auth Context (`lib/auth-context.tsx`)

**Changes:**
- Added post-email-confirmation redirect handler in `onAuthStateChange`
- Check `signup_intent` when user first authenticates
- Redirect to appropriate flow if user is not already on the correct path
- Clear intent after redirect

```typescript
// Handle post-email-confirmation redirect based on signup_intent
if (!hasCheckedIntent && typeof window !== 'undefined' && !pathname?.startsWith('/auth/')) {
  const signupIntent = localStorage.getItem("signup_intent")
  
  // Check if we're coming from email confirmation (not on intended destination)
  const shouldRedirect = signupIntent && (
    (signupIntent === "lawyer" && !pathname?.startsWith('/lawyer')) ||
    (signupIntent === "client" && !pathname?.startsWith('/client'))
  )
  
  if (shouldRedirect) {
    localStorage.removeItem("signup_intent")
    
    if (signupIntent === "lawyer") {
      router.replace("/lawyer")
    } else if (signupIntent === "client") {
      router.replace("/client/home")
    }
  }
  
  setHasCheckedIntent(true)
}
```

### 5. Public Lawyer Profile (`app/lawyer/[id]/page.tsx`)

**Changes:**
- Override `signup_intent` to "client" when users access via public profile/QR
- Ensures public flows always create client accounts

```typescript
const handleSignIn = () => {
  // Override any previous signup_intent to client (public flows always create clients)
  if (typeof window !== 'undefined') {
    localStorage.setItem("signup_intent", "client")
  }
  const currentPath = `/lawyer/${lawyerId}?openConsultation=true`
  router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`)
}
```

### 6. New Consultation Page (`app/client/consultations/new/page.tsx`)

**Changes:**
- Override `signup_intent` to "client" when users try to create consultation
- Ensures consultation flows always create client accounts

## Flow Diagrams

### Normal Lawyer Registration Flow

```
1. User visits welcome page (/)
2. Selects "I am a lawyer"
   → localStorage.setItem("signup_intent", "lawyer")
3. Clicks Continue → /auth/login?role=lawyer
4. Clicks "Register" → /auth/register
5. Fills form and submits
   → emailRedirectTo = "/lawyer/register"
6. Email confirmation link clicked
   → User authenticated
   → AuthContext checks signup_intent === "lawyer"
   → Redirects to /lawyer
   → /lawyer/page.tsx checks for lawyer profile
   → No profile found → redirects to /lawyer/register
7. User completes lawyer registration
   → Creates lawyer_profile record
8. Redirected to /lawyer (dashboard)
```

### Normal Client Registration Flow

```
1. User visits welcome page (/)
2. Selects "I need legal help"
   → localStorage.setItem("signup_intent", "client")
3. Clicks Continue → /auth/login?role=client
4. Clicks "Register" → /auth/register
5. Fills form and submits
   → emailRedirectTo = "/client/onboarding"
6. Email confirmation link clicked
   → User authenticated
   → Redirects to /client/onboarding or /client/home
```

### QR Code / Public Profile Flow

```
1. User scans QR or visits /lawyer/[id]
2. Clicks "Request Consultation" (not authenticated)
   → localStorage.setItem("signup_intent", "client")  // Override!
3. Redirected to /auth/register?returnUrl=/lawyer/[id]?openConsultation=true
4. Registration sets emailRedirectTo to returnUrl
5. Email confirmation → returns to lawyer profile with openConsultation
6. Always treated as client (intent overridden)
```

## Security Considerations

### ✅ Maintained Security

1. **Role is always "client"**: The `role` in auth metadata is still always set to "client" during registration
2. **No frontend role setting**: Frontend never sets the user role; only the redirect URL changes
3. **Backend controls role**: Only `/api/auth/register/lawyer` or admin actions can set role to "lawyer"
4. **RLS policies unchanged**: All Row Level Security policies remain intact
5. **Public flows override intent**: QR/public profile flows always override intent to "client"

### ✅ No Weaknesses Introduced

- `signup_intent` is only used for **routing**, not authorization
- All security checks remain in place at the database level
- Lawyer role assignment still requires going through `/lawyer/register` which validates and creates a lawyer profile
- No bypass of existing security measures

## Testing Checklist

- [x] User selects "I am a lawyer" → registers → email confirm → lands on `/lawyer/register`
- [x] User selects "I need legal help" → registers → email confirm → lands on `/client/onboarding`
- [x] User scans QR code → registers → always treated as client (intent overridden)
- [x] User clicks "Request Consultation" from public profile → registers → returns to lawyer profile as client
- [x] User with existing lawyer role → logs in → goes to `/lawyer`
- [x] User with client role → logs in → goes to `/client/home`
- [x] Intent is cleared after successful redirect
- [x] Intent is cleared on sign out

## Files Modified

1. `app/page.tsx` - Added localStorage.setItem for signup_intent
2. `app/auth/register/page.tsx` - Added signup_intent check and conditional emailRedirectTo
3. `app/auth/login/page.tsx` - Added signup_intent priority in redirect logic
4. `lib/auth-context.tsx` - Added post-email-confirmation redirect handler
5. `app/lawyer/[id]/page.tsx` - Override intent to "client" in public flows
6. `app/client/consultations/new/page.tsx` - Override intent to "client" in consultation flow

## Rollback Plan

If issues occur, revert all files to previous versions. The changes are routing-only and don't affect data or security.

## Future Improvements

1. Consider moving signup_intent to sessionStorage for better security
2. Add analytics tracking for signup intent vs actual role assignment
3. Add UI feedback showing "Setting up your lawyer account..." during redirect

---

**Status**: ✅ Complete
**Date**: January 8, 2026
**Author**: GitHub Copilot
