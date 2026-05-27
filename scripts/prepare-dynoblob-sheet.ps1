param(
  [string]$Source = "assets\sprites\dynoblob.png",
  [string]$Output = "public\assets\sprites\dynoblob.png",
  [int]$Columns = 5,
  [int]$Rows = 4,
  [int]$FrameWidth = 256,
  [int]$FrameHeight = 256,
  [int]$AlphaThreshold = 16,
  [int]$Padding = 10,
  [switch]$PreserveCellLayout,
  [switch]$DetectRowSprites,
  [int]$ProjectionThreshold = 3,
  [int]$FrameOffsetX = 0,
  [int]$FrameOffsetY = 0
)

Add-Type -AssemblyName System.Drawing

function Get-DetectedRowIntervals {
  param(
    [System.Drawing.Bitmap]$Image,
    [int]$Top,
    [int]$Bottom,
    [int]$ExpectedCount,
    [int]$AlphaCutoff,
    [int]$ColumnThreshold
  )

  $intervals = @()
  $inInterval = $false
  $start = 0

  for ($x = 0; $x -lt $Image.Width; $x++) {
    $opaqueCount = 0
    for ($y = $Top; $y -le $Bottom; $y += 2) {
      if ($Image.GetPixel($x, $y).A -gt $AlphaCutoff) {
        $opaqueCount++
      }
    }

    $isActive = $opaqueCount -gt $ColumnThreshold
    if ($isActive -and -not $inInterval) {
      $start = $x
      $inInterval = $true
    }

    if ((-not $isActive -or $x -eq ($Image.Width - 1)) -and $inInterval) {
      $end = if ($isActive -and $x -eq ($Image.Width - 1)) { $x } else { $x - 1 }
      if (($end - $start) -gt 8) {
        $intervals += [pscustomobject]@{
          Start = $start
          End = $end
          Width = $end - $start + 1
        }
      }
      $inInterval = $false
    }
  }

  if ($intervals.Count -gt $ExpectedCount) {
    $intervals = @($intervals | Sort-Object Width -Descending | Select-Object -First $ExpectedCount | Sort-Object Start)
  }

  return @($intervals)
}

$sourcePath = Resolve-Path -LiteralPath $Source
$outputPath = Join-Path (Get-Location) $Output
$outputDir = Split-Path -Parent $outputPath

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$sourceImage = [System.Drawing.Bitmap]::FromFile($sourcePath)
$sheetWidth = $Columns * $FrameWidth
$sheetHeight = $Rows * $FrameHeight
$outputImage = New-Object System.Drawing.Bitmap $sheetWidth, $sheetHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($outputImage)
$exportedFrames = 0

try {
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

  $cellWidth = $sourceImage.Width / [double]$Columns
  $cellHeight = $sourceImage.Height / [double]$Rows

  for ($row = 0; $row -lt $Rows; $row++) {
    $rowTop = [int][Math]::Floor($row * $cellHeight)
    $rowBottom = [int]([Math]::Ceiling(($row + 1) * $cellHeight) - 1)
    $rowBottom = [Math]::Min($rowBottom, $sourceImage.Height - 1)
    $detectedIntervals = $null

    if ($DetectRowSprites) {
      $detectedIntervals = @(Get-DetectedRowIntervals `
        -Image $sourceImage `
        -Top $rowTop `
        -Bottom $rowBottom `
        -ExpectedCount $Columns `
        -AlphaCutoff $AlphaThreshold `
        -ColumnThreshold $ProjectionThreshold)

      if ($detectedIntervals.Count -lt $Columns) {
        Write-Warning "Detected only $($detectedIntervals.Count) sprites in row $row; falling back to fixed cells for that row."
        $detectedIntervals = $null
      }
    }

    for ($column = 0; $column -lt $Columns; $column++) {
      if ($detectedIntervals) {
        $left = [int]$detectedIntervals[$column].Start
        $right = [int]$detectedIntervals[$column].End
      }
      else {
        $left = [int][Math]::Floor($column * $cellWidth)
        $right = [int]([Math]::Ceiling(($column + 1) * $cellWidth) - 1)
      }
      $top = $rowTop
      $bottom = $rowBottom

      $right = [Math]::Min($right, $sourceImage.Width - 1)

      if ($PreserveCellLayout) {
        $cropWidth = $right - $left + 1
        $cropHeight = $bottom - $top + 1
        $destX = ($column * $FrameWidth) + [int][Math]::Round(($FrameWidth - $cropWidth) / 2) + $FrameOffsetX
        $destY = ($row * $FrameHeight) + [int][Math]::Round(($FrameHeight - $cropHeight) / 2) + $FrameOffsetY
        $sourceRect = New-Object System.Drawing.Rectangle $left, $top, $cropWidth, $cropHeight
        $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $cropWidth, $cropHeight
        $graphics.DrawImage($sourceImage, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        $exportedFrames++
        continue
      }

      $minX = $sourceImage.Width
      $minY = $sourceImage.Height
      $maxX = -1
      $maxY = -1

      for ($y = $top; $y -le $bottom; $y++) {
        for ($x = $left; $x -le $right; $x++) {
          $pixel = $sourceImage.GetPixel($x, $y)
          if ($pixel.A -gt $AlphaThreshold) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
          }
        }
      }

      if ($maxX -lt 0) {
        Write-Warning "No opaque pixels found for sprite frame row $row column $column."
        continue
      }

      $minX = [Math]::Max($left, $minX - $Padding)
      $minY = [Math]::Max($top, $minY - $Padding)
      $maxX = [Math]::Min($right, $maxX + $Padding)
      $maxY = [Math]::Min($bottom, $maxY + $Padding)

      $cropWidth = $maxX - $minX + 1
      $cropHeight = $maxY - $minY + 1
      $maxDrawWidth = $FrameWidth - ($Padding * 2)
      $maxDrawHeight = $FrameHeight - ($Padding * 2)
      $scale = [Math]::Min($maxDrawWidth / [double]$cropWidth, $maxDrawHeight / [double]$cropHeight)
      if ($scale -gt 1) { $scale = 1 }

      $drawWidth = [Math]::Max(1, [int][Math]::Round($cropWidth * $scale))
      $drawHeight = [Math]::Max(1, [int][Math]::Round($cropHeight * $scale))
      $destX = ($column * $FrameWidth) + [int][Math]::Round(($FrameWidth - $drawWidth) / 2) + $FrameOffsetX
      $destY = ($row * $FrameHeight) + $FrameHeight - $Padding - $drawHeight + $FrameOffsetY
      if ($destY -lt ($row * $FrameHeight) + $Padding) {
        $destY = ($row * $FrameHeight) + $Padding
      }

      $sourceRect = New-Object System.Drawing.Rectangle $minX, $minY, $cropWidth, $cropHeight
      $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $drawWidth, $drawHeight
      $graphics.DrawImage($sourceImage, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
      $exportedFrames++
    }
  }

  $outputImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $outputImage.Dispose()
  $sourceImage.Dispose()
}

Write-Host "Prepared $exportedFrames sprite frames into $outputPath ($sheetWidth x $sheetHeight, ${FrameWidth}px frames)."
