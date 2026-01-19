# إعداد المستودع على GitHub

تم إعداد Git محلياً بنجاح! الآن تحتاج إلى رفع الكود إلى GitHub.

## الطريقة الأولى: استخدام السكريبت التلقائي

1. افتح PowerShell في مجلد المشروع
2. قم بتشغيل السكريبت التالي (استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك على GitHub):

```powershell
.\push-to-github.ps1 -RepoName "helaly-erp" -GitHubUsername "YOUR_USERNAME"
```

**ملاحظة:** ستحتاج إلى إنشاء المستودع على GitHub أولاً (انظر الطريقة الثانية).

## الطريقة الثانية: الإعداد اليدوي

### الخطوة 1: إنشاء مستودع على GitHub

1. اذهب إلى [GitHub.com](https://github.com) وقم بتسجيل الدخول
2. انقر على زر "+" في الزاوية العلوية اليمنى
3. اختر "New repository"
4. أدخل اسم المستودع: `helaly-erp`
5. اختر "Public" أو "Private" حسب تفضيلك
6. **لا تقم** بتهيئة المستودع بـ README أو .gitignore (لأننا لدينا بالفعل)
7. انقر على "Create repository"

### الخطوة 2: ربط المستودع المحلي بـ GitHub

افتح PowerShell في مجلد المشروع وقم بتنفيذ الأوامر التالية:

```powershell
# تحديث PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# الانتقال إلى مجلد المشروع
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"

# إضافة remote (استبدل YOUR_USERNAME باسم المستخدم الخاص بك)
git remote add origin https://github.com/YOUR_USERNAME/helaly-erp.git

# تغيير اسم الفرع إلى main (إذا كان master)
git branch -M main

# رفع الكود
git push -u origin main
```

### الخطوة 3: المصادقة

عند رفع الكود، سيطلب منك GitHub:
- **اسم المستخدم:** أدخل اسم المستخدم الخاص بك على GitHub
- **كلمة المرور:** استخدم **Personal Access Token** وليس كلمة المرور العادية

#### إنشاء Personal Access Token:

1. اذهب إلى GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. انقر على "Generate new token (classic)"
3. أعطِه اسماً (مثل: "Vercel Deployment")
4. اختر الصلاحيات: `repo` (كامل)
5. انقر على "Generate token"
6. **انسخ الرمز** واحفظه في مكان آمن (لن تتمكن من رؤيته مرة أخرى)

استخدم هذا الرمز ككلمة المرور عند رفع الكود.

## الطريقة الثالثة: استخدام GitHub CLI (أسهل)

إذا كنت تريد تثبيت GitHub CLI:

```powershell
winget install --id GitHub.cli
```

بعد التثبيت:

```powershell
# تسجيل الدخول
gh auth login

# إنشاء المستودع ورفع الكود
cd "c:\Users\tarek\OneDrive\Desktop\tarek\شغل\work helaly\h p\h p\helaly-erp"
gh repo create helaly-erp --public --source=. --remote=origin --push
```

## بعد رفع الكود إلى GitHub

بعد رفع الكود بنجاح، يمكنك استيراد المشروع إلى Vercel:

1. اذهب إلى [Vercel.com](https://vercel.com)
2. انقر على "Add New Project"
3. اختر المستودع `helaly-erp` من قائمة GitHub repositories
4. اتبع التعليمات لإكمال النشر

## ملاحظات مهمة

- تأكد من أن ملف `.env` موجود في `.gitignore` (تم إضافته بالفعل)
- لا ترفع ملفات `node_modules` أو `dist` (تم إضافتها إلى `.gitignore`)
- يمكنك التحقق من حالة Git باستخدام: `git status`
- يمكنك رؤية جميع الـ commits باستخدام: `git log`

## المساعدة

إذا واجهت أي مشاكل:
- تحقق من أن Git مثبت: `git --version`
- تحقق من حالة المستودع: `git status`
- تحقق من الـ remotes: `git remote -v`
