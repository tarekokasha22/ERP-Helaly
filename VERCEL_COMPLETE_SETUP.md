# 🚀 دليل شامل لإعدادات Vercel - Helaly ERP

## 📋 جدول المحتويات
1. [إعدادات البناء (Build Settings)](#إعدادات-البناء)
2. [متغيرات البيئة (Environment Variables)](#متغيرات-البيئة)
3. [إعدادات إضافية](#إعدادات-إضافية)
4. [إعداد Backend](#إعداد-backend)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🔧 إعدادات البناء (Build Settings)

### عند استيراد المشروع من GitHub:

1. **Framework Preset:** 
   - اختر **"Create React App"** أو اتركه على **"Auto-detect"**
   - Vercel سيكتشفه تلقائياً من `package.json`

2. **Root Directory:**
   - اتركه **فارغاً** (إذا كان المستودع يحتوي على المشروع مباشرة)
   - أو ضع: `helaly-erp` (إذا كان المستودع يحتوي على مجلدات متعددة)

3. **Build Command:**
   ```
   cd client && npm install && npm run build
   ```
   أو ببساطة:
   ```
   cd client && npm run build
   ```
   (Vercel يقوم بتثبيت dependencies تلقائياً)

4. **Output Directory:**
   ```
   client/build
   ```

5. **Install Command:**
   ```
   cd client && npm install
   ```
   (يمكن تركه فارغاً - Vercel يقوم به تلقائياً)

6. **Node.js Version:**
   - اتركه على **"Auto"** أو اختر **18.x** أو **20.x**

---

## 🔐 متغيرات البيئة (Environment Variables)

### كيفية إضافة Environment Variables:

1. في صفحة المشروع على Vercel، اذهب إلى **"Settings"**
2. انقر على **"Environment Variables"** من القائمة الجانبية
3. انقر على **"Add New"**
4. أدخل **Name** و **Value**
5. اختر البيئات المناسبة: ✅ **Production** ✅ **Preview** ✅ **Development**
6. انقر **"Save"**

### المتغيرات المطلوبة:

#### 1. **REACT_APP_API_URL** (مطلوب)

**الاسم:** `REACT_APP_API_URL`

**القيمة:** 
- إذا كان لديك Backend منفصل: `https://your-backend-url.com/api`
- إذا كنت تستخدم Mock API: `http://localhost:5000/api` (للتطوير فقط)
- للإنتاج: يجب أن يكون عنوان Backend الفعلي

**البيئات:** ✅ Production ✅ Preview ✅ Development

**مثال:**
```
REACT_APP_API_URL=https://helaly-api.vercel.app/api
```

#### 2. **REACT_APP_USE_MOCK_API** (اختياري)

**الاسم:** `REACT_APP_USE_MOCK_API`

**القيمة:** 
- `true` - لاستخدام Mock API (للتطوير)
- `false` - لاستخدام API الحقيقي (للإنتاج)

**البيئات:** ✅ Development فقط

**مثال:**
```
REACT_APP_USE_MOCK_API=false
```

#### 3. **REACT_APP_VERSION** (اختياري)

**الاسم:** `REACT_APP_VERSION`

**القيمة:** رقم الإصدار (مثل: `1.0.0`)

**مثال:**
```
REACT_APP_VERSION=1.0.0
```

#### 4. **REACT_APP_COMPANY_NAME** (اختياري)

**الاسم:** `REACT_APP_COMPANY_NAME`

**القيمة:** اسم الشركة

**مثال:**
```
REACT_APP_COMPANY_NAME=Al-Helaly Construction
```

#### 5. **REACT_APP_DEFAULT_LANGUAGE** (اختياري)

**الاسم:** `REACT_APP_DEFAULT_LANGUAGE`

**القيمة:** `ar` أو `en`

**مثال:**
```
REACT_APP_DEFAULT_LANGUAGE=ar
```

---

## ⚙️ إعدادات إضافية

### 1. Headers (إعدادات الأمان)

في **Settings** → **Headers**، أضف:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 2. Redirects & Rewrites

تم إعدادها تلقائياً في `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

هذا يضمن أن React Router يعمل بشكل صحيح.

### 3. Domains (النطاقات المخصصة)

1. اذهب إلى **Settings** → **Domains**
2. أضف النطاق الخاص بك (مثل: `erp.helaly.com`)
3. اتبع التعليمات لإعداد DNS

---

## 🖥️ إعداد Backend

### الخيار 1: نشر Backend على Vercel (Serverless Functions)

إذا أردت نشر Backend على Vercel أيضاً:

1. **إنشاء مجلد `api`** في جذر المشروع
2. **تحويل الـ routes** إلى Serverless Functions
3. **إضافة Environment Variables للـ Backend:**
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `MONGODB_URI` (إذا كنت تستخدم MongoDB)

### الخيار 2: Backend منفصل (موصى به)

نشر Backend على خدمة أخرى مثل:
- **Railway** (موصى به - سهل الاستخدام)
- **Render**
- **Heroku**
- **DigitalOcean**

ثم استخدم عنوان Backend في `REACT_APP_API_URL`

#### مثال إعداد Backend على Railway:

1. اذهب إلى [railway.app](https://railway.app)
2. أنشئ مشروع جديد
3. اربطه بمستودع GitHub
4. اختر مجلد `server`
5. أضف Environment Variables:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ANTHROPIC_API_KEY=your-api-key
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
6. Railway سيعطيك عنوان URL للـ Backend
7. استخدم هذا العنوان في `REACT_APP_API_URL` على Vercel

---

## 🔍 استكشاف الأخطاء

### المشكلة: البناء فشل

**الحل:**
1. تحقق من **Build Logs** في Vercel Dashboard
2. تأكد من أن `Build Command` صحيح
3. تأكد من أن `Output Directory` يشير إلى `client/build`
4. تحقق من أن جميع dependencies موجودة في `client/package.json`

### المشكلة: التطبيق لا يعمل بعد النشر

**الحل:**
1. افتح **Console** في المتصفح (F12)
2. تحقق من الأخطاء
3. تأكد من أن `REACT_APP_API_URL` مضبوط بشكل صحيح
4. تحقق من أن Backend يعمل ويمكن الوصول إليه

### المشكلة: CORS Errors

**الحل:**
1. تأكد من إضافة عنوان Vercel إلى `CORS_ORIGIN` في Backend
2. مثال:
   ```
   CORS_ORIGIN=https://helaly-erp.vercel.app
   ```

### المشكلة: Environment Variables لا تعمل

**الحل:**
1. تأكد من أن المتغيرات تبدأ بـ `REACT_APP_` (لـ React)
2. بعد إضافة متغيرات جديدة، قم بإعادة النشر
3. تحقق من أن المتغيرات مضبوطة للبيئة الصحيحة (Production/Preview)

### المشكلة: الصفحات لا تعمل (404)

**الحل:**
- تأكد من وجود `vercel.json` مع `rewrites` صحيح
- أو أضف `rewrites` في Vercel Settings

---

## 📝 مثال كامل لإعدادات Vercel

### Build Settings:
```
Framework Preset: Create React App
Root Directory: (فارغ)
Build Command: cd client && npm run build
Output Directory: client/build
Install Command: cd client && npm install
Node.js Version: 18.x
```

### Environment Variables:
```
REACT_APP_API_URL = https://helaly-api.railway.app/api
REACT_APP_USE_MOCK_API = false
REACT_APP_VERSION = 1.0.0
REACT_APP_COMPANY_NAME = Al-Helaly Construction
REACT_APP_DEFAULT_LANGUAGE = ar
```

---

## ✅ قائمة التحقق النهائية

قبل النشر، تأكد من:

- [ ] تم رفع الكود إلى GitHub
- [ ] تم إضافة `REACT_APP_API_URL` في Environment Variables
- [ ] تم إعداد Backend (إذا كان منفصل)
- [ ] تم إضافة عنوان Vercel إلى `CORS_ORIGIN` في Backend
- [ ] ملف `vercel.json` موجود وصحيح
- [ ] Build Settings مضبوطة بشكل صحيح
- [ ] تم اختبار البناء محلياً (`npm run build`)

---

## 🎯 بعد النشر

بعد النشر الناجح:

1. ✅ افتح رابط التطبيق
2. ✅ اختبر تسجيل الدخول
3. ✅ اختبر الوظائف الأساسية
4. ✅ تحقق من Console للأخطاء
5. ✅ راقب Logs في Vercel Dashboard

---

## 📞 المساعدة

إذا واجهت مشاكل:
- راجع **Build Logs** في Vercel
- راجع **Runtime Logs** في Vercel
- تحقق من **Console** في المتصفح
- راجع ملف `VERCEL_SETUP.md` للتفاصيل الأساسية

---

**جاهز للنشر! 🚀**
