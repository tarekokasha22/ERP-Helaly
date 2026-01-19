# Al-Helaly Construction ERP - Deployment Package
# حزمة نشر نظام الهلالي لإدارة المشاريع

## 📁 محتويات المجلد | Folder Contents

### ملفات التكوين | Configuration Files

- **`.htaccess`** - إعدادات Apache للخادم (Security, Caching, Compression)
- **`robots.txt`** - توجيهات محركات البحث
- **`sitemap.xml`** - خريطة الموقع لمحركات البحث
- **`index.html.optimized`** - نسخة محسّنة من index.html مع SEO meta tags

### أدلة النشر | Deployment Guides

- **`DEPLOYMENT_GUIDE_AR.md`** - دليل النشر الكامل بالعربي
- **`DEPLOYMENT_GUIDE_EN.md`** - Complete Deployment Guide in English
- **`QUICK_START.md`** - دليل البدء السريع | Quick Start Guide
- **`MONITORING.md`** - دليل المراقبة والصيانة | Monitoring & Maintenance Guide

### سكربتات الإعداد | Setup Scripts

- **`prepare-deployment.bat`** - سكربت إعداد للنشر (Windows)
- **`prepare-deployment.sh`** - سكربت إعداد للنشر (Linux/Mac)

---

## 🚀 البدء السريع | Quick Start

### 1. إعداد الملفات | Prepare Files

**Windows:**
```bash
cd helaly-erp/deployment
prepare-deployment.bat
```

**Linux/Mac:**
```bash
cd helaly-erp/deployment
chmod +x prepare-deployment.sh
./prepare-deployment.sh yourdomain.com
```

### 2. تحديث اسم النطاق | Update Domain

في جميع الملفات في مجلد `deployment-ready/`:
- استبدل `yourdomain.com` بنطاقك الفعلي

### 3. رفع الملفات | Upload Files

- **cPanel File Manager**: ارفع محتويات `deployment-ready/` إلى `public_html/`
- **FTP (FileZilla)**: ارفع محتويات `deployment-ready/` إلى `public_html/`

### 4. تثبيت SSL | Install SSL

1. cPanel → SSL/TLS Status
2. اختر "Let's Encrypt"
3. اضغط "Install"

---

## 📚 للمزيد من المعلومات | For More Information

راجع:
- **`DEPLOYMENT_GUIDE_AR.md`** - للدليل الكامل بالعربي
- **`DEPLOYMENT_GUIDE_EN.md`** - For Complete Guide in English

---

## ✅ قائمة التحقق | Checklist

قبل النشر:
- [ ] بناء المشروع (`npm run build`)
- [ ] نسخ ملفات النشر إلى مجلد `build/`
- [ ] تحديث اسم النطاق في جميع الملفات
- [ ] مراجعة إعدادات `.htaccess`
- [ ] رفع الملفات إلى `public_html/`
- [ ] تثبيت SSL
- [ ] اختبار الموقع

---

## 📞 الدعم | Support

- **UltraHost Support**: https://www.ultrahost.com/
- **Documentation**: راجع ملفات الدليل أعلاه

---

**ملاحظة**: تأكد من تحديث اسم النطاق (`yourdomain.com`) في جميع الملفات قبل النشر!

