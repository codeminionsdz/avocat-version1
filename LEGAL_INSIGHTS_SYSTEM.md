# Legal Insights System - Complete Implementation Guide

## 📋 Overview

The Legal Insights System is a professional content feature that allows verified lawyers on Avoca to publish educational legal content. This system helps lawyers showcase their expertise, educate the public, and attract potential clients through informational content.

## 🎯 Core Principles

- **Educational Only**: All content must be informational, never direct legal advice
- **No Social Features**: No comments, likes, or social feed - this is professional content
- **Quality Control**: AI-assisted writing with automatic quality checks
- **Discovery Tool**: Helps users find lawyers through relevant content
- **Professional Platform**: Maintains Avoca's identity as a legal marketplace, not a social network

## 🗄️ Database Schema

### Tables Created

#### `legal_insights`
Main table storing legal insight content:
- `id` (UUID, primary key)
- `lawyer_id` (UUID, references profiles.id)
- `title` (TEXT, 10-200 characters)
- `content` (TEXT, 100-5000 characters)
- `category` (TEXT, enum of legal categories)
- `ai_tags` (TEXT[], AI-generated tags)
- `quality_score` (FLOAT, 0-1, internal metric)
- `is_published` (BOOLEAN, publication status)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated)

**Categories**: criminal, family, civil, commercial, administrative, labor, real_estate, intellectual_property, tax, other

#### `legal_insight_ratings`
User feedback on insights:
- `id` (UUID, primary key)
- `insight_id` (UUID, references legal_insights.id)
- `user_id` (UUID, references profiles.id)
- `rating` (TEXT, 'helpful' or 'not_helpful')
- `created_at` (TIMESTAMP)
- Unique constraint on (insight_id, user_id) - one rating per user

#### `legal_insights_with_stats` (View)
Materialized view combining insights with statistics:
- All insight fields
- `lawyer_name` (from profiles)
- `specialization` (from lawyer_profiles)
- `wilaya` (from lawyer_profiles)
- `helpful_count` (aggregated count)
- `not_helpful_count` (aggregated count)
- `total_ratings` (sum of all ratings)

### Row Level Security (RLS)

**legal_insights policies**:
- ✅ Public can read published insights
- ✅ Lawyers can read their own insights (published or draft)
- ✅ Only active subscribed lawyers can create insights
- ✅ Lawyers can update/delete their own insights

**legal_insight_ratings policies**:
- ✅ Authenticated users can read ratings
- ✅ Authenticated users can rate insights
- ✅ Users can update/delete their own ratings

## 🔌 API Endpoints

### Insights CRUD

#### `GET /api/insights`
Get all published insights with optional filters
- Query params: `category`, `lawyer_id`, `limit`, `offset`
- Returns: Array of insights with stats and user's rating (if authenticated)

#### `GET /api/insights/[id]`
Get a specific insight
- Returns: Insight with stats and user's rating
- Access: Public for published, author for unpublished

#### `POST /api/insights`
Create a new insight (lawyers only)
- Body: `{ title, content, category, is_published }`
- Validation: Length checks, active subscription verification
- Returns: Created insight

#### `PUT /api/insights/[id]`
Update an insight (author only)
- Body: Any of `{ title, content, category, is_published, ai_tags }`
- Returns: Updated insight

#### `DELETE /api/insights/[id]`
Delete an insight (author only)
- Returns: Success confirmation

#### `GET /api/insights/my`
Get all insights for the authenticated lawyer
- Query params: `include_unpublished` (boolean)
- Returns: Array of lawyer's insights with statistics

### Ratings

#### `POST /api/insights/[id]/rate`
Rate an insight (authenticated users only)
- Body: `{ rating: 'helpful' | 'not_helpful' }`
- Upserts rating (updates if exists)
- Returns: Rating object

#### `DELETE /api/insights/[id]/rate`
Remove rating from an insight
- Returns: Success confirmation

### AI Assistance

#### `POST /api/insights/ai-assist`
AI-powered writing assistance
- Body: `{ action, title?, content? }`
- Actions:
  - `suggest_titles`: Generate 5 title options
  - `check_clarity`: Analyze readability and clarity
  - `detect_legal_advice`: Detect problematic legal advice language
  - `suggest_tags`: Generate relevant tags
  - `improve_content`: Enhance content quality
- Returns: `{ result }` with action-specific data

#### `POST /api/ai/recommend-insights`
Get AI recommendations for relevant insights
- Body: `{ query, category?, limit? }`
- Uses Claude AI to analyze user query and match insights
- Returns: `{ insights: [] }` ordered by relevance

## 🎨 User Interface

### For Lawyers

#### `/lawyer/insights`
**Lawyer Insights Management Page**
- List all insights (published and drafts)
- View stats: helpful/not helpful counts, total ratings
- Quick actions: publish/unpublish, edit, delete
- Create new insight button

#### `/lawyer/insights/new`
**Create Insight Page**
Features:
- Category selection
- Title input with character counter (10-200)
- Content textarea with character counter (100-5000)
- AI assistance buttons:
  - 💡 Suggest Titles
  - 🔍 Check Clarity
  - ⚠️ Check Legal Advice Risk
  - ✨ Suggest Tags
- Real-time AI feedback display
- Legal disclaimer warning
- Save as draft or publish immediately

#### `/lawyer/insights/[id]/edit`
**Edit Insight Page** (similar to create, pre-populated)

### For Public Users

#### `/insights`
**Browse Legal Insights Page**
Features:
- Search bar for filtering insights
- Category filter dropdown
- Insight cards showing:
  - Title, content preview
  - Category badge
  - Lawyer name, specialization, location
  - Publication date
  - AI-generated tags
  - Helpful/Not Helpful buttons with counts
  - "Request Consultation" button
