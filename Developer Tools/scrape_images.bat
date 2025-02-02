@echo off
setlocal EnableDelayedExpansion

:: Set colors for console
color 0E

:: Create directory for images
set "save_dir=%~dp0DevImages\map_icons"
mkdir "%save_dir%" 2>nul

:: PowerShell script to download images
powershell.exe -ExecutionPolicy Bypass -NoProfile -Command ^
"$url = 'https://oldschool.runescape.wiki/w/Category:Map_icons'; ^
$saveDir = '%save_dir%'; ^
Write-Host 'Fetching map icons...'; ^
try { ^
    $web = Invoke-WebRequest -Uri $url; ^
    $links = $web.Links | Where-Object { $_.href -match '\.png$' -and $_.href -match 'images' }; ^
    Write-Host 'Found' $links.Count 'map icons'; ^
    $count = 0; ^
    foreach ($link in $links) { ^
        try { ^
            $count++; ^
            $filename = $link.href.Split('/')[-1]; ^
            $imgUrl = 'https://oldschool.runescape.wiki' + $link.href; ^
            $filepath = Join-Path $saveDir $filename; ^
            Write-Host 'Downloading:' $filename; ^
            Invoke-WebRequest -Uri $imgUrl -OutFile $filepath; ^
        } catch { ^
            Write-Host 'Error downloading' $filename ':' $_.Exception.Message; ^
            continue; ^
        } ^
    } ^
    Write-Host 'Complete! Downloaded' $count 'map icons to' $saveDir; ^
} catch { ^
    Write-Host 'Error:' $_.Exception.Message; ^
} ^
Write-Host 'Press any key to continue...'; ^
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"

exit /b 