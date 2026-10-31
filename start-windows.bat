@echo off
setlocal
cd /d "%~dp0"
title STL Cosmic Morph - Local Server
set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 (
  py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)" >nul 2>&1
  if not errorlevel 1 set "PYTHON=py -3"
)
if not defined PYTHON (
  where python >nul 2>&1
  if not errorlevel 1 (
    python -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)" >nul 2>&1
    if not errorlevel 1 set "PYTHON=python"
  )
)
if not defined PYTHON (
  echo Python 3.10 or newer is required.
  echo Download: https://www.python.org/downloads/
  pause
  exit /b 1
)
if not exist "server.py" (
  echo ERROR: server.py not found in %cd%
  pause
  exit /b 1
)
if not exist "vendor\three\build\three.module.js" (
  echo Installing Three.js locally for offline use...
  %PYTHON% setup-three.py
  if errorlevel 1 (
    echo Failed to install Three.js. Check network access or copy vendor files manually.
    pause
    exit /b 1
  )
)
echo Starting STL Cosmic Morph on http://127.0.0.1:8000/
start "" "http://127.0.0.1:8000/"
%PYTHON% server.py
echo.
echo Server stopped or failed. Check errors above.
pause
