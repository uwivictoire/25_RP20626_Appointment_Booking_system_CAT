# GitHub Actions CI/CD Setup Guide

## 🚀 CI/CD Pipeline Overview

The project now includes automated CI/CD pipelines that will:
- ✅ Run tests on every push and pull request
- 🐳 Build and push Docker images
- 🚢 Deploy to staging (feature branch) and production (main branch)
- 📊 Run health checks and smoke tests

## 📋 Prerequisites

Before the CI/CD pipeline can work, you need to configure GitHub repository secrets:

### Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

1. **DOCKER_USERNAME** - Your Docker Hub username
2. **DOCKER_PASSWORD** - Your Docker Hub password or access token

### Optional Secrets (for deployment)
3. **DEPLOYMENT_KEY** - SSH key for server deployment
4. **SERVER_HOST** - Production server hostname
5. **SERVER_USER** - Server username

## 🔄 Workflow Files

### 1. `ci-cd.yml` - Main CI/CD Pipeline
Triggers on: push to main/feature/develop, pull requests

**Jobs:**
- **Test** - Runs health checks with MySQL service
- **Build** - Builds the application and creates artifacts
- **Docker** - Builds and pushes Docker images
- **Deploy-Staging** - Deploys to staging (feature branch only)
- **Deploy-Production** - Deploys to production (main branch only)

### 2. `docker-publish.yml` - Docker Image Publishing
Triggers on: push to main/feature, version tags

**Features:**
- Multi-platform builds (amd64, arm64)
- Automatic semantic versioning
- Docker Hub integration
- Build caching for faster builds

## 🌿 Branch Strategy

```
main (production)
  ↑
  └── Pull Request ← feature (staging)
                      ↑
                      └── develop (development)
```

- **main** → Production deployments
- **feature** → Staging deployments
- **develop** → Development/testing

## 🚀 How to Use

### 1. Initial Setup
```bash
# Add secrets to GitHub repository
# Settings → Secrets → Actions → New repository secret
```

### 2. Push Code
```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin feature
```

### 3. The Pipeline Will:
1. ✅ Run tests with MySQL
2. 🔨 Build the application
3. 🐳 Create Docker image
4. 📦 Push to Docker Hub
5. 🚢 Deploy to staging (if feature branch)

### 4. Merge to Production
```bash
git checkout main
git merge feature
git push origin main
```

This will trigger production deployment.

## 📊 Pipeline Status

You can view pipeline status at:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

## 🐳 Docker Images

After successful builds, images will be available at:
```
docker pull YOUR_DOCKER_USERNAME/appointment-booking:latest
docker pull YOUR_DOCKER_USERNAME/appointment-booking:feature
```

## 🔧 Environment Variables

The pipeline uses these environment variables:

```yaml
DB_HOST: 127.0.0.1
DB_USER: root
DB_PASSWORD: password
DB_NAME: appointment_booking
DB_PORT: 3306
PORT: 3000
```

## 📝 Customization

### Add Deployment Steps

Edit `.github/workflows/ci-cd.yml` in the deploy sections:

```yaml
deploy-production:
  steps:
    - name: Deploy to production
      run: |
        # Add your deployment commands
        ssh user@server "docker pull image && docker restart container"
```

### Add Tests

Create a test script in `package.json`:

```json
{
  "scripts": {
    "test": "node test.js",
    "test:integration": "node test-integration.js"
  }
}
```

Then update workflow:

```yaml
- name: Run tests
  run: npm test
```

## 🔔 Notifications

You can add notifications by integrating:
- Slack
- Discord
- Email
- Microsoft Teams

Example Slack notification:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🛡️ Security

- Never commit secrets to the repository
- Use GitHub Secrets for sensitive data
- Enable branch protection rules
- Require pull request reviews
- Enable status checks

## 📈 Best Practices

1. **Always test locally first**
   ```bash
   docker-compose up --build
   ```

2. **Use semantic commits**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `chore:` - Maintenance

3. **Create pull requests**
   - Never push directly to main
   - Always use feature branches
   - Request code reviews

4. **Monitor deployments**
   - Check Actions tab for status
   - Review logs for errors
   - Test deployed application

## 🚨 Troubleshooting

### Pipeline Fails at Test Stage
- Check MySQL connection
- Verify environment variables
- Review test logs in Actions tab

### Docker Build Fails
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Docker Hub credentials

### Deployment Fails
- Verify deployment secrets
- Check server connectivity
- Review deployment scripts

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)
- [Semantic Versioning](https://semver.org/)

## ✅ Next Steps

1. Configure GitHub Secrets
2. Push code to trigger pipeline
3. Monitor first deployment
4. Set up branch protection
5. Add team members
6. Configure notifications
