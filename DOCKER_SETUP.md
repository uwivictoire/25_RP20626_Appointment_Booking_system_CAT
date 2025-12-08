# Docker Hub Setup for GitHub Actions

## Error: Username and password required

This error occurs because GitHub Actions needs your Docker Hub credentials to push images.

## How to Fix:

### Step 1: Get Your Docker Hub Credentials
1. Go to https://hub.docker.com/
2. Sign in or create an account
3. Go to Account Settings → Security → New Access Token
4. Create a token with name: `github-actions`
5. Copy the token (you'll only see it once!)

### Step 2: Add Secrets to GitHub Repository
1. Go to your GitHub repository: https://github.com/uwivictoire/25_RP20626_Appointment_Booking_system_CAT
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   **Secret 1:**
   - Name: `DOCKER_USERNAME`
   - Value: Your Docker Hub username (e.g., `uwivictoire`)

   **Secret 2:**
   - Name: `DOCKER_PASSWORD`
   - Value: Your Docker Hub access token (from Step 1)

### Step 3: Re-run the Workflow
1. Go to **Actions** tab in GitHub
2. Click on the failed workflow
3. Click **Re-run all jobs**

## Alternative: Skip Docker Push (For Testing)

If you don't want to use Docker Hub yet, you can modify the workflow to skip the Docker job:

The workflow is already set to only push on 'main' or 'feature' branches, and skip on pull requests.

To completely disable Docker builds temporarily, you can:
1. Comment out the Docker job in `.github/workflows/ci-cd.yml`
2. Or only run it on 'main' branch

## Quick Commands:

```bash
# Check if you're logged in to Docker Hub locally
docker login

# Your Docker Hub username
echo "Your username will be used as: \$DOCKER_USERNAME"
```

