@echo off
echo Deploying to GitHub Pages...

git add .
git commit -m "Update site - %date%"
git push origin main

echo.
echo Deployment complete!
echo Your site will be available at: https://c1estuff.github.io/biggoblins
echo (It may take a few minutes to update)
pause