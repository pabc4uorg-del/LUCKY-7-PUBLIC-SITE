@echo off
setlocal
cd /d "%~dp0"
set "REPO=%USERPROFILE%\Downloads\LUCKY7_PUBLIC_SITE_GITHUB_READY_v2"
if not exist "%REPO%\.git" (
 echo ERROR: Git repository not found: %REPO%
 pause
 exit /b 1
)
echo APPLYING LUCKY 7 V5.7 APPROVED TRIM REFERENCE...
xcopy "%~dp0*" "%REPO%\" /E /H /Y /I >nul
cd /d "%REPO%"
if exist "PUBLIC_UI_MASTER_LOCK_V5_6_AGREED_RESULTS.txt" del /q "PUBLIC_UI_MASTER_LOCK_V5_6_AGREED_RESULTS.txt"
git add -A
git commit -m "Apply Lucky 7 approved trim reference v5.7"
git push
echo.
echo UPDATE COMPLETE.
echo MOBILE LINK:
echo https://pabc4uorg-del.github.io/LUCKY-7-PUBLIC-SITE/
pause
