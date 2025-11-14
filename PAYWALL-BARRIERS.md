# SubtitleShift - Paywall Barriers Documentation

**Last Updated**: 2025-11-13
**Purpose**: Complete inventory of all Pro/Free tier restrictions for demo testing and production launch verification

---

## 🚨 CRITICAL: Pre-Launch Checklist

Before deploying to production, verify ALL barriers are properly configured:

- [ ] **FileUpload.tsx** - FREE_SUBTITLE_LIMIT set to 50 (currently 200)
- [ ] **FindReplace.tsx** - Pro check enabled (line 44-47)
- [ ] **VideoPlayer.tsx** - Pro check enabled (line 41-46)
- [ ] **SubtitleEditor.tsx** - Pro checks enabled for editing, split, merge (lines 18-22, 73-77, 88-92)
- [ ] **useProStatus.ts** - Demo mode disabled (no hardcoded `isPro: true`)
- [ ] **localStorage** cleared on demo site (no test Pro keys persisting)

---

## 📋 Complete Paywall Barrier Inventory

### 1. **Subtitle Entry Limit**

**File**: `src/components/FileUpload.tsx`
**Lines**: 9, 42-52
**Feature**: Unlimited subtitle entries

**Current Configuration**:
```typescript
const FREE_SUBTITLE_LIMIT = 200; // Temporarily increased for demo testing
```

**Production Configuration**:
```typescript
const FREE_SUBTITLE_LIMIT = 50;
```

**Logic**:
```typescript
// Lines 42-52
if (!isPro && entries.length > FREE_SUBTITLE_LIMIT) {
  const limitedEntries = entries.slice(0, FREE_SUBTITLE_LIMIT);
  useSubtitleStore.setState({ entries: limitedEntries, fileName: file.name, isDirty: false });
  await loadFile(file);

  toast.error(
    `Free version limited to ${FREE_SUBTITLE_LIMIT} subtitles. File has ${entries.length} subtitles. Showing first ${FREE_SUBTITLE_LIMIT}.`,
    { duration: 6000 }
  );
  setShowPaywall(true);
  return;
}
```

**Behavior**:
- Free users: Files truncated to first 50 entries, paywall shown
- Pro users: Unlimited entries

---

### 2. **Find & Replace**

**File**: `src/components/FindReplace.tsx`
**Lines**: 10-11, 43-47, 260-265
**Feature**: Text find and replace across all subtitles

**Logic**:
```typescript
// Lines 10-11
const { isPro } = useProStatus();
const [showPaywall, setShowPaywall] = useState(false);

// Lines 43-47
const handleReplace = () => {
  if (!findText) return;

  // Check Pro status
  if (!isPro) {
    setShowPaywall(true);
    return;
  }

  const count = matchCount;
  findReplace(findText, replaceText, caseSensitive);
  // ... rest of logic
};
```

**Behavior**:
- Free users: Can search and see match count, but cannot perform replacements
- Pro users: Full find & replace functionality

---

### 3. **Video Upload & Preview**

**File**: `src/components/VideoPlayer.tsx`
**Lines**: 9-10, 40-46, 510-515
**Feature**: Video upload and subtitle synchronization preview

**Logic**:
```typescript
// Lines 9-10
const { isPro } = useProStatus();
const [showPaywall, setShowPaywall] = useState(false);

// Lines 40-46
const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  // Check Pro status
  if (!isPro) {
    event.target.value = ''; // Reset file input
    setShowPaywall(true);
    return;
  }

  const file = event.target.files?.[0];
  // ... rest of logic
};
```

**Behavior**:
- Free users: Video upload blocked entirely, paywall shown on click
- Pro users: Can upload video and preview with subtitle sync

---

### 4. **Inline Text Editing**

**File**: `src/components/SubtitleEditor.tsx`
**Lines**: 12-13, 17-22, 377-382
**Feature**: Click-to-edit subtitle text inline

**Logic**:
```typescript
// Lines 12-13
const { isPro } = useProStatus();
const [showPaywall, setShowPaywall] = useState(false);

// Lines 17-22
const handleEditStart = (id: string, text: string) => {
  // Check Pro status for inline editing
  if (!isPro) {
    setShowPaywall(true);
    return;
  }

  setEditingId(id);
  setEditText(text);
  setCurrentEntry(id);
};
```

**Behavior**:
- Free users: Cannot click to edit subtitle text, paywall shown
- Pro users: Full inline editing with Enter to save, Escape to cancel

---

### 5. **Split Subtitle**

**File**: `src/components/SubtitleEditor.tsx`
**Lines**: 73-77
**Feature**: Split subtitle into two parts (Cmd+Shift+S / Ctrl+Shift+S)

