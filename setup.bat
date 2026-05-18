@echo off
echo ========================================
echo    BookLeaf Publishing Portal Setup
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (echo Backend install failed! & pause & exit /b 1)
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (echo Frontend install failed! & pause & exit /b 1)
cd ..

echo.
echo [3/4] Seeding database...
cd backend
call npm run seed
cd ..

echo.
echo ========================================
echo  Setup Complete!
echo  Now run: start-dev.bat
echo ========================================
pause
