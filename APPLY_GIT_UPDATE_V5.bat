@echo off
setlocal
set "UPDATE=%~dp0"
set "REPO=%USERPROFILE%\Downloads\LUCKY7_PUBLIC_SITE_GITHUB_READY_v2"

if not exist "%REPO%\.git" (
  echo ERROR: Git repository not found at:
  echo %REPO%
  echo.
  echo Keep this update folder in Downloads next to LUCKY7_PUBLIC_SITE_GITHUB_READY_v2.
  pause
  exit /b 1
)

echo Copying Lucky 7 Stadium Master V5 into the Git repository...
robocopy "%UPDATE%" "%REPO%" /E /XD .git /XF APPLY_GIT_UPDATE_V5.bat >nul
if errorlevel 8 (
  echo ERROR: File copy failed.
  pause
  exit /b 1
)

cd /d "%REPO%"
echo.
echo Git status:
git status --short

echo.
echo Staging update...
git add -A

echo Committing...
git commit -m "Apply Lucky 7 stadium master v5"
if errorlevel 1 (
  echo.
  echo NOTE: Git may have reported nothing to commit. Continuing to push current branch.
)

echo.
echo Pushing to GitHub...
git push
if errorlevel 1 (
  echo ERROR: git push failed. Copy the output above and send it to ChatGPT.
  pause
  exit /b 1
)

echo.
echo SUCCESS: Lucky 7 Stadium Master V5 pushed.
echo Mobile site: https://pabc4uorg-del.github.io/LUCKY-7-PUBLIC-SITE/
echo Wait about 1 minute, then refresh the site.
pause
