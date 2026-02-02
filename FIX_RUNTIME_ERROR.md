# 🔧 حل مشكلة Function Runtimes Error - خطوات واضحة

## ✅ الخطوات بالترتيب:

### الخطوة 1: تأكد من أن الملف محدث محلياً

الملف `vercel.json` يجب أن يكون هكذا (بدون قسم `functions`):

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && CI=false npm run build",
  "outputDirectory": "client/build",
  "installCommand": "cd client && npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### الخطوة 2: افتح PowerShell

1. اضغط `Windows + X`
2. اختر **"Windows PowerShell"** أو **"Terminal"**

---

### الخطوة 3: ارفع التغييرات إلى GitHub

انسخ **كل هذا** في PowerShell:

```powershell
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git add vercel.json
git commit -m "Fix: Remove functions config from vercel.json"
git push origin main
```

---

### الخطوة 4: انتظر حتى يكتمل الرفع

بعد رفع التغييرات، انتظر 10-20 ثانية.

---

### الخطوة 5: في Vercel Dashboard

1. اذهب إلى [vercel.com](https://vercel.com)
2. افتح مشروعك
3. اذهب إلى **"Deployments"**
4. انقر على **"Redeploy"** → **"Use Existing Build Cache"** (أو بدون cache)
5. أو انتظر حتى Vercel يعيد البناء تلقائياً

---

## 🔍 إذا استمرت المشكلة:

### الحل البديل: حذف مجلد `api` مؤقتاً

إذا كان مجلد `api` يسبب المشكلة:

1. في PowerShell:
```powershell
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git rm -r --cached api
git commit -m "Remove api folder temporarily"
git push origin main
```

2. أو أضف `api/` إلى `.gitignore`:
```powershell
echo "api/" >> .gitignore
git add .gitignore
git commit -m "Ignore api folder"
git push origin main
```

---

## ✅ التحقق من النجاح:

1. اذهب إلى GitHub: https://github.com/tarekokasha22/ERP-Helaly
2. افتح ملف `vercel.json`
3. تأكد أنه **لا يحتوي** على قسم `functions`
4. اذهب إلى Vercel Dashboard
5. تحقق من أن البناء نجح

---

## 💡 ملاحظة مهمة:

إذا كنت تريد نشر Backend أيضاً، **الأفضل** هو استخدام **Railway**:

1. اذهب إلى [railway.app](https://railway.app)
2. أنشئ مشروع جديد
3. اربطه بمستودع GitHub
4. اختر Root Directory: `server`
5. أضف Environment Variables
6. استخدم عنوان Railway في `REACT_APP_API_URL`

---

**اتبع الخطوات بالترتيب! 🚀**
