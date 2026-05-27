param(
  [string]$Source = "assets\sprites\dongun.png",
  [string]$Output = "public\assets\sprites\dongun.png",
  [int]$Columns = 5,
  [int]$Rows = 4,
  [int]$FrameWidth = 256,
  [int]$FrameHeight = 256,
  [int]$Padding = 10,
  [int]$BackgroundR = 255,
  [int]$BackgroundG = 255,
  [int]$BackgroundB = 255,
  [int]$SoftLow = 22,
  [int]$SoftHigh = 80
)

Add-Type -AssemblyName System.Drawing

function Remove-Background {
  param(
    [System.Drawing.Bitmap]$Source,
    [int]$Left,
    [int]$Top,
    [int]$Width,
    [int]$Height,
    [System.Drawing.Color]$Background,
    [int]$SoftLow,
    [int]$SoftHigh
  )

  $cutout = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($y = 0; $y -lt $Height; $y++) {
    for ($x = 0; $x -lt $Width; $x++) {
      $pixel = $Source.GetPixel($Left + $x, $Top + $y)
      $distance = [Math]::Sqrt(
        [Math]::Pow($pixel.R - $Background.R, 2) +
        [Math]::Pow($pixel.G - $Background.G, 2) +
        [Math]::Pow($pixel.B - $Background.B, 2)
      )
      $alphaRatio = ($distance - $SoftLow) / [double]($SoftHigh - $SoftLow)
      $alphaRatio = [Math]::Max(0, [Math]::Min(1, $alphaRatio))
      $alpha = [int][Math]::Round(255 * $alphaRatio)
      if ($alpha -le 4) { continue }
      $cutout.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
    }
  }

  return $cutout
}

function Get-AlphaBounds {
  param(
    [System.Drawing.Bitmap]$Image,
    [int]$AlphaCutoff = 24
  )
  $minX = $Image.Width
  $minY = $Image.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $Image.Height; $y++) {
    for ($x = 0; $x -lt $Image.Width; $x++) {
      if ($Image.GetPixel($x, $y).A -gt $AlphaCutoff) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { return $null }
  return @{ MinX = $minX; MinY = $minY; MaxX = $maxX; MaxY = $maxY }
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
$background = [System.Drawing.Color]::FromArgb($BackgroundR, $BackgroundG, $BackgroundB)
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
    for ($column = 0; $column -lt $Columns; $column++) {
      $left = [int][Math]::Floor($column * $cellWidth)
      $top = [int][Math]::Floor($row * $cellHeight)
      $right = [int]([Math]::Ceiling(($column + 1) * $cellWidth) - 1)
      $bottom = [int]([Math]::Ceiling(($row + 1) * $cellHeight) - 1)
      $right = [Math]::Min($right, $sourceImage.Width - 1)
      $bottom = [Math]::Min($bottom, $sourceImage.Height - 1)
      $w = $right - $left + 1
      $h = $bottom - $top + 1

      $cutout = Remove-Background -Source $sourceImage -Left $left -Top $top -Width $w -Height $h -Background $background -SoftLow $SoftLow -SoftHigh $SoftHigh
      try {
        $bounds = Get-AlphaBounds -Image $cutout -AlphaCutoff 24
        if (-not $bounds) {
          Write-Warning "Empty frame at row $row col $column."
          continue
        }

        $cropWidth = $bounds.MaxX - $bounds.MinX + 1
        $cropHeight = $bounds.MaxY - $bounds.MinY + 1
        $maxDrawWidth = $FrameWidth - ($Padding * 2)
        $maxDrawHeight = $FrameHeight - ($Padding * 2)
        $scale = [Math]::Min($maxDrawWidth / [double]$cropWidth, $maxDrawHeight / [double]$cropHeight)
        if ($scale -gt 1) { $scale = 1 }
        $drawWidth = [Math]::Max(1, [int][Math]::Round($cropWidth * $scale))
        $drawHeight = [Math]::Max(1, [int][Math]::Round($cropHeight * $scale))
        $destX = ($column * $FrameWidth) + [int][Math]::Round(($FrameWidth - $drawWidth) / 2)
        $destY = ($row * $FrameHeight) + $FrameHeight - $Padding - $drawHeight

        $srcRect = New-Object System.Drawing.Rectangle $bounds.MinX, $bounds.MinY, $cropWidth, $cropHeight
        $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $drawWidth, $drawHeight
        $graphics.DrawImage($cutout, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $exportedFrames++
      }
      finally {
        $cutout.Dispose()
      }
    }
  }

  $outputImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $outputImage.Dispose()
  $sourceImage.Dispose()
}

Write-Host "Prepared $exportedFrames frames into $outputPath ($sheetWidth x $sheetHeight, ${FrameWidth}px)."
