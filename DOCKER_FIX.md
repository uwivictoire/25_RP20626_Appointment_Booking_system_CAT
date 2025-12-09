# Fix Docker Login Error - Quick Guide

## The Error
```
Error: Username and password required
```

This means GitHub Actions cannot access your Docker Hub credentials.

## Quick Fix - Add Secrets to GitHub

### Step 1: Get Docker Hub Token
1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `github-actions`
4. Permissions: Read, Write, Delete
5. Click "Generate" and **COPY THE TOKEN** (shown only once!)

### Step 2: Add Secrets to GitHub Repository
1. Go to: https://github.com/uwivictoire/25_RP20626_Appointment_Booking_system_CAT/settings/secrets/actions
2. Click "New repository secret"

**Add First Secret:**
- Name: `DOCKER_USERNAME`
- Value: Your Docker Hub username (e.g., `uwivictoire`)
- Click "Add secret"

**Add Second Secret:**
- Name: `DOCKER_PASSWORD`  
- Value: Paste the access token from Step 1
- Click "Add secret"

### Step 3: Re-run the Workflow
1. Go to: https://github.com/uwivictoire/25_RP20626_Appointment_Booking_system_CAT/actions
2. Click on the failed workflow run
3. Click "Re-run failed jobs" button

## Done! ✅

Your Docker workflow will now:
- ✅ Build the Docker image
- ✅ Push to Docker Hub as: `uwivictoire/appointment-booking:latest`
- ✅ Deploy to staging (feature branch) or production (main branch)

## Don't Have Docker Hub Account?

Create free account at: https://hub.docker.com/signup

---
**Note:** Without these secrets, the Docker job will always fail. But your Test and Build jobs are working fine!
