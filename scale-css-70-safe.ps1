# PowerShell Script: Scale CSS an toàn xuống 70%
$files = @(
    'src\pages\auth\LoginPage-Modern.css',
    'src\pages\auth\RegisterPage-Modern.css'
)

function Scale-CSSValue {
    param($content)
    
    # Chỉ scale các pattern đơn giản, tránh CSS variables và shadows
    # Scale font-size
    $content = $content -replace '(font-size:\s*)(\d+\.?\d*)px', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 1)
        "$($m.Groups[1].Value)${val}px"
    }
    
    # Scale padding/margin với 1 giá trị
    $content = $content -replace '(padding|margin):\s*(\d+\.?\d*)(px|rem)', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 2)
        "$($m.Groups[1].Value): ${val}$($m.Groups[3].Value)"
    }
    
    # Scale width/height đơn giản
    $content = $content -replace '(width|height|min-width|min-height|max-width|max-height):\s*(\d+)(px)', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 1)
        "$($m.Groups[1].Value): ${val}px"
    }
    
    # Scale top/left/right/bottom
    $content = $content -replace '(top|left|right|bottom):\s*(\d+)(px)', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 1)
        "$($m.Groups[1].Value): ${val}px"
    }
    
    # Scale gap
    $content = $content -replace '(gap):\s*(\d+\.?\d*)(px|rem)', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 2)
        "$($m.Groups[1].Value): ${val}$($m.Groups[3].Value)"
    }
    
    # Scale border-radius
    $content = $content -replace '(border-radius):\s*(\d+\.?\d*)(px|rem)', {
        param($m)
        $val = [math]::Round([double]$m.Groups[2].Value * 0.7, 2)
        "$($m.Groups[1].Value): ${val}$($m.Groups[3].Value)"
    }
    
    return $content
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = Scale-CSSValue $content
        Set-Content $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Scaled: $file" -ForegroundColor Green
    }
}
Write-Host "
Completed!" -ForegroundColor Cyan
