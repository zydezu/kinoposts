@echo off
setlocal enabledelayedexpansion

:: Set the output file
set output=files.html

:: Clear the output file if it exists
> %output% echo.

:: Iterate over all files in the directory
for %%f in (*) do (
    :: Append the formatted entry to the output file
    echo ^<img loading="lazy" class="rounding image" src="screenshots/%%f"^>^<br/^> >> %output%
)

echo File list has been created in %output%
