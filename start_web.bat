@echo off
cd /d "%~dp0"

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed! Download it from python.org
    pause
    exit
)

pip show pywebview >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing window library...
    pip install pywebview
)

start /b python main.py