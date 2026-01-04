# Public Lawyer Profile with QR Code & In-App Navigation

## Overview

This feature provides lawyers with a professional digital business card that includes:
- Public profile page accessible via QR code
- Interactive map with office location
- In-app navigation from user's location to lawyer's office
- Contact information display
- QR code generation for easy sharing

## Implementation Summary

### 1. Database Schema Updates

**File:** `scripts/014_add_location_fields.sql`

Added the following fields to `lawyer_profiles` table:
- `latitude` (DECIMAL) - Office location latitude
- `longitude` (DECIMAL) - Office location longitude
- `location_visibility` (BOOLEAN) - Controls whether location is shown to clients
- `office_address` (TEXT) - Physical address for display

**File:** `lib/database.types.ts`

Updated `LawyerProfile` interface to include location fields.

### 2. Public Profile Page

**File:** `app/lawyer/[id]/page.tsx`

Features:
- Displays lawyer's professional information
- Shows QR code (toggle view)
- Displays contact information (phone, email)
- Shows office location on map (if enabled)
- "Request Consultation" button
- "View Office Location" button for navigation
- Premium member badge for active subscriptions

### 3. Components

#### QR Code Component

**File:** `components/lawyer/lawyer-qr-code.tsx`

Features:
- Generates QR code using `qrcode.react` library
- Download as PNG functionality
- Share via Web Share API or clipboard
- High-quality QR code with error correction

#### Map Component

**File:** `components/lawyer/lawyer-map.tsx`

Features:
- Uses Leaflet (open-source, no API key required)
- Shows lawyer office marker
- Gets user's current location (with permission)
- Calculates and draws route using OSRM
- Displays distance and estimated time
- Mobile-friendly with proper zoom controls
- Works entirely in-app (no external redirects)

### 4. API Routes

**File:** `app/api/lawyer/public/[id]/route.ts`

Endpoint: `GET /api/lawyer/public/[id]`

- No authentication required (public endpoint)
- Returns lawyer profile with joined user data
- Only shows active lawyer profiles
- Includes active subscription information
- Respects location visibility settings

### 5. Lawyer Profile Management

**File:** `app/lawyer/profile/edit/page.tsx`

Added sections for:

#### Office Location Section
- Office address input
- Latitude/longitude fields
- "Use My Current Location" button
- Location visibility toggle
- Help text for finding coordinates

#### QR Code Section
- Toggle to show/hide QR code
- Download and share options
- Profile URL display
- Professional presentation

## Dependencies Added

```json
{
  "qrcode.react": "^4.2.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@types/leaflet": "^1.9.21"
}
```

## Usage Instructions

### For Lawyers

1. **Set Up Location:**
   - Go to Profile → Edit Profile
   - Scroll to "Office Location" section
   - Enter office address
   - Either:
     - Click "Use My Current Location" (if at office)
     - Manually enter latitude/longitude from Google Maps
   - Toggle "Show Location to Clients" to enable

2. **Get QR Code:**
   - In Edit Profile, scroll to "Your Digital Business Card"
   - Click "Show QR Code"
   - Download or share the QR code
   - Print it on business cards or display in office

3. **Share Profile:**
   - Your public profile URL: `https://yourdomain.com/lawyer/{your-id}`
   - Anyone can view it without logging in

### For Clients

1. **Access Profile:**
   - Scan lawyer's QR code
   - Or browse lawyers and click on a profile
   - Or use direct link

2. **Navigate to Office:**
   - On profile page, scroll to "Office Location"
   - Click "Get My Location" (grant permission)
   - Click "Navigate to Office"
   - Route will be drawn on the map
   - Follow the route in-app

3. **Request Consultation:**
   - Click "Request Consultation" button
   - Fill out consultation form
   - Wait for lawyer to accept

## Privacy & Security

### Location Privacy
- Lawyers control location visibility via toggle
- If disabled, map section is completely hidden
- Location data is optional (nullable fields)

### Public Profile
- Only active lawyers are shown
- No sensitive data exposed
- Contact info respects lawyer settings

### Geolocation
- User location requested with permission prompts
- High accuracy mode for better navigation
- Timeout handling (10 seconds)
- Error messages for denied permissions

## Technical Details

### Map Provider
- **Leaflet**: Open-source mapping library
- **OpenStreetMap**: Tile provider (free, no API key)
- **OSRM**: Routing service (free, open-source)

### QR Code
- **Format**: SVG (scalable, high quality)
- **Error Correction**: Level H (30% recovery)
- **Download**: Converted to PNG (300x300)
- **Embedding**: Can include logo/icon

### Routing Algorithm
- Uses OSRM (Open Source Routing Machine)
- Driving directions optimized for Algeria
- Returns full geometry for route drawing
- Includes distance (km) and duration (minutes)

## Browser Compatibility

### Required Features
- Geolocation API (for navigation)
- Web Share API (optional, fallback to clipboard)
- SVG support (QR codes)
- Modern CSS (flexbox, grid)

### Tested On
- Chrome/Edge (Windows, Android)
- Safari (iOS)
- Firefox (Desktop, Mobile)

## Future Enhancements

### Potential Features
1. **Multiple Office Locations**
   - Support lawyers with multiple offices
   - Select nearest office automatically

2. **Appointment Booking**
   - Calendar integration
   - Time slot selection
   - Automated reminders

3. **Reviews & Ratings**
   - Client testimonials
   - Star ratings on public profile
   - Verified consultation badges

4. **Analytics**
   - Profile view counts
   - QR code scan tracking
   - Navigation usage stats

5. **Advanced Navigation**
   - Traffic information
   - Alternative routes
   - Public transit options
   - Parking suggestions

6. **Offline Support**
   - Cache profile data
   - Offline maps
   - Service worker implementation

## Migration Steps

To apply this feature to an existing installation:

1. **Run Database Migration:**
   ```sql
   -- Execute scripts/014_add_location_fields.sql
   psql -h your-db-host -U your-user -d your-db -f scripts/014_add_location_fields.sql
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install qrcode.react leaflet react-leaflet @types/leaflet
   ```

3. **Update Environment:**
   - No environment variables required
   - All services are free and open-source

4. **Deploy:**
   - Build and deploy application
   - Test QR code generation
   - Verify map rendering
   - Check routing functionality

## Troubleshooting

### Map Not Displaying
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Verify latitude/longitude are valid numbers
- Check network connectivity for tiles

### Location Permission Denied
- User must grant permission in browser
- HTTPS required for geolocation
- Check browser location settings
- Provide manual navigation fallback

### QR Code Download Issues
- Ensure SVG is rendered correctly
- Check canvas API support
- Verify blob creation support
- Test in different browsers

### Routing Not Working
- Verify OSRM API is accessible
- Check coordinates are valid
- Ensure network connection
- Verify CORS is not blocking

## Support & Maintenance

### Regular Tasks
- Monitor OSRM uptime (routing service)
- Check OpenStreetMap tile availability
- Update dependencies quarterly
- Test QR code scanner compatibility

### Known Limitations
- OSRM may have limited coverage in rural areas
- Tile loading requires internet connection
- Geolocation accuracy varies by device
- Some older browsers may need polyfills

## License & Attribution

- **Leaflet**: BSD 2-Clause License
- **OpenStreetMap**: ODbL (Open Data Commons)
- **OSRM**: BSD 2-Clause License
- **qrcode.react**: ISC License

All components are free to use and open-source.
