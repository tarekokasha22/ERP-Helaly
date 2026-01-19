# 🚀 رفع الكود إلى GitHub - خطوات فورية

## ✅ ما تم إنجازه:
- ✅ تم ربط المستودع المحلي بـ GitHub: `https://github.com/tarekokasha22/ERP-Helaly`
- ✅ الفرع الحالي: `main`
- ✅ جميع الملفات جاهزة للرفع

## 📋 الخطوات التالية (خطوة واحدة فقط!):

### الخطوة الوحيدة: رفع الكود

افتح PowerShell في مجلد المشروع وقم بتنفيذ الأمر التالي:

```powershell
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git push -u origin main
```

### 🔐 عند طلب المصادقة:

**اسم المستخدم:** `tarekokasha22`

**كلمة المرور:** استخدم **Personal Access Token** (ليس كلمة المرور العادية)

#### إنشاء Personal Access Token (إذا لم يكن لديك واحد):

1. اذهب إلى: https://github.com/settings/tokens
2. انقر على **"Generate new token (classic)"**
3. أعطِه اسماً: `Vercel Deployment`
4. اختر الصلاحيات: ✅ **repo** (كامل)
5. انقر **"Generate token"**
6. **انسخ الرمز فوراً** (لن تتمكن من رؤيته مرة أخرى)
7. استخدم هذا الرمز ككلمة المرور عند رفع الكود

## ✨ بعد الرفع:

بعد رفع الكود بنجاح، ستجد جميع الملفات على:
**https://github.com/tarekokasha22/ERP-Helaly**

## 🎯 الخطوة التالية: النشر على Vercel

بعد رفع الكود إلى GitHub:

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول باستخدام GitHub
3. انقر **"Add New Project"**
4. اختر المستودع **`ERP-Helaly`**
5. Vercel سيكتشف الإعدادات تلقائياً من ملف `vercel.json`
6. انقر **"Deploy"**

## 🆘 إذا واجهت مشاكل:

### المشكلة: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/tarekokasha22/ERP-Helaly.git
git push -u origin main
```

### المشكلة: "Authentication failed"
- تأكد من استخدام Personal Access Token وليس كلمة المرور
- تأكد من أن الـ Token لديه صلاحية `repo`

### المشكلة: "Branch 'main' does not exist"
```powershell
git branch -M main
git push -u origin main
```

---

**جاهز للرفع الآن! 🎉**
