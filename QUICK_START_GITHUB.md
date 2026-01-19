# دليل سريع: رفع المشروع إلى GitHub ونشره على Vercel

## ✅ ما تم إنجازه

1. ✅ تم تهيئة Git repository محلياً
2. ✅ تم إنشاء ملف `.gitignore`
3. ✅ تم إضافة جميع الملفات وإنشاء commit أولي
4. ✅ تم إعداد ملفات الإعدادات للـ GitHub و Vercel

## 🚀 الخطوات التالية

### 1. إنشاء مستودع على GitHub

1. اذهب إلى [github.com](https://github.com) وقم بتسجيل الدخول
2. انقر على "+" → "New repository"
3. اسم المستودع: `helaly-erp`
4. اختر Public أو Private
5. **لا تقم** بتهيئة المستودع (لا تضيف README أو .gitignore)
6. انقر "Create repository"

### 2. رفع الكود إلى GitHub

افتح PowerShell في مجلد المشروع وقم بتنفيذ:

```powershell
# تحديث PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# الانتقال إلى مجلد المشروع
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"

# إضافة remote (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/helaly-erp.git

# رفع الكود
git push -u origin main
```

**ملاحظة:** عند طلب كلمة المرور، استخدم **Personal Access Token** وليس كلمة المرور العادية.

#### إنشاء Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. اختر صلاحية `repo`
4. انسخ الرمز واستخدمه ككلمة مرور

### 3. النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول باستخدام GitHub
3. Add New Project → اختر `helaly-erp`
4. Build Settings:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
5. انقر Deploy

## 📚 ملفات المساعدة

- `GITHUB_SETUP.md` - دليل تفصيلي لإعداد GitHub
- `VERCEL_SETUP.md` - دليل تفصيلي لإعداد Vercel
- `push-to-github.ps1` - سكريبت PowerShell لرفع الكود تلقائياً

## ✨ الميزات

- ✅ Git repository جاهز
- ✅ ملف `.gitignore` شامل
- ✅ إعدادات Vercel جاهزة (`vercel.json`)
- ✅ تعليمات مفصلة بالعربية

## 🔍 التحقق من الحالة

```powershell
# حالة Git
git status

# الـ commits
git log --oneline

# الـ remotes
git remote -v
```

## 🆘 المساعدة

إذا واجهت مشاكل، راجع:
- `GITHUB_SETUP.md` للمشاكل المتعلقة بـ GitHub
- `VERCEL_SETUP.md` للمشاكل المتعلقة بـ Vercel

---

**جاهز للنشر! 🎉**
