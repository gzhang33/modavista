$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dist = Join-Path -Path (Resolve-Path '..').Path -ChildPath 'dist'
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

$zipPath = Join-Path $dist "deploy-DreaModa.store-$timestamp.zip"
$root = (Resolve-Path '..').Path

$items = @('api','assets','admin','images','index.html','product.html','.htaccess','HOSTINGER_DEPLOYMENT.md')
$tempDir = Join-Path $env:TEMP "deploy-$timestamp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

foreach ($i in $items) {
  $src = Join-Path $root $i
  if (Test-Path $src) {
    Copy-Item $src -Destination (Join-Path $tempDir (Split-Path $src -Leaf)) -Recurse -Force
  }
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
Write-Host "Packed => $zipPath"








