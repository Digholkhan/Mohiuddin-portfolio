$path = 'src/style.css'
$content = Get-Content -Raw $path
$old = "#gl {`n  position: fixed;"
$new = "#gl {`n  pointer-events: none; /* Let scroll/wheel pass through to the page */`n  position: fixed;"
$result = $content.Replace($old, $new)
Set-Content -NoNewline -Path $path -Value $result
Write-Host "Done. Lines modified: $([regex]::Matches($result,'pointer-events').Count)"
