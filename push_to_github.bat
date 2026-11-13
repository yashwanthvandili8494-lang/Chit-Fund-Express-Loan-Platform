@echo off
title Push to GitHub - Sowbhagya Chit Fund Platform
echo ====================================================================
echo  PUSHING CODEBASE TO GITHUB (yashwanthvandili8494-lang)
echo ====================================================================
echo.
cd /d "%~dp0"
echo Target Remote:
git remote -v
echo.
echo Executing git push...
git push -u origin main
echo.
echo ====================================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Your code has been pushed to GitHub!
    echo URL: https://github.com/yashwanthvandili8494-lang/Chit-Fund-Express-Loan-Platform
) else (
    echo Push failed. Please check the error message above.
)
echo ====================================================================
pause

