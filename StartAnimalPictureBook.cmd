@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%POWERSHELL_EXE%" set "POWERSHELL_EXE=powershell.exe"

"%POWERSHELL_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0StartAnimalPictureBook.ps1"
set "EXIT_CODE=%ERRORLEVEL%"
exit /b %EXIT_CODE%
