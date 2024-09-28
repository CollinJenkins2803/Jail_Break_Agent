@echo off
cd C:\Users\cjenk\source\repos\Jail_Break_Agent\Jail_Break_Agent

:: Start the backend process
start cmd /k "node index.js"

:: Open the frontend in the default browser
start "" http://localhost:3000

pause