**Logic**:
```typescript
// Lines 73-77
const handleSplit = (entryId: string) => {
  if (!isPro) {
    setShowPaywall(true);
    return;
  }

  // Split subtitle at midpoint...
};
```

**Behavior**:
- Free users: Split button disabled, paywall shown on click
- Pro users: Can split subtitles at midpoint

---

### 6. **Merge Subtitles**

**File**: `src/components/SubtitleEditor.tsx`
**Lines**: 88-92
**Feature**: Merge subtitle with next entry (Cmd+Shift+M / Ctrl+Shift+M)

**Logic**:
```typescript
// Lines 88-92
const handleMerge = (entryId: string) => {
  if (!isPro) {
    setShowPaywall(true);
    return;
  }

  // Merge with next subtitle...
};
```

**Behavior**:
- Free users: Merge button disabled, paywall shown on click
- Pro users: Can merge consecutive subtitles

---

## 🎬 Quick Demo Setup (Bypass All Paywalls)

### Method 1: Browser Console (Easiest for Testing)

Open browser DevTools console and run:

```javascript
localStorage.setItem('subtitleshift_pro_status', 'true');
localStorage.setItem('subtitleshift_license_key', 'demo-' + Date.now());
localStorage.setItem('subtitleshift_activated_at', new Date().toISOString());
location.reload();
```

To remove Pro status:
```javascript
localStorage.clear();
location.reload();
```

---

### Method 2: Use ProBadge Demo Key Generator

1. Click "Have a key?" link in the UI
2. Click "Generate Demo Key" button
3. Copy the generated key
4. Paste and activate

**Code location**: `src/components/ProBadge.tsx` lines 146-151

---

### Method 3: Hardcode Demo Mode (Not Recommended)

**File**: `src/hooks/useProStatus.ts`

**Temporary change for demo recording**:
```typescript
export function useProStatus() {
  const [isPro, setIsPro] = useState(true); // Change false to true
  // ... rest of code
}
```

**⚠️ DANGER**: This will enable Pro for all users. Only use for screenshots/videos, never commit this change!

---

## 🔧 Component-Level Demo Overrides

If you want to test individual features without enabling full Pro:

### Disable Find & Replace Paywall Only

**File**: `src/components/FindReplace.tsx` line 44-47

Comment out the Pro check:
```typescript
const handleReplace = () => {
  if (!findText) return;

  // Check Pro status
  // if (!isPro) {
  //   setShowPaywall(true);
  //   return;
  // }

  const count = matchCount;
  findReplace(findText, replaceText, caseSensitive);
  // ...
};
```

### Disable Video Upload Paywall Only

**File**: `src/components/VideoPlayer.tsx` line 41-46

Comment out the Pro check:
```typescript
const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  // Check Pro status
  // if (!isPro) {
  //   event.target.value = '';
  //   setShowPaywall(true);
  //   return;
  // }

  const file = event.target.files?.[0];
  // ...
};
```

### Disable Subtitle Editing Paywalls

**File**: `src/components/SubtitleEditor.tsx`

Comment out all three Pro checks (lines 18-22, 73-77, 88-92):
```typescript
const handleEditStart = (id: string, text: string) => {
  // if (!isPro) {
  //   setShowPaywall(true);
  //   return;
  // }
  setEditingId(id);
  // ...
};

const handleSplit = (entryId: string) => {
  // if (!isPro) {
  //   setShowPaywall(true);
  //   return;
  // }
  // Split logic...
};

const handleMerge = (entryId: string) => {
  // if (!isPro) {
  //   setShowPaywall(true);
  //   return;
  // }
  // Merge logic...
};
```

---

## 📊 Free vs Pro Feature Comparison

| Feature | Free | Pro |
|---------|------|-----|
| **Subtitle Entries** | 50 max | Unlimited |
| **File Upload** | ✅ Yes | ✅ Yes |
| **View Subtitles** | ✅ Yes | ✅ Yes |
| **Export Files** | ✅ Yes | ✅ Yes |
| **Timestamp Adjuster** | ✅ Yes | ✅ Yes |
| **Timeline View** | ✅ Yes | ✅ Yes |
| **Find (Search Only)** | ✅ Yes | ✅ Yes |
| **Replace Text** | ❌ No | ✅ Yes |
| **Inline Text Editing** | ❌ No | ✅ Yes |
| **Split Subtitles** | ❌ No | ✅ Yes |
| **Merge Subtitles** | ❌ No | ✅ Yes |
| **Video Upload** | ❌ No | ✅ Yes |
| **Video Preview** | ❌ No | ✅ Yes |
| **Subtitle Sync** | ❌ No | ✅ Yes |

---

## 🔐 License System Overview

### Storage Keys
- `subtitleshift_pro_status`: `"true"` or `"false"`
- `subtitleshift_license_key`: UUID-format string
- `subtitleshift_activated_at`: ISO timestamp

