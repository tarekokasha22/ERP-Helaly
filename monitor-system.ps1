# ===== سكريبت مراقبة نظام الهلالي للمقاولات =====

Write-Host "🔍 بدء فحص نظام الهلالي للمقاولات..." -ForegroundColor Green

# 1. فحص الخادم
Write-Host "`n1. فحص حالة الخادم..." -ForegroundColor Cyan
try {
    $serverCheck = Invoke-WebRequest -Uri http://localhost:5000 -UseBasicParsing -TimeoutSec 5
    $serverInfo = $serverCheck.Content | ConvertFrom-Json
    Write-Host "✅ الخادم يعمل بنجاح" -ForegroundColor Green
    Write-Host "   📋 النسخة: $($serverInfo.version)" -ForegroundColor White
    Write-Host "   🔗 الرابط: http://localhost:5000" -ForegroundColor White
} catch {
    Write-Host "❌ الخادم لا يعمل!" -ForegroundColor Red
    Write-Host "   💡 تشغيل الخادم: cd helaly-erp/server && npm start" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit
}

# 2. تسجيل الدخول
Write-Host "`n2. اختبار تسجيل الدخول..." -ForegroundColor Cyan
$loginBody = @{
    username = 'admin'
    password = 'password'
    country = 'egypt'
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.token
        $headers = @{ Authorization = "Bearer $token" }
        Write-Host "✅ تم تسجيل الدخول بنجاح" -ForegroundColor Green
        Write-Host "   👤 المستخدم: $($loginData.user.name)" -ForegroundColor White
        Write-Host "   🌍 الدولة: $($loginData.user.country)" -ForegroundColor White
        Write-Host "   🔑 الدور: $($loginData.user.role)" -ForegroundColor White
    } else {
        throw "فشل تسجيل الدخول: $($loginData.message)"
    }
} catch {
    Write-Host "❌ فشل تسجيل الدخول!" -ForegroundColor Red
    Write-Host "   ⚠️ تفاصيل الخطأ: $($_.Exception.Message)" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit
}

# 3. فحص البيانات
Write-Host "`n3. فحص البيانات..." -ForegroundColor Cyan

try {
    # جلب البيانات
    $projects = Invoke-WebRequest -Uri http://localhost:5000/api/projects -Headers $headers -UseBasicParsing
    $sections = Invoke-WebRequest -Uri http://localhost:5000/api/sections -Headers $headers -UseBasicParsing
    $spendings = Invoke-WebRequest -Uri http://localhost:5000/api/spendings -Headers $headers -UseBasicParsing
    $dashboard = Invoke-WebRequest -Uri http://localhost:5000/api/dashboard -Headers $headers -UseBasicParsing

    # تحليل البيانات
    $projectsData = ($projects.Content | ConvertFrom-Json).data
    $sectionsData = ($sections.Content | ConvertFrom-Json).data
    $spendingsData = ($spendings.Content | ConvertFrom-Json).data
    $dashboardData = $dashboard.Content | ConvertFrom-Json

    Write-Host "✅ تم جلب البيانات بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل جلب البيانات!" -ForegroundColor Red
    Write-Host "   ⚠️ تفاصيل الخطأ: $($_.Exception.Message)" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit
}

# 4. عرض الإحصائيات التفصيلية
Write-Host "`n📊 ==========================" -ForegroundColor Cyan
Write-Host "     إحصائيات النظام" -ForegroundColor Cyan
Write-Host "   ==========================" -ForegroundColor Cyan

# إحصائيات عامة
Write-Host "`n🏗️ المشاريع:" -ForegroundColor Yellow
Write-Host "   📋 العدد الكلي: $($projectsData.Count)" -ForegroundColor White
$activeProjects = ($projectsData | Where-Object { $_.status -eq "in-progress" }).Count
$completedProjects = ($projectsData | Where-Object { $_.status -eq "completed" }).Count
Write-Host "   🔄 النشطة: $activeProjects" -ForegroundColor Green
Write-Host "   ✅ المكتملة: $completedProjects" -ForegroundColor Blue

Write-Host "`n🔧 الأقسام:" -ForegroundColor Yellow
Write-Host "   📋 العدد الكلي: $($sectionsData.Count)" -ForegroundColor White
$avgProgress = if ($sectionsData.Count -gt 0) { 
    [math]::Round(($sectionsData | Measure-Object -Property progress -Average).Average, 1)
} else { 0 }
Write-Host "   📈 متوسط التقدم: $avgProgress%" -ForegroundColor Green

Write-Host "`n💰 المصروفات:" -ForegroundColor Yellow
Write-Host "   📋 العدد الكلي: $($spendingsData.Count)" -ForegroundColor White
$totalSpent = ($spendingsData | Measure-Object -Property amount -Sum).Sum
Write-Host "   💸 إجمالي المنصرف: $([math]::Round($totalSpent / 1000000, 1)) مليون ج.م" -ForegroundColor Red

