# Quick Start Guide - Public Lawyer Profiles

## 🚀 Feature Overview

Lawyers can now share professional profiles via QR codes with:
- ✅ Contact information display
- ✅ Interactive office location map
- ✅ In-app navigation with route drawing
- ✅ QR code generation and sharing
- ✅ Privacy controls

## 📋 Setup Checklist

### 1. Database Migration
Run this SQL file to add location fields:
```bash
# Apply migration (adjust connection details)
psql -h your-host -U your-user -d avoca -f scripts/014_add_location_fields.sql
```

### 2. Dependencies (Already Installed)
```bash
pnpm install
# Packages added: qrcode.react, leaflet, react-leaflet, @types/leaflet
```

### 3. Files Created/Modified

#### New Files:
- `app/lawyer/[id]/page.tsx` - Public profile page
- `components/lawyer/lawyer-qr-code.tsx` - QR code component
- `components/lawyer/lawyer-map.tsx` - Map and navigation
- `app/api/lawyer/public/[id]/route.ts` - Public API endpoint
- `scripts/014_add_location_fields.sql` - Database migration
- `styles/leaflet-custom.css` - Map styles

#### Modified Files:
- `lib/database.types.ts` - Added location fields to LawyerProfile
- `app/lawyer/profile/edit/page.tsx` - Added location & QR management
- `app/globals.css` - Imported Leaflet styles

## 🎯 How to Use

### For Lawyers:

1. **Go to your profile** → Click "Edit Profile"

2. **Add Office Location:**
   - Scroll to "Office Location" section
   - Enter your office address
   - Click "Use My Current Location" OR enter coordinates manually
   - Toggle "Show Location to Clients" ON

3. **Get Your QR Code:**
   - Scroll to "Your Digital Business Card"
   - Click "Show QR Code"
   - Click "Download" or "Share"
   - Print on business cards or display in office

4. **Share Your Profile:**
   - Your URL: `https://yourdomain.com/lawyer/{your-id}`
   - Give QR code to clients
   - Share URL on social media

### For Clients:

1. **Access Profile:**
   - Scan lawyer's QR code with phone camera
   - Or browse lawyers and click profile
   - Or use direct link

2. **View Office Location:**
   - See map with office marker
   - Click "Get My Location"
   - Click "Navigate to Office"
   - Follow the route on map

3. **Request Consultation:**
   - Click "Request Consultation"
   - Fill form and submit

## 🔧 Testing

### Test Public Profile Access
```
# Visit in browser (replace {id} with actual lawyer ID)
http://localhost:3000/lawyer/{id}
```

### Test QR Code
1. Go to lawyer profile edit page
2. Scroll to QR code section
3. Click "Show QR Code"
4. Test download and share

### Test Map Navigation
1. Open public profile with location enabled
2. Grant location permission
3. Click "Navigate to Office"
4. Verify route is drawn on map

## 🛠️ Common Issues

### TypeScript Errors
If you see import errors after adding new files:
```bash
# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Map Not Showing
- Check that latitude/longitude are set
- Verify location_visibility is true
- Check browser console for errors
- Ensure HTTPS (geolocation requires secure context)

### QR Code Not Downloading
- Check browser console
- Try different browser
- Verify canvas API is supported

### Location Permission Denied
- Check browser settings
- Ensure site has location permission
- Use HTTPS (required for geolocation)

## 📱 Mobile Friendly

All features are optimized for mobile:
- ✅ Touch-friendly map controls
- ✅ Responsive layout
- ✅ Mobile geolocation
- ✅ Easy QR scanning
- ✅ Share via native apps

## 🔒 Privacy & Security

- Lawyers control location visibility
- Location is optional
- Public profiles only show active lawyers
- Contact info respects privacy settings
- No external tracking

## 🌐 Browser Support

✅ Chrome/Edge (Desktop & Mobile)
✅ Safari (Desktop & Mobile)
✅ Firefox (Desktop & Mobile)
✅ Opera
⚠️ IE11 not supported (outdated)

## 📊 URLs Reference

| Resource | URL Pattern |
|----------|-------------|
| Public Profile | `/lawyer/[id]` |
| Edit Profile | `/lawyer/profile/edit` |
| API Endpoint | `/api/lawyer/public/[id]` |

## 🎨 Customization

### Change Map Appearance
Edit `styles/leaflet-custom.css` to customize:
- Marker colors
- Control styles
- Popup appearance
- Mobile touch zones

### Modify QR Code
Edit `components/lawyer/lawyer-qr-code.tsx`:
- QR code size (default: 200x200)
- Error correction level (default: H)
- Colors
- Logo/branding

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify database migration ran successfully
3. Test in different browser
4. Check network connectivity

## ✨ Next Steps

After setup:
1. ✅ Run database migration
2. ✅ Test in development
3. ✅ Update a lawyer profile with location
4. ✅ Generate and test QR code
5. ✅ Test navigation functionality
6. ✅ Deploy to production

## 🎉 Success Criteria

✓ Lawyers can add office location
✓ QR codes generate correctly
✓ Public profiles are accessible
✓ Maps display office markers
✓ Navigation draws routes
✓ Mobile experience is smooth
✓ Privacy controls work

---

**Ready to go!** 🚀
All features are implemented and ready for testing.
