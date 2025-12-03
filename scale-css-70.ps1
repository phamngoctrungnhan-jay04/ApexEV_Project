# PowerShell Script: Scale CSS xuống 70%
$files = @(
    'src\pages\auth\LoginPage-Modern.css',
    'src\pages\auth\RegisterPage-Modern.css',
    'src\pages\admin\AdminProfile.css',
    'src\pages\admin\AdminDashboard.css',
    'src\pages\admin\AdminUserRegister.css',
    'src\components\layout\Header.css',
    'src\components\layout\AdminSidebar.css',
    'src\components\layout\AdminLayout.css',
    'src\styles\ApexModernCard.css'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Scale px values (70%)
        $content = $content -replace '(\d+)px', { 
            param($match)
            $val = [double]$match.Groups[1].Value
            $newVal = [math]::Round($val * 0.7, 1)
            "${newVal}px"
        }
        
        # Scale rem values (70%)
        $content = $content -replace '(\d+\.?\d*)rem', {
            param($match)
            $val = [double]$match.Groups[1].Value  
            $newVal = [math]::Round($val * 0.7, 2)
            "${newVal}rem"
        }
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Scaled: $file" -ForegroundColor Green
    }
}
Write-Host "
Completed! All files scaled to 70%" -ForegroundColor Cyan
