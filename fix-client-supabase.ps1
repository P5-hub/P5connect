Write-Host "=== Supabase Client-Fix gestartet ===" -ForegroundColor Cyan

# Alle betroffenen React-Komponenten finden (clientseitige Dateien)
$clientFiles = Get-ChildItem -Recurse -Include *.ts,*.tsx |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        ($_.FullName -match "components" -or $_.FullName -match "\(dealer\)")
    }

foreach ($file in $clientFiles) {
    $content = Get-Content $file.FullName | Out-String
    $changed = $false

    # 1️⃣ Server-Import wieder auf Client-Import ändern
    if ($content -match "import\s*{\s*getSupabaseServer\s*}\s*from\s*['""]@/utils/supabase/server['""]") {
        Write-Host ("Fixe Datei: " + $file.FullName) -ForegroundColor Yellow
        $content = $content -replace "import\s*{\s*getSupabaseServer\s*}\s*from\s*['""]@/utils/supabase/server['""]", 'import { createClient } from "@/utils/supabase/client"'
        $changed = $true
    }

    # 2️⃣ await-Aufruf entfernen
    if ($content -match "await\s+getSupabaseServer\s*\(\s*\)") {
        $content = $content -replace "await\s+getSupabaseServer\s*\(\s*\)", "createClient()"
        $changed = $true
    }

    # Wenn geändert → speichern
    if ($changed) {
        $content | Set-Content -Path $file.FullName -Encoding UTF8
    }
}

Write-Host ""
Write-Host "Client-Komponenten korrigiert! Jetzt sollte 'npm run build' wieder laufen." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
