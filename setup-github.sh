#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}GitHub CI/CD Setup Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi

# Create .gitignore if not exists
if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Build
dist/
build/
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
fi

# Add all files
echo -e "${YELLOW}Adding files to git...${NC}"
git add .
echo -e "${GREEN}✓ Files added${NC}"

# Commit
echo -e "${YELLOW}Creating initial commit...${NC}"
git commit -m "feat: add CI/CD pipeline and authentication system" || echo "Files already committed"
echo -e "${GREEN}✓ Commit created${NC}"

# Check if main branch exists, if not create it
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Creating main branch...${NC}"
    git branch -M main
    echo -e "${GREEN}✓ Main branch created${NC}"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Add the remote repository:"
echo -e "   ${YELLOW}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
echo ""
echo "3. Configure GitHub Secrets (Settings → Secrets → Actions):"
echo "   - DOCKER_USERNAME"
echo "   - DOCKER_PASSWORD"
echo ""
echo "4. Push your code:"
echo -e "   ${YELLOW}git push -u origin main${NC}"
echo ""
echo "5. Create feature branch for staging:"
echo -e "   ${YELLOW}git checkout -b feature${NC}"
echo -e "   ${YELLOW}git push -u origin feature${NC}"
echo ""
echo -e "${GREEN}CI/CD pipeline will automatically run on push!${NC}"

# Helper script to set git identity and push
#!/usr/bin/env bash
# Usage: ./setup-github.sh <branch> "commit message"
set -euo pipefail

BRANCH="${1:-}"
MESSAGE="${2:-}"

if [ -z "$BRANCH" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: $0 <branch> \"commit message\""
  exit 1
fi

git config user.name "Your Name"
git config user.email "you@example.com"

git status
git add .
git commit -m "$MESSAGE" || true
git push origin "$BRANCH"
