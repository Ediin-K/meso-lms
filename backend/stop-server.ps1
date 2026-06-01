# Ndalo procesin qe perdor portin 8080 (backend i vjeter)
$ids = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -ne 0 }

if (-not $ids) {
    Write-Host "Porti 8080 eshte i lire."
    exit 0
}

foreach ($procId in $ids) {
    Write-Host "Duke ndalur procesin $procId..."
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Write-Host "U krye. Tani ekzekuto: mvn spring-boot:run"
