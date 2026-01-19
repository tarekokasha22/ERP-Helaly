# ⚡ مرجع سريع لإعدادات Vercel

## 🔧 Build Settings (إعدادات البناء)

```
Framework Preset: Create React App
Root Directory: (فارغ)
Build Command: cd client && npm run build
Output Directory: client/build
Install Command: cd client && npm install
```

## 🔐 Environment Variables (متغيرات البيئة) - المطلوبة

### 1. REACT_APP_API_URL (مطلوب)
```
Name: REACT_APP_API_URL
Value: https://your-backend-url.com/api
Environments: ✅ Production ✅ Preview ✅ Development
```

**مثال:**
- إذا كان Backend على Railway: `https://helaly-api.railway.app/api`
- إذا كان Backend على Render: `https://helaly-api.onrender.com/api`
- إذا كان Backend على Vercel: `https://helaly-api.vercel.app/api`

### 2. REACT_APP_USE_MOCK_API (اختياري - للتطوير فقط)
```
Name: REACT_APP_USE_MOCK_API
Value: false
Environments: ✅ Development فقط
```

## 📝 خطوات إضافة Environment Variables

1. **Settings** → **Environment Variables**
2. انقر **"Add New"**
3. أدخل **Name** و **Value**
4. اختر البيئات: ✅ **Production** ✅ **Preview** ✅ **Development**
5. انقر **"Save"**
6. **أعد النشر** (Redeploy) بعد إضافة متغيرات جديدة

## ⚠️ ملاحظات مهمة

- ✅ جميع متغيرات React يجب أن تبدأ بـ `REACT_APP_`
- ✅ بعد إضافة متغيرات جديدة، يجب إعادة النشر
- ✅ تأكد من أن Backend يعمل قبل إضافة `REACT_APP_API_URL`
- ✅ أضف عنوان Vercel إلى `CORS_ORIGIN` في Backend

## 🎯 مثال كامل

### Environment Variables:
```
REACT_APP_API_URL = https://helaly-api.railway.app/api
REACT_APP_USE_MOCK_API = false
```

### Build Settings:
```
Build Command: cd client && npm run build
Output Directory: client/build
```

---

**للمزيد من التفاصيل، راجع:** `VERCEL_COMPLETE_SETUP.md`
