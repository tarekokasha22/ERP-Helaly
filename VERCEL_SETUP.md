# إعداد النشر على Vercel

بعد رفع الكود إلى GitHub، يمكنك نشر التطبيق على Vercel بسهولة.

## المتطلبات

- ✅ حساب على GitHub
- ✅ الكود مرفوع على GitHub
- ✅ حساب على Vercel (يمكنك التسجيل مجاناً)

## خطوات النشر

### 1. تسجيل الدخول إلى Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. انقر على "Sign Up" أو "Log In"
3. اختر "Continue with GitHub" لتسجيل الدخول باستخدام حساب GitHub

### 2. استيراد المشروع

1. بعد تسجيل الدخول، انقر على "Add New Project"
2. اختر المستودع `helaly-erp` من قائمة GitHub repositories
3. إذا لم يظهر المستودع، انقر على "Adjust GitHub App Permissions" واختر المستودع

### 3. إعدادات البناء (Build Settings)

Vercel سيكتشف الإعدادات تلقائياً، لكن تأكد من:

**Root Directory:** `helaly-erp` (أو اتركه فارغاً إذا كان المستودع يحتوي على المشروع مباشرة)

**Framework Preset:** Create React App (سيتم اكتشافه تلقائياً)

**Build Command:** 
```
cd client && npm install && npm run build
```

**Output Directory:**
```
client/build
```

**Install Command:**
```
cd client && npm install
```

### 4. متغيرات البيئة (Environment Variables)

إذا كان لديك متغيرات بيئة، أضفها في Vercel:

1. في صفحة إعدادات المشروع، اذهب إلى "Settings" → "Environment Variables"
2. أضف المتغيرات المطلوبة (مثل `REACT_APP_API_URL`)

**ملاحظة:** تأكد من أن ملف `.env` موجود في `.gitignore` ولا يتم رفعه إلى GitHub.

### 5. النشر

1. انقر على "Deploy"
2. انتظر حتى يكتمل البناء والنشر
3. ستحصل على رابط للتطبيق (مثل: `helaly-erp.vercel.app`)

## إعدادات إضافية للـ Backend

إذا كان لديك backend server، ستحتاج إلى:

### خيار 1: نشر الـ Backend بشكل منفصل

- استخدم Vercel Serverless Functions
- أو استخدم خدمة أخرى مثل Railway, Render, أو Heroku

### خيار 2: استخدام Vercel API Routes

يمكنك تحويل الـ backend إلى Vercel Serverless Functions في مجلد `api/`

## تحديثات تلقائية

بعد النشر الأولي، كل مرة ترفع فيها تغييرات إلى GitHub (git push)، سيتم تحديث التطبيق على Vercel تلقائياً!

## نطاقات مخصصة (Custom Domains)

يمكنك إضافة نطاق مخصص:

1. اذهب إلى "Settings" → "Domains"
2. أضف النطاق الخاص بك
3. اتبع التعليمات لإعداد DNS

## مراقبة الأداء

Vercel يوفر:
- Analytics للأداء
- Logs للأخطاء
- Monitoring للـ API calls

## استكشاف الأخطاء

### المشكلة: البناء فشل

- تحقق من Build Logs في Vercel Dashboard
- تأكد من أن جميع dependencies موجودة في `package.json`
- تأكد من أن Build Command صحيح

### المشكلة: التطبيق لا يعمل

- تحقق من Console Logs
- تأكد من أن API URLs صحيحة
- تحقق من Environment Variables

### المشكلة: CORS Errors

- تأكد من إعدادات CORS في الـ backend
- أضف نطاق Vercel إلى قائمة الـ allowed origins

## روابط مفيدة

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [React on Vercel](https://vercel.com/docs/frameworks/react)
