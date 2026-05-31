$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Set-Location -LiteralPath $PSScriptRoot

function Wait-BeforeExit {
  param(
    [int]$Code
  )

  Write-Host ""
  Read-Host "Enterキーを押して閉じます"
  exit $Code
}

Write-Host "どうぶつずかんを起動します。"
Write-Host "起動URL: http://127.0.0.1:4174/"
Write-Host "終了するときは、この画面で Ctrl+C を押してください。"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js が見つかりません。"
  Write-Host "https://nodejs.org/ から Node.js をインストールしてから、もう一度実行してください。"
  Wait-BeforeExit 1
}

$serverPath = Join-Path $PSScriptRoot "server.mjs"
if (-not (Test-Path -LiteralPath $serverPath -PathType Leaf)) {
  Write-Host "server.mjs が見つかりません。"
  Write-Host "ZIPをもう一度展開し直してから、StartAnimalPictureBook.cmd を実行してください。"
  Wait-BeforeExit 1
}

$indexPath = Join-Path $PSScriptRoot "app\index.html"
if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
  Write-Host "app\index.html が見つかりません。"
  Write-Host "ZIPをもう一度展開し直してから、StartAnimalPictureBook.cmd を実行してください。"
  Wait-BeforeExit 1
}

Write-Host "サーバーを起動しています..."
Write-Host "ブラウザが開かない場合は、以下のURLを開いてください。"
Write-Host "http://127.0.0.1:4174/"
Write-Host ""

$env:HOST = "0.0.0.0"
$env:PORT = "4174"
$env:OPEN_BROWSER = "1"

& node $serverPath
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "サーバーが終了しました。"
if ($exitCode -ne 0) {
  Write-Host "エラーが発生しました。上の表示内容を確認してください。"
}

Wait-BeforeExit $exitCode