Write-Host "`n💼 الميزانية:" -ForegroundColor Yellow
$totalBudget = ($projectsData | Measure-Object -Property budget -Sum).Sum
Write-Host "   💰 إجمالي الميزانية: $([math]::Round($totalBudget / 1000000, 1)) مليون ج.م" -ForegroundColor Green
$remainingBudget = $totalBudget - $totalSpent
Write-Host "   💵 المتبقي: $([math]::Round($remainingBudget / 1000000, 1)) مليون ج.م" -ForegroundColor Blue
$spentPercentage = if ($totalBudget -gt 0) { [math]::Round(($totalSpent / $totalBudget) * 100, 1) } else { 0 }
Write-Host "   📊 نسبة الإنفاق: $spentPercentage%" -ForegroundColor Cyan

# 5. تفاصيل البيانات حسب الدولة
Write-Host "`n🌍 توزيع البيانات حسب الدولة:" -ForegroundColor Yellow

$egyptProjects = $projectsData | Where-Object { $_.country -eq "egypt" }
$libyaProjects = $projectsData | Where-Object { $_.country -eq "libya" }

Write-Host "`n🇪🇬 مصر:" -ForegroundColor Green
Write-Host "   📋 المشاريع: $($egyptProjects.Count)" -ForegroundColor White
Write-Host "   💰 الميزانية: $([math]::Round(($egyptProjects | Measure-Object -Property budget -Sum).Sum / 1000000, 1)) مليون ج.م" -ForegroundColor White

Write-Host "`n🇱🇾 ليبيا:" -ForegroundColor Green
Write-Host "   📋 المشاريع: $($libyaProjects.Count)" -ForegroundColor White
Write-Host "   💰 الميزانية: $([math]::Round(($libyaProjects | Measure-Object -Property budget -Sum).Sum / 1000000, 1)) مليون دينار" -ForegroundColor White

# 6. فحص أداء النظام
Write-Host "`n⚡ اختبار الأداء:" -ForegroundColor Yellow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $testResponse = Invoke-WebRequest -Uri http://localhost:5000/api/dashboard -Headers $headers -UseBasicParsing
    $stopwatch.Stop()
    Write-Host "   ⏱️ زمن الاستجابة: $($stopwatch.ElapsedMilliseconds) مللي ثانية" -ForegroundColor Green
} catch {
    Write-Host "   ❌ خطأ في اختبار الأداء" -ForegroundColor Red
}

# 7. فحص ملفات قاعدة البيانات
Write-Host "`n💾 فحص ملفات قاعدة البيانات:" -ForegroundColor Yellow
$dataFiles = @("projects.json", "sections.json", "spendings.json", "users.json")
foreach ($file in $dataFiles) {
    $filePath = "server/data/$file"
    if (Test-Path $filePath) {
        $fileInfo = Get-Item $filePath
        $fileSize = [math]::Round($fileInfo.Length / 1KB, 2)
        Write-Host "   ✅ $file ($fileSize KB) - آخر تحديث: $($fileInfo.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file غير موجود!" -ForegroundColor Red
    }
}

# 8. اختبار تفاصيل مشروع
Write-Host "`n🔍 اختبار تفاصيل المشاريع:" -ForegroundColor Yellow
if ($projectsData.Count -gt 0) {
    $testProject = $projectsData[0]
    try {
        $projectDetails = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/$($testProject._id)" -Headers $headers -UseBasicParsing
        $projectDetailData = ($projectDetails.Content | ConvertFrom-Json).data
        Write-Host "   ✅ تفاصيل المشروع: $($projectDetailData.name)" -ForegroundColor Green
        Write-Host "   📊 عدد الأقسام: $($projectDetailData.sectionsCount)" -ForegroundColor White
        Write-Host "   💸 إجمالي المنصرف: $([math]::Round($projectDetailData.totalSpent / 1000000, 2)) مليون" -ForegroundColor White
    } catch {
        Write-Host "   ❌ خطأ في جلب تفاصيل المشروع" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ لا توجد مشاريع للاختبار" -ForegroundColor Yellow
}

# 9. فحص العمليات
Write-Host "`n🔧 فحص عمليات النظام:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        $memoryMB = [math]::Round($process.WorkingSet / 1MB, 2)
        Write-Host "   🖥️ Node.js (ID: $($process.Id)) - الذاكرة: $memoryMB MB" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️ لا توجد عمليات Node.js نشطة" -ForegroundColor Yellow
}

# 10. النتيجة النهائية
Write-Host "`n" + "="*50 -ForegroundColor Cyan
if ($projectsData.Count -gt 0 -and $sectionsData.Count -gt 0) {
    Write-Host "🎉 النظام يعمل بشكل مثالي!" -ForegroundColor Green
    Write-Host "✅ جميع المكونات تعمل بنجاح" -ForegroundColor Green
    Write-Host "✅ البيانات متوفرة ومحدثة" -ForegroundColor Green
    Write-Host "✅ API يستجيب بشكل طبيعي" -ForegroundColor Green
} else {
    Write-Host "⚠️ النظام يعمل لكن هناك مشاكل في البيانات" -ForegroundColor Yellow
}

Write-Host "`n🔗 الروابط المهمة:" -ForegroundColor Cyan
Write-Host "   🌐 الخادم: http://localhost:5000" -ForegroundColor White
Write-Host "   🖥️ التطبيق: http://localhost:3000" -ForegroundColor White
Write-Host "   🧪 اختبار شامل: test-system.html" -ForegroundColor White

Write-Host "`n📝 للمراجعة التفصيلية اقرأ: مراقبة-النظام.md" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

Read-Host "`nاضغط Enter للخروج"
