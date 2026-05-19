@echo off
cd /d "%~dp0"
python make-zip.py
if exist ai-interview-resume-saas.zip (
  echo.
  echo OK: ai-interview-resume-saas.zip
  echo Folder: %cd%
) else (
  echo Python failed. Trying PowerShell...
  powershell -NoProfile -Command "$d='%~dp0'; $src=Join-Path $d '*'; $out=Join-Path $d 'ai-interview-resume-saas-powershell.zip'; if (Test-Path $out) { Remove-Item $out -Force }; Compress-Archive -Path $src -DestinationPath $out -Force; Write-Host OK: $out"
)
pause
