# ✨ Branded QR Code Feature

## Overview
QR codes للمحامين تحتوي الآن على شعار Avoca في المركز بشكل احترافي.

## What's New

### 🎨 Visual Enhancements
- **Avoca Logo in Center**: شعار Avoca يظهر في مركز QR code
- **Built-in Image Embedding**: استخدام imageSettings من qrcode.react
- **Excavated Background**: excavate=true ينظف QR data خلف الشعار
- **Professional Border**: إطار رمادي خفيف حول QR code

### 🔧 Technical Implementation
- **Error Correction Level**: HIGH (H) - يسمح بـ 30% تلف
- **Logo Size**: 62x62px (22% من حجم QR البالغ 280px)
- **Canvas-Based**: QRCodeCanvas للتصدير عالي الجودة
- **Image Settings**: imageSettings مدمجة مع excavate=true

### 📱 Scanning Reliability
- ✅ يعمل مع جميع تطبيقات المسح
- ✅ excavate يحافظ على قابلية المسح
- ✅ مناسب للطباعة والموبايل
- ✅ يحافظ على margins للمسح السريع

## Usage

المكون يستخدم تلقائياً في صفحات الملف الشخصي:

```tsx
import { LawyerQRCode } from "@/components/lawyer/lawyer-qr-code"

<LawyerQRCode 
  url="https://avoca.dz/lawyer/123"
  lawyerName="أستاذ محمد بن علي"
/>
```

## Features

### 1. Download
- ينزّل QR code بصيغة PNG
- اسم الملف: `LawyerName_Avoca_QR.png`
- جودة عالية للطباعة

### 2. Share
- يشارك رابط الملف الشخصي
- يدعم Web Share API
- Fallback: نسخ إلى الحافظة

## 🐛 Bugfixes

### Leaflet Map Z-Index Issue
**Problem**: خريطة Leaflet كانت تظهر فوق محتوى Modal

**Solution**:
- إضافة `z-index: 0 !important` للـ `.leaflet-container`
- إضافة `.map-container-wrapper` بارتفاع ثابت (300px)
- Force جميع Leaflet panes لـ z-index: 0

**Files Modified**:
- `/styles/leaflet-custom.css` - إضافة z-index constraints
- `/app/lawyer/[id]/page.tsx` - wrap LawyerMap في div.map-container-wrapper

### QR Code Logo Implementation
**Before**: كان يستخدم useEffect لرسم الشعار يدوياً على Canvas

**After**: يستخدم imageSettings المدمجة:
```tsx
imageSettings={{
  src: "/logo-avoca.png",
  height: 62,
  width: 62,
  excavate: true,
}}
```

**Benefits**:
- ✅ أبسط وأسهل صيانة
- ✅ excavate=true ينظف QR data تلقائياً
- ✅ أداء أفضل (لا useEffect)
- ✅ موثوقية أعلى للمسح

## File Locations

- **Component**: `/components/lawyer/lawyer-qr-code.tsx`
- **Logo**: `/public/logo-avoca.png`
- **CSS**: `/styles/leaflet-custom.css`

## Design Specs

```
QR Code Size: 280x280px
Logo Size: 62x62px (22% of QR)
Error Correction: HIGH (H)
Excavate: true
Margins: Included for scanning
```

## Browser Support

- ✅ Chrome, Edge, Safari, Firefox
- ✅ Mobile browsers
- ✅ Canvas API support required

---

**Status**: ✅ Production Ready  
**Last Updated**: January 4, 2026  
**Issues Fixed**: Leaflet z-index + QR logo embedding
