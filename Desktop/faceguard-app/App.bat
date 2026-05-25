@echo off
echo Starting FaceGuard App...

REM Navigate to the FaceGuard project folder
cd /d "C:\Users\keanc\Desktop\faceguard-app"

REM Run the React app in a new terminal
start cmd /k "npm start"

REM Wait a few seconds to let the dev server start
timeout /t 5 /nobreak >nul

REM Open the app in the default browser
start http://localhost:3000/

echo FaceGuard app is now running at http://localhost:3000/
pause
