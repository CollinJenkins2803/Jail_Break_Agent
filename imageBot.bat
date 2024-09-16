@echo off
cd C:\Users\cjenk\source\repos\imagebot\imagebot

:: Start the backend process
start cmd /k "node index.js"

:: Open the frontend in the default browser
start "" http://localhost:3000

pause
