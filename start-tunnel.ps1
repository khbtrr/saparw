param(
    [switch]$Rebuild
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$DistIndex = Join-Path $FrontendDir "dist\index.html"

Write-Host "=== Persiapan Server Lokal + Cloudflare Tunnel SapaRW 05 ===" -ForegroundColor Cyan

# 1. Pastikan symbolic link storage Laravel tersedia
if (-not (Test-Path (Join-Path $BackendDir "public\storage"))) {
    Write-Host "[1/4] Membuat symbolic link storage Laravel..." -ForegroundColor Yellow
    Push-Location $BackendDir
    php artisan storage:link
    Pop-Location
} else {
    Write-Host "[1/4] Symbolic link storage Laravel sudah siap." -ForegroundColor Green
}

# 2. Build produksi frontend jika belum ada atau diminta -Rebuild
if ($Rebuild -or -not (Test-Path $DistIndex)) {
    Write-Host "[2/4] Mem-build bundel produksi Frontend (Vite)..." -ForegroundColor Yellow
    npm --prefix $FrontendDir run build
} else {
    Write-Host "[2/4] Bundel produksi Frontend (frontend/dist) sudah tersedia. (Gunakan -Rebuild jika ada perubahan UI)" -ForegroundColor Green
}

# 3. Jalankan Backend Laravel (127.0.0.1:8000) & Frontend Preview (localhost:4173) di jendela terpisah
Write-Host "[3/4] Menyalakan server Backend Laravel (port 8000) dan Frontend Preview (port 4173)..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; Write-Host 'Backend Laravel berjalan di http://127.0.0.1:8000' -ForegroundColor Green; php artisan serve --host=127.0.0.1 --port=8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; Write-Host 'Frontend Produksi berjalan di http://localhost:4173' -ForegroundColor Green; npm run preview -- --host --port 4173"

Start-Sleep -Seconds 3

# 4. Jalankan Cloudflare Tunnel ke http://localhost:4173
Write-Host "[4/4] Membuka Cloudflare Tunnel ke http://localhost:4173..." -ForegroundColor Cyan
if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    cloudflared tunnel --url http://localhost:4173
} else {
    Write-Host ""
    Write-Host "Perhatian: 'cloudflared' belum ditemukan di PATH komputer ini." -ForegroundColor Red
    Write-Host "Silakan instal terlebih dahulu melalui PowerShell dengan perintah:" -ForegroundColor Yellow
    Write-Host "  winget install Cloudflare.cloudflared" -ForegroundColor White
    Write-Host "Setelah terinstal, buka kembali terminal baru dan jalankan:" -ForegroundColor Yellow
    Write-Host "  cloudflared tunnel --url http://localhost:4173" -ForegroundColor White
}
