# Simple Consultation Booking System

## Overview

A request-based consultation booking system for Avoca that allows clients to request consultations from lawyers without complex scheduling or online payments.

## Implementation Complete

### ✅ Database Changes

**Migration**: `scripts/016_extend_consultations_booking.sql`

Extended `consultations` table with:
- `consultation_type`: 'chat' | 'call' | 'in_person'
- `requested_duration`: 15 | 30 (minutes)
- `requested_time`: TIMESTAMP (optional preferred time)
- `confirmed_time`: TIMESTAMP (lawyer-confirmed time)
- `lawyer_notes`: TEXT (notes from lawyer)
- Added 'rescheduled' status to existing statuses

### ✅ TypeScript Types

Updated `lib/database.types.ts`:
- `ConsultationType`: 'chat' | 'call' | 'in_person'
- `ConsultationDuration`: 15 | 30
- `ConsultationStatus`: Added 'rescheduled'
- Extended `Consultation` interface with new fields

### ✅ API Endpoints

**Updated**: `app/api/consultations/route.ts`
- `POST /api/consultations`: Create consultation request with new fields
- `GET /api/consultations`: List consultations (filtered by user role)

**New**: `app/api/consultations/[id]/respond/route.ts`
- `PUT /api/consultations/[id]/respond`: Lawyer responds to requests
  - Actions: 'accept', 'decline', 'reschedule'
  - Includes confirmed_time and lawyer_notes

### ✅ UI Components

**New**: `components/consultation/request-consultation-modal.tsx`
- Modal dialog for requesting consultations
- Fields:
  - Legal category selection
  - Consultation type (chat/call/in-person) with icons
  - Duration (15 or 30 minutes)
  - Optional preferred date & time
  - Required description (min 20 characters)
- Clean, user-friendly interface

**Updated**: `app/lawyer/[id]/page.tsx`
- Integrated RequestConsultationModal
- Opens modal on "Request Consultation" button click
- Passes lawyer ID and name to modal

## Usage Flow

### Client Requests Consultation

1. Client views lawyer profile
2. Clicks "Request Consultation"
3. Modal opens with form:
   - Selects legal category
   - Chooses consultation type (chat/call/in-person)
   - Selects duration (15 or 30 minutes)
   - Optionally picks preferred date/time
   - Describes legal issue (min 20 chars)
4. Submits request
5. Redirected to consultations page

### Lawyer Responds

1. Lawyer receives notification (consultation appears in requests)
2. Views request details:
   - Client info
   - Consultation type & duration
   - Requested time
   - Issue description
3. Can take actions:
   - **Accept**: Confirms the requested time
   - **Reschedule**: Suggests alternative date/time
   - **Decline**: Rejects the request
4. Optionally adds notes for client

### Status Flow

```
pending → accepted (confirmed)
        → rescheduled (new time proposed)
        → declined (rejected)
```

## Features

### ✅ Simple & Clean
- No complex calendar integration
- No automatic scheduling
- No online payment processing
- Just request → response flow

### ✅ Flexible Consultation Types
- **Chat**: Text-based consultation
- **Call**: Phone consultation  
- **In-Person**: Office meeting

### ✅ Duration Options
- 15 minutes (quick consultation)
- 30 minutes (standard consultation)

### ✅ Optional Time Preference
- Client can suggest preferred time
- Lawyer can accept or propose alternative
- Not required - lawyer and client can coordinate externally

### ✅ Clear Communication
- Description required from client
- Notes field for lawyer instructions
- Status tracking (pending/accepted/rescheduled/declined)

## Database Schema

```sql
-- consultations table (extended)
ALTER TABLE consultations ADD COLUMN consultation_type TEXT NOT NULL;
ALTER TABLE consultations ADD COLUMN requested_duration INTEGER NOT NULL;
ALTER TABLE consultations ADD COLUMN requested_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE consultations ADD COLUMN confirmed_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE consultations ADD COLUMN lawyer_notes TEXT;

-- Constraints
CHECK (consultation_type IN ('chat', 'call', 'in_person'))
CHECK (requested_duration IN (15, 30))
CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled', 'rescheduled'))
```

## API Examples

### Create Consultation Request

```bash
POST /api/consultations
{
  "lawyer_id": "uuid",
  "category": "criminal",
  "description": "I need legal advice about...",
  "consultation_type": "chat",
  "requested_duration": 30,
  "requested_time": "2026-01-10T14:00:00Z" # optional
}
```

### Lawyer Accepts Request

```bash
PUT /api/consultations/[id]/respond
{
  "action": "accept",
  "lawyer_notes": "Please have your documents ready"
}
```

### Lawyer Reschedules

```bash
PUT /api/consultations/[id]/respond
{
  "action": "reschedule",
  "confirmed_time": "2026-01-11T10:00:00Z",
  "lawyer_notes": "I'm available at this time instead"
}
```

### Lawyer Declines

```bash
PUT /api/consultations/[id]/respond
{
  "action": "decline",
  "lawyer_notes": "I don't specialize in this area"
}
```

## Integration Points

### Lawyer Profile
- "Request Consultation" button opens modal
- Modal pre-fills lawyer information
- Smooth user experience

### Lawyer Dashboard
- `/lawyer/requests` page shows all consultation requests
- Tabbed interface: pending, accepted, rescheduled, declined
- Quick action buttons for each request

### Client Dashboard
- `/client/consultations` shows all their requests
- Status badges for each consultation
- Contact information after acceptance

## Next Steps (Optional Enhancements)

- [ ] Email notifications for new requests
- [ ] SMS notifications for time confirmations
- [ ] Calendar export (ICS file generation)
- [ ] Payment tracking (manual, not integrated)
- [ ] Consultation notes after completion
- [ ] Rating system after consultation
- [ ] Automatic reminders before confirmed time

## Setup Instructions

1. **Run Migration**
   ```sql
   -- Execute in Supabase SQL Editor
   -- File: scripts/016_extend_consultations_booking.sql
   ```

2. **Verify Tables**
   - Check that consultations table has new columns
   - Verify constraint on consultation_type
   - Confirm status includes 'rescheduled'

3. **Test Flow**
   - As client: Request consultation from lawyer profile
   - As lawyer: View and respond to request in /lawyer/requests
   - Verify status updates correctly

## Design Principles

### Keep It Simple
- No overcomplicated scheduling logic
- No payment integration complexity
- Focus on communication, not automation

### Lawyer-Controlled
- Lawyers decide when they're available
- No automatic booking
- Full control over schedule

### Flexible
- Works for various consultation types
- Accommodates different time zones
- Allows external coordination

### Professional
- Clear status tracking
- Professional interface
- Respects lawyer-client relationship

## Technical Notes

### Why Request-Based?
- Avoids calendar sync complexity
- No need for availability management
- Simpler for lawyers to adopt
- More flexible for both parties

### Why No Online Payments?
- Legal consultation payments often complex
- Lawyers may have existing payment systems
- Reduces regulatory complexity
- Allows offline payment arrangements

### Status Meanings
- **pending**: Waiting for lawyer response
- **accepted**: Lawyer confirmed the time
- **rescheduled**: Lawyer proposed new time
- **declined**: Lawyer rejected request
- **completed**: Consultation finished
- **cancelled**: Client or lawyer cancelled

## Success Metrics

Track:
- Consultation request rate
- Lawyer response time
- Acceptance vs decline rate
- Time-to-confirmation
- Client satisfaction after consultation

## Conclusion

This simple booking system provides just enough structure for consultation requests without over-engineering the solution. It respects the professional nature of legal consultations while providing a modern, user-friendly interface.
