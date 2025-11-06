# 🔧 Skript: Supabase-Aufrufe korrigieren
# await getSupabaseServer() → getSupabaseServer()
# await createClient() → createClient()

$root = "C:\Users\Violante\Documents\Persdat\Matthias Violante\p5-app"

Write-Host "🔍 Durchsuche alle TypeScript-Dateien in $root ..." -ForegroundColor Cyan

# Alle .ts und .tsx-Dateien ausser node_modules
$files = Get-ChildItem -Path $root -Recurse -Include *.ts, *.tsx | Where-Object {
    $_.FullName -notmatch "node_modules"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    if ($content -match 'await\s+getSupabaseServer' -or $content -match 'await\s+createClient') {
        Write-Host "🛠️  Bearbeite Datei: $($file.FullName)" -ForegroundColor Yellow

        $content = $content -replace 'await\s+getSupabaseServer\s*\(\s*\)', 'getSupabaseServer()'
        $content = $content -replace 'await\s+createClient\s*\(\s*\)', 'createClient()'

        $content | Set-Content -Encoding UTF8 $file.FullName
    }
}

Write-Host "✅ Alle await-Aufrufe korrigiert!" -ForegroundColor Green

# Supabase await-Fixes
$root = "C:\Users\Violante\Documents\Persdat\Matthias Violante\p5-app"

Write-Host "🔍 Suche Dateien..." -ForegroundColor Cyan
$files = Get-ChildItem -Path $root -Recurse -Include *.ts, *.tsx | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'await\s+getSupabaseServer' -or $content -match 'await\s+createClient') {
        Write-Host "🛠️  Fixe Datei: $($file.FullName)" -ForegroundColor Yellow
        $content = $content -replace 'await\s+getSupabaseServer\s*\(\s*\)', 'getSupabaseServer()'
        $content = $content -replace 'await\s+createClient\s*\(\s*\)', 'createClient()'
        $content | Set-Content -Encoding UTF8 $file.FullName
    }
}

Write-Host "✅ Fertig!" -ForegroundColor Green

