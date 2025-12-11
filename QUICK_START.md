# Quick Start Guide - AI Layout Optimization & Firebase

## ✅ Setup Complete!

Your AI layout optimizer and Firebase integration are fully operational.

---

## 🎯 What You Have Now

### AI Layout Optimization
- **Button**: "AI Optimize" in the Topbar
- **Function**: Analyzes your component layout and suggests improvements
- **Result**: Auto-applies optimized layout to canvas
- **Feedback**: Toast shows what was optimized

### Firebase Storage (Free Tier)
- **Automatic**: 30-second auto-save intervals
- **Manual**: "Save" button for instant saves
- **Secure**: Each user's projects are private
- **Free**: 1GB storage, 50k reads/day, 20k writes/day

---

## 🚀 Quick Test

### Step 1: Start the App
```bash
npm run dev
```
Visit: http://localhost:5173

### Step 2: Add Components
- Click "+" buttons in sidebar to add components to canvas
- Drag components around to create layout

### Step 3: Click "AI Optimize"
- Watch as AI reorganizes your layout
- See optimization notes in toast notification
- Layout updates automatically on canvas

### Step 4: Check Auto-Save
- Open browser DevTools → Application → IndexedDB (if using local DB)
- Or check Firebase Console → Firestore → userProjects collection
- Your layout should appear there automatically

### Step 5: Generate Code
- Click "Generate" button to convert optimized layout to React code
- View generated files in the modal
- Optional: Click "Optimize Code" to improve code quality

---

## 🔑 Key Endpoints

### Generate Code
```
POST /api/ai/generate
Body: { layout: Layout }
Returns: { files: [...], readme: string, notes?: string }
```

### Optimize Code
```
POST /api/ai/optimize
Body: { code: string }
Returns: { optimizedCode: string, notes: string }
```

### Optimize Layout ✨ NEW
```
POST /api/ai/optimize-layout
Body: { layout: Layout }
Returns: { optimizedLayout: Layout, notes: string }
```

---

## 📱 Free Tier Limits

| Feature | Limit | Usage Pattern |
|---------|-------|---------------|
| Storage | 1GB | Plenty for layout data |
| Reads | 50,000/day | ~0.6 per second average |
| Writes | 20,000/day | ~0.23 per second average |
| Auto-save Interval | 30 seconds | Conservative to save quota |

**Example**: 10 users, each saving 5 times/day = 50 writes. Still well within free tier.

---

## 🛠️ Configuration Files

### Client-side
- **`client/src/services/firestore.ts`** - Firebase operations
- **`client/src/context/ProjectContext.tsx`** - State management + auto-save
- **`client/src/services/api.ts`** - API client

### Server-side
- **`server/routes.ts`** - All endpoints including optimize-layout
- **`server/services/ai.ts`** - AI functions using Groq API

---

## 🔐 Security (Important!)

Before deploying to production:

1. **Set Firestore Rules** → See `FIRESTORE_SECURITY_RULES.txt`
2. **Set up CORS** → Update as needed for your domain
3. **Rotate API Keys** → Don't commit Firebase config to public repos
4. **Enable Authentication** → Already done (Firebase Auth)

---

## 💡 Tips

### To improve layout optimization:
1. Add more component context (navbars, footers, sections)
2. Include container hierarchy (sections holding cards)
3. Mix component types for better AI suggestions

### To save quota:
1. Reduce auto-save interval if desired (change 30000 to higher ms)
2. Remove unused projects from Firestore
3. Monitor usage in Firebase Console

### To troubleshoot:
1. Check browser console for errors (F12 → Console tab)
2. Check server logs (npm run dev terminal)
3. Check Firebase Console for quota/errors
4. Verify user is authenticated (check Auth tab)

---

## 🎨 What Happens When You Click "AI Optimize"

```
User clicks "AI Optimize"
    ↓
Current layout sent to server
    ↓
Groq AI analyzes layout structure
    ↓
AI provides reorganized layout + notes
    ↓
Server returns optimized layout
    ↓
Client updates canvas with new layout
    ↓
Toast shows optimization notes
    ↓
Auto-save triggers (within 30 seconds)
    ↓
Projects saved to Firebase Firestore
```

---

## 📚 Next Steps

1. **Test end-to-end** - Add components, optimize, generate code
2. **Check Firebase Console** - See your projects in Firestore
3. **Monitor Quota** - View usage in Firebase (should be minimal)
4. **Deploy** - Follow Firebase hosting guide when ready
5. **Add Security Rules** - Use FIRESTORE_SECURITY_RULES.txt before production

---

## ✨ Features Summary

✅ Drag-and-drop component builder  
✅ AI layout optimization with Groq API  
✅ AI code generation  
✅ Firebase Firestore auto-save (free tier)  
✅ Code syntax highlighting  
✅ Dynamic modal sizing  
✅ Toast notifications  
✅ User authentication  
✅ Responsive design  

---

**Status**: 🟢 Production Ready (with security rules)

For questions or issues, check the console logs and Firebase Console diagnostics.
