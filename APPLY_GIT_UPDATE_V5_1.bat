@echo off
setlocal
cd /d "%~dp0"
set "REPO=%USERPROFILE%\Downloads\LUCKY7_PUBLIC_SITE_GITHUB_READY_v2"

if not exist "%REPO%\.git" (
  echo.
  echo ERROR: Git repository not found at:
  echo %REPO%
  echo.
  echo Copy this V5.1 folder into Downloads and make sure the existing
  echo LUCKY7_PUBLIC_SITE_GITHUB_READY_v2 repository is also in Downloads.
  pause
  exit /b 1
)

echo Updating Lucky 7 public site V5.1...
xcopy "%~dp0*" "%REPO%\" /E /H /Y /I >nul

cd /d "%REPO%"
git add -A
git commit -m "Apply Lucky 7 Africa FX master v5.1"
if errorlevel 1 (
  echo.
  echo Git reported nothing new to commit, or a commit issue occurred.
)
git push

echo.
echo Finished. Mobile link:
echo https://pabc4uorg-del.github.io/LUCKY-7-PUBLIC-SITE/
echo.
pause