- Legal disclaimer at top of page

#### `/lawyer/[id]` (Public Profile)
**Lawyer Public Profile Enhancement**
- New "Legal Insights" section
- Shows up to 3 recent published insights
- Insight preview cards with title, snippet, stats
- "View All" button to see all insights

#### `/client/ai-assistant`
**AI Assistant Integration**
- After case classification is complete
- Shows 3 AI-recommended insights related to user's query
- Click to view full insights
- Helps users understand legal concepts before consulting

## 🤖 AI Integration

### Claude AI Features

1. **Title Suggestions**
   - Analyzes content to suggest 5 professional titles
   - Considers SEO and engagement

2. **Clarity Analysis**
   - Scores content 0-10 for clarity
   - Identifies jargon, complexity issues
   - Provides specific improvement suggestions

3. **Legal Advice Detection**
   - Risk levels: none, low, medium, high
   - Detects commands, promises, guarantees
   - Warns about attorney-client relationship language
   - Suggests safer phrasings

4. **Tag Generation**
   - Creates 3-7 relevant search tags
   - Based on content and category

5. **Content Improvement**
   - Rewrites content for better clarity
   - Removes jargon, improves accessibility
   - Maintains educational tone

6. **Insight Recommendations**
   - Semantic search through insights
   - Matches user queries to relevant content
   - Returns top matches by relevance

## 🔒 Security & Access Control

### Lawyer Requirements
To create insights, a lawyer must:
- Be verified (verification_status = 'verified')
- Have active subscription (status = 'active', end_date > now)
- Be logged in as lawyer role

### Content Validation
- Title: 10-200 characters
- Content: 100-5000 characters
- Category: Must match enum values
- Only published insights visible to public

### Rating Protection
- One rating per user per insight
- Must be authenticated to rate
- Can change rating (upsert)
- Cannot rate own insights (UI level)

## 📊 Quality Metrics

### Internal Scoring
- `quality_score`: 0-1 float for ranking
- Based on: length, clarity, engagement, ratings
- Used for internal sorting and recommendations

### Public Metrics
- `helpful_count`: Number of helpful ratings
- `not_helpful_count`: Number of not helpful ratings
- `total_ratings`: Sum of all ratings
- Displayed to help users assess quality

## 🚀 Setup Instructions

### 1. Run Database Migration
```sql
-- Execute this file in Supabase SQL Editor
-- Located at: scripts/015_create_legal_insights.sql
```

### 2. Verify RLS Policies
Check in Supabase Dashboard:
- Database → Tables → legal_insights → RLS enabled
- Database → Tables → legal_insight_ratings → RLS enabled

### 3. Test API Endpoints
```bash
# Get public insights
curl https://your-app.com/api/insights

# Create insight (requires auth)
curl -X POST https://your-app.com/api/insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Your Title","content":"Your content...","category":"criminal"}'
```

### 4. Configure Environment Variables
Ensure `.env.local` has:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 🎯 Usage Flows

### Lawyer Creates Insight
1. Navigate to `/lawyer/insights`
2. Click "New Insight"
3. Select category
4. Write content (AI assistance available)
5. Use AI to check for legal advice risks
6. Get AI title suggestions
7. Save as draft or publish
8. View stats after publication

### User Discovers Lawyer via Insight
1. User visits `/insights` or uses AI assistant
2. Browses/searches insights
3. Reads educational content
4. Finds helpful insight
5. Clicks "Request Consultation from this lawyer"
6. Redirected to lawyer profile
7. Initiates consultation request

### AI Assistant Recommends Insights
1. User describes legal issue in AI assistant
2. AI classifies case
3. AI finds 3 relevant published insights
4. User reads educational content
5. Better informed before consultation

## 📝 Legal Disclaimer

**Mandatory disclaimer displayed on:**
- Every insight card
- Top of insights browse page
- Lawyer insight creation page

**Text:**
> "This content is for informational purposes only and does not constitute legal advice. For legal advice specific to your situation, please consult with a lawyer directly."

## 🔄 Future Enhancements

Potential features to consider:
- [ ] Admin moderation dashboard
- [ ] Insight reporting system
- [ ] Advanced AI quality scoring
- [ ] Insight analytics dashboard for lawyers
- [ ] Export insights as PDF
- [ ] Share insights on social media (with disclaimer)
- [ ] Email notifications for new insights in followed categories
- [ ] Insight translations (Arabic/French/English)

## 📚 TypeScript Types

All types defined in `lib/database.types.ts`:
- `InsightCategory`: Legal category enum
- `InsightRating`: 'helpful' | 'not_helpful'
- `LegalInsight`: Base insight interface
- `LegalInsightRating`: Rating interface
- `LegalInsightWithStats`: Insight with aggregated statistics
- `LegalInsightWithLawyer`: Insight with lawyer profile data

## ✅ Testing Checklist

- [ ] Run database migration successfully
- [ ] Verify RLS policies block unauthorized access
- [ ] Create insight as lawyer
- [ ] Cannot create insight as client
- [ ] Cannot create insight without active subscription
- [ ] AI assistance APIs respond correctly
- [ ] Rate insight as authenticated user
- [ ] Cannot rate without authentication
- [ ] View insights on public profile
- [ ] AI recommendations work in assistant
- [ ] Search and filter insights
- [ ] Edit and delete own insights
- [ ] Cannot edit/delete others' insights

## 🎉 Implementation Complete

All features have been implemented and are ready for use:
✅ Database schema with RLS
✅ Complete API routes
✅ Lawyer management UI
✅ Public browse interface
✅ AI writing assistance
✅ AI recommendations
✅ Rating system
✅ Public profile integration

**Next Steps:**
1. Run the database migration
2. Test the feature end-to-end
3. Deploy to production
4. Monitor usage and gather feedback
