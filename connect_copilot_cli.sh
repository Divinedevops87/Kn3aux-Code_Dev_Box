#!/bin/bash
# connect_copilot_cli.sh
# One-step connection script for CLI + GitHub Copilot integration

# ======= CONFIGURATION =======
# Replace with your GitHub username and personal access token (classic/Copilot-enabled token)
GITHUB_USER="Divinedevops87"
GITHUB_TOKEN="YOUR_GITHUB_COPILOT_TOKEN"   # <-- Set your Copilot token here

# ======= COPILOT CLI INSTALLATION =======
echo "[*] Installing GitHub Copilot CLI..."
npm install -g @githubnext/github-copilot-cli

# ======= COPILOT CLI AUTHENTICATION =======
echo "[*] Authenticating Copilot CLI..."
echo $GITHUB_TOKEN | GITHUB_TOKEN=$GITHUB_TOKEN GITHUB_USER=$GITHUB_USER copilot auth login --token

# ======= TEST CONNECTION =======
echo "[*] Testing Copilot CLI..."
copilot suggest "Write a bash script that prints Hello, Copilot!"

echo "========================================"
echo " Copilot CLI is connected and ready! 🎉"
echo " Use: copilot suggest \"<your prompt>\""
echo "========================================"