@echo off
cd "f:\VS Code ALL Files\FN Furniture Inventory System\backend"
echo Removing old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.
echo Installing backend dependencies...
call npm install
echo.
echo Starting backend server...
call npm run dev
pause
