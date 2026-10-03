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
echo APPLYING LUCKY 7 V5.5 APPROVED SCREENSHOT STYLE...
xcopy "%~dp0*" "%REPO%\" /E /H /Y /I >nul

cd /d "%REPO%"

rem Remove obsolete conflicting visual master-lock files from earlier versions.
if exist "PUBLIC_UI_MASTER_LOCK_V5_4_FULL_VISUAL.txt" del /q "PUBLIC_UI_MASTER_LOCK_V5_4_FULL_VISUAL.txt"
if exist "PUBLIC_UI_MASTER_LOCK_V5_3_VISUAL_FIX.txt" del /q "PUBLIC_UI_MASTER_LOCK_V5_3_VISUAL_FIX.txt"
if exist "PUBLIC_UI_MASTER_LOCK_V5_STADIUM.txt" del /q "PUBLIC_UI_MASTER_LOCK_V5_STADIUM.txt"

git add -A
git commit -m "Apply approved Lucky 7 screenshot style v5.5"
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
echo V5.5 RESTORES THE APPROVED BLUE BONUS AND PURPLE XXL / PREMIUM ACCENTS.
pause
