# دليل البدء السريع للنشر | Quick Start Deployment Guide

## 🚀 البدء السريع | Quick Start

### 1. إعداد الملفات للنشر | Prepare Files for Deployment

#### على Windows:
```bash
cd helaly-erp/deployment
prepare-deployment.bat
```

#### على Linux/Mac:
```bash
cd helaly-erp/deployment
chmod +x prepare-deployment.sh
./prepare-deployment.sh yourdomain.com
```

### 2. تحديث اسم النطاق | Update Domain Name

في ملفات `deployment-ready/`:
- `sitemap.xml` - استبدل `yourdomain.com`
- `robots.txt` - استبدل `yourdomain.com`
- `index.html` - استبدل `yourdomain.com`

### 3. رفع الملفات | Upload Files

#### الطريقة الأولى: cPanel File Manager
1. افتح cPanel
2. File Manager → `public_html/`
3. ارفع جميع ملفات `deployment-ready/`

#### الطريقة الثانية: FTP (FileZilla)
1. افتح FileZilla
2. اتصل بـ `ftp.yourdomain.com`
3. ارفع جميع ملفات `deployment-ready/` إلى `public_html/`

### 4. تثبيت SSL | Install SSL

1. cPanel → SSL/TLS Status
2. اختر "Let's Encrypt"
3. اضغط "Install"

### 5. اختبار | Test

افتح: `https://yourdomain.com`

---

## ✅ قائمة التحقق السريعة | Quick Checklist

- [ ] الملفات جاهزة في `deployment-ready/`
- [ ] اسم النطاق محدث في جميع الملفات
- [ ] الملفات مرفوعة على `public_html/`
- [ ] SSL مثبت
- [ ] الموقع يعمل على `https://yourdomain.com`

---

## 📚 للمزيد من التفاصيل | For More Details

راجع:
- `DEPLOYMENT_GUIDE_AR.md` - الدليل الكامل بالعربي
- `DEPLOYMENT_GUIDE_EN.md` - Complete Guide in English

