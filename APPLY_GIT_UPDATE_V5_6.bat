@echo off
setlocal
cd /d "%~dp0"
set "REPO=%USERPROFILE%\Downloads\LUCKY7_PUBLIC_SITE_GITHUB_READY_v2"

if not exist "%REPO%\.git" (
  echo.
  echo ERROR: Git repository not found:
  echo %REPO%
  pause
  exit /b 1
)

echo.
echo APPLYING LUCKY 7 V5.6 AGREED RESULTS MASTER...
xcopy "%~dp0*" "%REPO%\" /E /H /Y /I >nul

cd /d "%REPO%"

if exist "PUBLIC_UI_MASTER_LOCK_V5_5_APPROVED_SCREENSHOT.txt" del /q "PUBLIC_UI_MASTER_LOCK_V5_5_APPROVED_SCREENSHOT.txt"

git add -A
git commit -m "Apply Lucky 7 agreed results master v5.6"
if errorlevel 1 (
  echo.
  echo Git may have found nothing new to commit. Continuing to push.
)
git push

echo.
echo UPDATE COMPLETE.
echo MOBILE LINK:
echo https://pabc4uorg-del.github.io/LUCKY-7-PUBLIC-SITE/
echo.
echo V5.6 FITS THE FULL HERO AND RESTORES THE AGREED COMPACT RESULT CARD DESIGN.
pause
