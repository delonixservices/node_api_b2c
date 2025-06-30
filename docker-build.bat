@echo off
REM Docker Build and Push Script for B2C API (Windows)
REM Usage: docker-build.bat [username] [tag]

setlocal enabledelayedexpansion

REM Default values
set DOCKER_USERNAME=%1
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=your-dockerhub-username

set IMAGE_NAME=b2c-api
set TAG=%2
if "%TAG%"=="" set TAG=latest

echo 🐳 Building Docker image for B2C API...
echo Username: %DOCKER_USERNAME%
echo Image: %IMAGE_NAME%
echo Tag: %TAG%

REM Build the Docker image
echo 📦 Building image...
docker build -t %IMAGE_NAME% .

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Tag the image for Docker Hub
echo 🏷️  Tagging image...
docker tag %IMAGE_NAME% %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%

REM Login to Docker Hub (will prompt for credentials)
echo 🔐 Logging in to Docker Hub...
docker login

if %ERRORLEVEL% neq 0 (
    echo ❌ Docker login failed!
    pause
    exit /b 1
)

REM Push to Docker Hub
echo ⬆️  Pushing to Docker Hub...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%

if %ERRORLEVEL% neq 0 (
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo ✅ Successfully pushed %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG% to Docker Hub!

REM Optional: Clean up local images
set /p CLEANUP="🧹 Do you want to remove local images? (y/n): "
if /i "%CLEANUP%"=="y" (
    echo 🗑️  Removing local images...
    docker rmi %IMAGE_NAME%
    docker rmi %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%
    echo ✅ Local images removed!
)

echo 🎉 Done! Your image is now available on Docker Hub.
echo To pull and run: docker run -p 3334:3334 %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%
pause 