### Validation Location
**File**: `src/utils/license.ts`

**Current Implementation**: Client-side only (see line 2 comment)

**Functions**:
- `validateLicenseKey()`: Checks format (currently accepts any UUID-like string)
- `activateLicense()`: Stores key and sets Pro status
- `deactivateLicense()`: Removes Pro status
- `getLicenseInfo()`: Returns current Pro status and license details
- `generateDemoLicenseKey()`: Creates demo keys for testing

### Pro Status Hook
**File**: `src/hooks/useProStatus.ts`

**Features**:
- Cross-tab synchronization via storage events
- 1-second polling for status changes
- Exposes `isPro` boolean and `refreshLicenseInfo()` function

---

## 🚀 Production Deployment Checklist

### Step 1: Restore Configuration Values

```bash
# Search for temporary demo changes
grep -r "demo" src/
grep -r "Temporarily" src/
grep -r "TODO" src/
```

**Expected changes**:
1. `src/components/FileUpload.tsx` line 9:
   - Change `const FREE_SUBTITLE_LIMIT = 200;`
   - To: `const FREE_SUBTITLE_LIMIT = 50;`

### Step 2: Verify All Paywall Checks

Run through this checklist in the deployed demo:

1. **Upload 51+ subtitle file** → Should truncate to 50 and show paywall ✅
2. **Click Find & Replace button** → Should show paywall ✅
3. **Try to upload video** → Should show paywall ✅
4. **Click to edit subtitle text** → Should show paywall ✅
5. **Click split button** → Should show paywall ✅
6. **Click merge button** → Should show paywall ✅

### Step 3: Test Purchase Flow

1. Click "Upgrade to Pro" button
2. Verify Paddle checkout opens with correct product ($4.99)
3. Complete test purchase (use Paddle test mode)
4. Verify license key activation
5. Verify all Pro features unlock
6. Test license persistence across page refresh
7. Test license sync across browser tabs

### Step 4: Clear Demo Data

```javascript
// Run in production console to verify no test licenses persist
console.log(localStorage.getItem('subtitleshift_pro_status'));
console.log(localStorage.getItem('subtitleshift_license_key'));
// Should both be null for new users
```

### Step 5: Code Audit

Search for these patterns that shouldn't be in production:
```bash
grep -r "isPro.*true" src/hooks/
grep -r "demo" src/components/ProBadge.tsx
grep -r "Temporarily" src/
```

---

## 📝 Notes

### Current Status (2025-11-13)
- ✅ FREE_SUBTITLE_LIMIT temporarily set to 200 (was 50)
- ✅ All other paywall barriers are ACTIVE
- ⚠️ Before launch: Restore FREE_SUBTITLE_LIMIT to 50

### Paddle Integration
- **Pricing**: $4.99 one-time payment
- **Environment**: Currently using demo checkout
- **TODO**: Replace with real Paddle credentials before launch

### License Validation
- **Current**: Client-side only (localStorage)
- **Future**: Consider server-side validation for production
- **Risk**: Users can manually set localStorage to bypass (acceptable for v1)

### Demo Key Generation
- Enabled in `ProBadge.tsx` for testing
- Generates keys with format: `demo-{timestamp}-{random}`
- Consider disabling in production build

---

## 🎯 Quick Reference: File Locations

```
src/
├── hooks/
│   └── useProStatus.ts          # Core Pro status hook
├── utils/
│   └── license.ts               # License validation & storage
├── components/
│   ├── FileUpload.tsx           # Subtitle limit (line 9, 42-52)
│   ├── FindReplace.tsx          # Find & replace paywall (line 44-47)
│   ├── VideoPlayer.tsx          # Video upload paywall (line 41-46)
│   ├── SubtitleEditor.tsx       # Edit/split/merge paywalls (lines 18-22, 73-77, 88-92)
│   ├── PaywallModal.tsx         # Paywall UI component
│   └── ProBadge.tsx             # Pro status badge & license activation
```

---

## ❓ FAQ

**Q: How do I record a demo video with all features unlocked?**
A: Use Method 1 (Browser Console) from the "Quick Demo Setup" section. It's the fastest and doesn't require code changes.

**Q: I forgot to restore FREE_SUBTITLE_LIMIT before launching. What do I do?**
A: Deploy a hotfix immediately. Change line 9 in `FileUpload.tsx` from 200 to 50, commit, and redeploy.

**Q: Can users bypass the paywall by editing localStorage?**
A: Yes, currently. This is acceptable for v1. Consider server-side validation in v2.

**Q: What happens if a Pro user's license key is removed from localStorage?**
A: They lose Pro status immediately. The app polls localStorage every second to detect changes.

**Q: How do I test the paywall without clearing localStorage each time?**
A: Use incognito/private browsing window. Each new window starts as a free user.

---

**End of Document**
