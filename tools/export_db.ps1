$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dist = Join-Path -Path (Resolve-Path '..').Path -ChildPath 'dist'
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

$sqlPath = Join-Path $dist "products-$timestamp.sql"

$mysqldump = 'E:\xampp\mysql\bin\mysqldump.exe'
if (-not (Test-Path $mysqldump)) { $mysqldump = 'mysqldump' }

& $mysqldump --user=root --password= --host=localhost --databases products --result-file="$sqlPath"
Write-Host "Exported DB => $sqlPath"








