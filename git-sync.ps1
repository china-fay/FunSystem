#!/usr/bin/env pwsh
# git-sync.ps1 - 自动提交本地变更并通过 GitHub API 推送到远程仓库
# 用法: .\git-sync.ps1 ["提交信息"]

param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$REPO_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $REPO_DIR

# ---- 配置 ----
# 方法1: 设置环境变量 $env:GITHUB_TOKEN
# 方法2: 创建 .github-token 文件（已加入 .gitignore）并写入 token

$OWNER = "china-fay"
$REPO = "FunSystem"
$BRANCH = "main"

$TOKEN = $env:GITHUB_TOKEN
if (-not $TOKEN) {
    $tokenFile = Join-Path $PSScriptRoot ".github-token"
    if (Test-Path $tokenFile) {
        $TOKEN = (Get-Content $tokenFile -Raw).Trim()
    }
}
if (-not $TOKEN) {
    Write-Host "错误: 未设置 GITHUB_TOKEN。" -ForegroundColor Red
    Write-Host "请运行: `$env:GITHUB_TOKEN = '你的token'" -ForegroundColor Yellow
    Write-Host "或创建 .github-token 文件并写入 token" -ForegroundColor Yellow
    exit 1
}$HEADERS = @{
    Authorization = "Bearer $TOKEN"
    "Content-Type" = "application/json"
    "User-Agent" = "PowerShell-git-sync"
}

Write-Host "=== FunSystem Git Sync ===" -ForegroundColor Cyan

# 1. 检查是否有变更
$status = git status --porcelain 2>&1
if (-not $status) {
    Write-Host "没有未提交的变更。" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n未提交的文件:" -ForegroundColor Yellow
$status | Write-Host

# 自动生成提交信息
if (-not $Message) {
    $count = ($status | Measure-Object | Select-Object -ExpandProperty Count)
    if ($count -le 3) {
        $files = $status -replace '^.. ' | ForEach-Object { $_ -replace '\s+.*$', '' }
        $Message = "更新: $($files -join ', ')"
    } else {
        $Message = "批量更新 $count 个文件"
    }
}

Write-Host "`n提交信息: $Message" -ForegroundColor Green
git add -A
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "提交失败。" -ForegroundColor Red
    exit 1
}

# 2. 获取远程最新 commit
$refUrl = "https://api.github.com/repos/$OWNER/$REPO/git/refs/heads/$BRANCH"
try {
    $refResult = Invoke-RestMethod -Uri $refUrl -Headers $HEADERS
    $remoteSha = $refResult.object.sha
    Write-Host "远程 HEAD: $($remoteSha.Substring(0,15))..." -ForegroundColor Gray
} catch {
    Write-Host "无法获取远程分支：$_" -ForegroundColor Red
    exit 1
}

# 3. 获取变更文件并创建 blob
$changedFiles = git diff --name-only HEAD~1..HEAD 2>&1
$blobs = @()
foreach ($file in $changedFiles) {
    $fullPath = Join-Path $REPO_DIR $file
    if (-not (Test-Path $fullPath)) { continue }
    Write-Host "  上传: $file" -ForegroundColor Gray
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($fullPath))
    $blobBody = @{content=$content; encoding="base64"} | ConvertTo-Json
    $blobResult = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/blobs" -Method Post -Headers $HEADERS -Body $blobBody
    $blobs += @{path=$file -replace '\\', '/'; mode="100644"; type="blob"; sha=$blobResult.sha}
}

# 4. 创建新 tree
$treeBody = @{base_tree=$remoteSha; tree=$blobs} | ConvertTo-Json -Depth 10
$treeResult = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/trees" -Method Post -Headers $HEADERS -Body $treeBody

# 5. 创建 commit
$commitBody = @{message=$Message; tree=$treeResult.sha; parents=@($remoteSha)} | ConvertTo-Json -Depth 5
$commitResult = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/commits" -Method Post -Headers $HEADERS -Body $commitBody

# 6. 更新分支
$refBody = @{sha=$commitResult.sha; force=$false} | ConvertTo-Json
$refResult = Invoke-RestMethod -Uri $refUrl -Method Patch -Headers $HEADERS -Body $refBody

Write-Host "`n? 推送成功！" -ForegroundColor Green
Write-Host "https://github.com/$OWNER/$REPO" -ForegroundColor Blue
