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
echo APPLYING LUCKY 7 V5.3 VISUAL MASTER FIX...
xcopy "%~dp0*" "%REPO%\" /E /H /Y /I >nul

cd /d "%REPO%"
git add -A
git commit -m "Apply Lucky 7 visual master fix v5.3"
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
echo IMPORTANT: V5.3 uses NEW asset names to avoid stale cached V5.2 images.
pause
