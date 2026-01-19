# Al-Helaly Construction ERP Deployment Guide for UltraHost

## 📋 Table of Contents

1. [Pre-Deployment Preparation](#1-pre-deployment-preparation)
2. [File Setup](#2-file-setup)
3. [Upload to UltraHost](#3-upload-to-ultrahost)
4. [UltraHost Configuration](#4-ultrahost-configuration)
5. [Post-Deployment Testing](#5-post-deployment-testing)
6. [Monitoring & Maintenance](#6-monitoring--maintenance)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pre-Deployment Preparation

### 1.1 Prepare Local Environment

```bash
# Navigate to project folder
cd helaly-erp/client

# Ensure all dependencies are installed
npm install

# Build for production
npm run build
```

### 1.2 Check Build Files

After building, verify the following folder exists:
`helaly-erp/client/build/`

It should contain:
- `index.html`
- `static/` (CSS and JS files)
- `logo.png`
- `logo2.webp`
- `manifest.json`
- `robots.txt`

### 1.3 Remove console.log (Optional)

The code is already set up to remove console.log in production, but you can verify in:
- `App.tsx`
- `Dashboard.tsx`
- All `.tsx` and `.ts` files

---

## 2. File Setup

### 2.1 Copy Deployment Files

Copy all files from the `deployment/` folder to the `build/` folder:

```bash
# Copy .htaccess
cp deployment/.htaccess client/build/.htaccess

# Copy robots.txt (if not exists)
cp deployment/robots.txt client/build/robots.txt

# Copy sitemap.xml
cp deployment/sitemap.xml client/build/sitemap.xml

# Copy optimized index.html (optional - can use existing)
cp deployment/index.html.optimized client/build/index.html
```

### 2.2 Update Domain Information

**In `sitemap.xml`:**
- Replace `yourdomain.com` with your actual domain

**In `robots.txt`:**
- Replace `https://yourdomain.com/sitemap.xml` with your domain

**In `index.html`:**
- Replace all `yourdomain.com` with your domain

**In `.htaccess`:**
- Review www/non-www settings and choose appropriate option

### 2.3 Folder Structure

```
build/
├── index.html
├── .htaccess
├── robots.txt
├── sitemap.xml
├── manifest.json
├── logo.png
├── logo2.webp
└── static/
    ├── css/
    │   └── main.*.css
    └── js/
        └── *.js
```

---

## 3. Upload to UltraHost

### 3.1 Method 1: cPanel File Manager

#### Upload Steps:

1. **Access cPanel**
   - Open: `https://yourdomain.com:2083` or `https://cpanel.yourdomain.com`
   - Log in with your credentials

2. **Open File Manager**
   - Find "File Manager" icon
   - Navigate to `public_html/` or `www/` folder

3. **Delete Old Files (if any)**
   - Select all existing files
   - Delete them or create a backup folder

4. **Upload Files**
   - Click "Upload" button
   - Select all files from `build/` folder
   - **Important**: Make sure to upload `.htaccess` (you may need to enable showing hidden files)

5. **Enable Hidden Files**
   - In File Manager: Settings → Show Hidden Files

6. **Move Files to public_html**
   - After upload, move all files from `uploads/` folder to `public_html/`

### 3.2 Method 2: FTP (FileZilla)

#### FileZilla Setup:

1. **Open FileZilla**
   - Download FileZilla from: https://filezilla-project.org/

2. **Configure Connection**
   ```
   Host: ftp.yourdomain.com or Server IP
   Username: Your UltraHost username
   Password: Your password
   Port: 21
   ```

3. **Connect**
   - Click "Quickconnect"

4. **Navigate to Correct Folder**
   - Right side (Remote site): Navigate to `public_html/`

5. **Upload Files**
   - Left side (Local site): Navigate to `build/` folder
   - Select all files
   - Drag and drop to `public_html/` or click "Upload"

6. **Ensure .htaccess is Uploaded**
   - In FileZilla: View → Show Hidden Files

### 3.3 Important Upload Settings

- **File Transfer**: Contents of `build/` folder should go directly into `public_html/`
- **.htaccess File**: Must be in root directory
- **Permissions**: Ensure correct permissions:
  - Files: `644`
  - Folders: `755`

---

## 4. UltraHost Configuration

### 4.1 SSL Certificate Setup

1. **Access cPanel**
2. **Find "SSL/TLS Status"**
3. **Select "Let's Encrypt"** (Free)
4. **Choose Domain**
5. **Install Certificate**

**Note**: After installing SSL, wait a few minutes for it to activate.

### 4.2 Database Setup (Future)

If you need a database in the future:

1. **Create Database**
   - cPanel → MySQL Databases
   - Create new database
   - Create new user
   - Link user to database
   - Grant all privileges

2. **Connection Info**
   ```
   Host: localhost
   Database: username_database
   Username: username_user
   Password: your_password
   ```

### 4.3 Email Setup

1. **Create Email Account**
   - cPanel → Email Accounts
   - Create new email (e.g., info@yourdomain.com)
   - Set password

2. **Access Email**
   - Webmail: `https://yourdomain.com:2096`
   - Or use email client like Outlook

---

## 5. Post-Deployment Testing

### 5.1 Testing Checklist

#### ✅ Basic Pages
- [ ] Homepage opens without errors
- [ ] Login page works
- [ ] Dashboard works
- [ ] Projects page works
- [ ] Sections page works
- [ ] Inventory page works
- [ ] Reports page works
- [ ] Employees page works
- [ ] Payments page works

#### ✅ Functionality
- [ ] Login works
- [ ] Navigation between pages works
- [ ] Language switching (Arabic/English) works
- [ ] All buttons and links work
- [ ] Forms work
- [ ] Messages and notifications appear

#### ✅ Performance
- [ ] Page load speed < 3 seconds
- [ ] Images load correctly
- [ ] Arabic fonts display correctly
- [ ] Icons and images display

#### ✅ Responsiveness
- [ ] Works on Desktop
- [ ] Works on Tablet
- [ ] Works on Mobile
- [ ] Menus and navigation work correctly

#### ✅ Security
- [ ] HTTPS works (https://yourdomain.com)
- [ ] No errors in Console
- [ ] Security Headers enabled (check Network tab)
- [ ] Sensitive files not accessible

#### ✅ SEO
- [ ] Meta tags present
- [ ] robots.txt works
- [ ] sitemap.xml works
- [ ] Title and description appear in search results

---

## 6. Monitoring & Maintenance

### 6.1 Error Monitoring

**Console Errors:**
1. Open Developer Tools (F12)
2. Console tab
3. Check for errors

**Network Errors:**
1. Developer Tools → Network
2. Check HTTP requests
3. Ensure all requests are successful (200, 304)

### 6.2 Backup Strategy

#### Weekly Backup:
1. **File Backup**
   - cPanel → File Manager
   - Compress `public_html/` folder
   - Download the backup

2. **Database Backup** (if exists)
   - cPanel → phpMyAdmin
   - Export database

### 6.3 Performance Monitoring

**Free Tools:**
- Google PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/
- Pingdom: https://tools.pingdom.com/

### 6.4 Regular Updates

- **Monthly**: Check for library updates
- **Weekly**: Check error logs
- **Daily**: Verify basic site functionality

---

## 7. Troubleshooting

### 7.1 White Screen

**Solution:**
1. Check `.htaccess` file - might have error
2. Check Console for errors
3. Check file permissions
4. Try temporarily deleting `.htaccess` for testing

### 7.2 404 Errors

**Solution:**
1. Ensure `.htaccess` file exists
2. Ensure `mod_rewrite` is enabled on UltraHost
3. Verify files are in `public_html/`

### 7.3 Slow Loading

**Solution:**
1. Check GZIP compression (in `.htaccess`)
2. Check Cache Headers
3. Optimize images (use WebP)
4. Check JS/CSS file sizes

### 7.4 SSL Issues

**Solution:**
1. Wait 10-15 minutes after installation
2. Verify certificate installed correctly
3. Ensure HTTPS redirect in `.htaccess`

### 7.5 Arabic Fonts Not Showing

**Solution:**
1. Check internet connection (for Google Fonts)
2. Check Content-Security-Policy in `.htaccess`
3. Ensure fonts loaded in `index.html`

### 7.6 Routing Issues

**Solution:**
1. Ensure `RewriteRule` exists in `.htaccess`
2. Ensure `mod_rewrite` is enabled
3. Verify Rewrite rule is correct

---

## 8. Contact & Support

### UltraHost Support
- **Website**: https://www.ultrahost.com/
- **Technical Support**: Through cPanel or email
- **Live Chat**: Available in control panel

### Additional Resources
- **React Router**: https://reactrouter.com/
- **React Deployment**: https://create-react-app.dev/docs/deployment/
- **Apache .htaccess**: https://httpd.apache.org/docs/current/howto/htaccess.html

---

## ✅ Final Checklist

Before declaring the site ready:

- [ ] All pages work
- [ ] SSL enabled and working
- [ ] Speed acceptable (< 3 seconds)
- [ ] Works on all devices
- [ ] No Console errors
- [ ] SEO config correct
- [ ] Backup ready
- [ ] Monitoring enabled

---

**Success! 🎉**

If you encounter any issues, refer to the "Troubleshooting" section above or contact UltraHost support.

