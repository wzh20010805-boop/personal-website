$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $projectRoot 'output\local-server'
$serverUrl = 'http://127.0.0.1:3010/'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

function Test-Website {
    try {
        return (Invoke-WebRequest -Uri $serverUrl -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200
    } catch {
        return $false
    }
}

try {
    $listener = Get-NetTCPConnection -LocalPort 3010 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        if ($owner.Name -ne 'node.exe' -or $owner.CommandLine -notlike "*$projectRoot\node_modules\next\*") {
            throw 'Port 3010 is occupied by another application. No process was stopped.'
        }
        if (Test-Website) {
            'Website already running at ' + $serverUrl | Set-Content (Join-Path $logDirectory 'startup.log')
            exit 0
        }
        throw 'The existing website process is not responding. Check its logs before restarting.'
    }

    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    $nextCli = Join-Path $projectRoot 'node_modules\next\dist\bin\next'
    if (-not (Test-Path -LiteralPath $nextCli)) { throw 'Next.js is missing. Run npm install first.' }

    # Give Next and its inherited child processes a hidden console. Detaching Node
    # alone can cause its next-server child to create a visible terminal on Windows.
    $server = Start-Process -FilePath $nodePath -ArgumentList @("`"$nextCli`"", 'dev', '--hostname', '127.0.0.1', '--port', '3010') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'stdout.log') -RedirectStandardError (Join-Path $logDirectory 'stderr.log') -PassThru
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline) {
        if ($server.HasExited) { throw 'Next.js exited during startup. See stdout.log and stderr.log.' }
        if (Test-Website) {
            "Website ready at $serverUrl (launcher PID $($server.Id))" | Set-Content (Join-Path $logDirectory 'startup.log')
            exit 0
        }
        Start-Sleep -Milliseconds 500
    }
    throw 'Startup timed out. The process was left running; check stdout.log and stderr.log.'
} catch {
    $_.Exception.Message | Set-Content (Join-Path $logDirectory 'startup.log')
    exit 1
}
