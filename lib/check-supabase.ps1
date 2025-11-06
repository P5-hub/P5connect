Write-Host "=== Supabase Client Check ===" -ForegroundColor Cyan

$files = Get-ChildItem -Recurse -Include *.ts,*.tsx | Where-Object {
    Select-String -Path $_.FullName -Pattern "createClient|getSupabaseServer" -Quiet
}

if (-not $files) {
    Write-Host "OK - Keine Dateien mit Supabase-Funktionen gefunden." -ForegroundColor Green
    exit
}

foreach ($f in $files) {
    $content = Get-Content $f.FullName
    $isAsync = $false
    $hasAwait = $false
    $lineNum = 0

    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match "async\s+function\s+(createClient|getSupabaseServer)") {
            $isAsync = $true
            $lineNum = $i + 1
        }
        if ($content[$i] -match "await\s+(createClient|getSupabaseServer)") {
            $hasAwait = $true
            $lineNum = $i + 1
        }
    }

    if ($isAsync -or $hasAwait) {
        Write-Host "⚠ Problem in $($f.FullName) (Zeile $lineNum)" -ForegroundColor Yellow
        if ($isAsync) { Write-Host "   -> 'async function' gefunden" -ForegroundColor Red }
        if ($hasAwait) { Write-Host "   -> 'await' Verwendung gefunden" -ForegroundColor Red }
    } else {
        Write-Host "OK: $($f.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Check abgeschlossen." -ForegroundColor Cyan
