#!/bin/bash

echo "Netlify Deployment Script for Panerai Watch Dashboard"
echo "====================================================="
echo ""
echo "This script will deploy your site to Netlify."
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify
echo "Step 1: Login to Netlify"
echo "A browser window will open. Please authorize the application."
netlify login

# Initialize the site
echo ""
echo "Step 2: Initialize Netlify site"
echo "Choose 'Create & configure a new site' when prompted"
netlify init

# Deploy to production
echo ""
echo "Step 3: Deploy to production"
netlify deploy --prod --dir=.

echo ""
echo "Deployment complete! Your site should be live."
echo "Run 'netlify open' to view your site."