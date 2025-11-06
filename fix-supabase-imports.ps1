Write-Host "=== Supabase Import Fix gestartet ===" -ForegroundColor Cyan

# Alle .ts und .tsx-Dateien außer node_modules
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    $changed = $false

    # 1️⃣ Import ersetzen
    if ($content -match "import\s*{\s*createClient\s*}\s*from\s*['""]@/utils/supabase/server['""]") {
        Write-Host ("🛠 Fixe Datei: " + $file.FullName) -ForegroundColor Yellow
        $content = $content -replace "import\s*{\s*createClient\s*}\s*from\s*['""]@/utils/supabase/server['""]", 'import { getSupabaseServer } from "@/utils/supabase/server"'
        $changed = $true
    }

    # 2️⃣ Funktionsaufruf ersetzen
    if ($content -match "createClient\s*\(\s*\)") {
        $content = $content -replace "createClient\s*\(\s*\)", "await getSupabaseServer()"
        $changed = $true
    }

    # Wenn geändert → speichern
    if ($changed) {
        $content | Set-Content -Path $file.FullName -Encoding UTF8
    }
}

Write-Host ""
Write-Host "✅ Supabase-Importe überprüft und korrigiert!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
