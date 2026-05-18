@echo off
echo Starting BookLeaf Portal...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Opening two terminal windows...

start "BookLeaf Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak > nul
start "BookLeaf Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers starting. Open http://localhost:3000 in your browser.
echo.
echo Login credentials:
echo   Admin:  admin@bookleaf.com  / admin123
echo   Author: priya.sharma@email.com / author123
echo   (All authors use password: author123)
pause
