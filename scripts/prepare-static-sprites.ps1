param(
  [string]$PlayerSource = "assets\sprites\dongun.png",
  [string]$ShrineSource = "assets\sprites\goldshrine.png",
  [string]$OutputDir = "public\assets\sprites"
)

Add-Type -AssemblyName System.Drawing

function New-TransparentBitmap {
  param([int]$Width, [int]$Height)

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.Dispose()

  return $bitmap
}

function Get-AlphaBounds {
  param(
    [System.Drawing.Bitmap]$Image,
    [System.Drawing.Rectangle]$Rect,
    [int]$AlphaThreshold = 12
  )

  $minX = $Rect.Right
  $minY = $Rect.Bottom
  $maxX = $Rect.Left - 1
  $maxY = $Rect.Top - 1

  for ($y = $Rect.Top; $y -lt $Rect.Bottom; $y++) {
    for ($x = $Rect.Left; $x -lt $Rect.Right; $x++) {
      if ($Image.GetPixel($x, $y).A -gt $AlphaThreshold) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    throw "No sprite pixels found in $Rect."
  }

  return New-Object System.Drawing.Rectangle $minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1)
}

function Export-AlphaGridFrame {
  param(
    [string]$Source,
    [string]$Output,
    [int]$Columns,
    [int]$Rows,
    [int]$Column,
    [int]$Row,
    [int]$CanvasSize,
    [int]$Padding
  )

  $sourceImage = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Source))
  $outputImage = New-TransparentBitmap -Width $CanvasSize -Height $CanvasSize
  $graphics = [System.Drawing.Graphics]::FromImage($outputImage)

  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

    $cellLeft = [int][Math]::Floor($Column * $sourceImage.Width / [double]$Columns)
    $cellRight = [int]([Math]::Ceiling(($Column + 1) * $sourceImage.Width / [double]$Columns) - 1)
    $cellTop = [int][Math]::Floor($Row * $sourceImage.Height / [double]$Rows)
    $cellBottom = [int]([Math]::Ceiling(($Row + 1) * $sourceImage.Height / [double]$Rows) - 1)
    $cell = New-Object System.Drawing.Rectangle $cellLeft, $cellTop, ($cellRight - $cellLeft + 1), ($cellBottom - $cellTop + 1)
    $bounds = Get-AlphaBounds -Image $sourceImage -Rect $cell -AlphaThreshold 24

    $maxDraw = $CanvasSize - ($Padding * 2)
    $scale = [Math]::Min($maxDraw / [double]$bounds.Width, $maxDraw / [double]$bounds.Height)
    $drawWidth = [Math]::Max(1, [int][Math]::Round($bounds.Width * $scale))
    $drawHeight = [Math]::Max(1, [int][Math]::Round($bounds.Height * $scale))
    $destX = [int][Math]::Round(($CanvasSize - $drawWidth) / 2)
    $destY = $CanvasSize - $Padding - $drawHeight
    $dest = New-Object System.Drawing.Rectangle $destX, $destY, $drawWidth, $drawHeight

    $graphics.DrawImage($sourceImage, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    $outputImage.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $outputImage.Dispose()
    $sourceImage.Dispose()
  }
}

function Remove-Background {
  param(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Rectangle]$Rect,
    [System.Drawing.Color]$Background,
    [int]$SoftLow,
    [int]$SoftHigh
  )

  $cutout = New-TransparentBitmap -Width $Rect.Width -Height $Rect.Height

  for ($y = 0; $y -lt $Rect.Height; $y++) {
    for ($x = 0; $x -lt $Rect.Width; $x++) {
      $pixel = $Source.GetPixel($Rect.Left + $x, $Rect.Top + $y)
      $distance = [Math]::Sqrt(
        [Math]::Pow($pixel.R - $Background.R, 2) +
        [Math]::Pow($pixel.G - $Background.G, 2) +
        [Math]::Pow($pixel.B - $Background.B, 2)
      )
      $alphaRatio = ($distance - $SoftLow) / [double]($SoftHigh - $SoftLow)
      $alphaRatio = [Math]::Max(0, [Math]::Min(1, $alphaRatio))
      $alpha = [int][Math]::Round(255 * $alphaRatio)

      if ($alpha -le 4) {
        continue
      }

      if ($alpha -lt 255) {
        $a = $alpha / 255.0
        $red = [int][Math]::Round(($pixel.R - ($Background.R * (1 - $a))) / $a)
        $green = [int][Math]::Round(($pixel.G - ($Background.G * (1 - $a))) / $a)
        $blue = [int][Math]::Round(($pixel.B - ($Background.B * (1 - $a))) / $a)
        $red = [Math]::Max(0, [Math]::Min(255, $red))
        $green = [Math]::Max(0, [Math]::Min(255, $green))
        $blue = [Math]::Max(0, [Math]::Min(255, $blue))
        $cutout.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $red, $green, $blue))
      }
      else {
        $cutout.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }

  return $cutout
}

function Export-BackgroundCutout {
  param(
    [string]$Source,
    [string]$Output,
    [System.Drawing.Rectangle]$Crop,
    [int]$CanvasSize,
    [int]$Padding
  )

  $sourceImage = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Source))
  $cutout = $null
  $outputImage = New-TransparentBitmap -Width $CanvasSize -Height $CanvasSize
  $graphics = [System.Drawing.Graphics]::FromImage($outputImage)

  try {
    $background = [System.Drawing.Color]::FromArgb(52, 52, 53)
    $cutout = Remove-Background -Source $sourceImage -Rect $Crop -Background $background -SoftLow 18 -SoftHigh 46
    $bounds = Get-AlphaBounds -Image $cutout -Rect (New-Object System.Drawing.Rectangle 0, 0, $cutout.Width, $cutout.Height) -AlphaThreshold 8

    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver

    $maxDraw = $CanvasSize - ($Padding * 2)
    $scale = [Math]::Min($maxDraw / [double]$bounds.Width, $maxDraw / [double]$bounds.Height)
    $drawWidth = [Math]::Max(1, [int][Math]::Round($bounds.Width * $scale))
    $drawHeight = [Math]::Max(1, [int][Math]::Round($bounds.Height * $scale))
    $destX = [int][Math]::Round(($CanvasSize - $drawWidth) / 2)
    $destY = $CanvasSize - $Padding - $drawHeight
    $dest = New-Object System.Drawing.Rectangle $destX, $destY, $drawWidth, $drawHeight

    $graphics.DrawImage($cutout, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    $outputImage.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    if ($cutout) { $cutout.Dispose() }
    $graphics.Dispose()
    $outputImage.Dispose()
    $sourceImage.Dispose()
  }
}

$outputPath = Join-Path (Get-Location) $OutputDir
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

Export-AlphaGridFrame `
  -Source $PlayerSource `
  -Output (Join-Path $outputPath "player_default_128.png") `
  -Columns 5 `
  -Rows 4 `
  -Column 2 `
  -Row 1 `
  -CanvasSize 128 `
  -Padding 9

Export-BackgroundCutout `
  -Source $ShrineSource `
  -Output (Join-Path $outputPath "marker_goldshrine_96.png") `
  -Crop (New-Object System.Drawing.Rectangle 480, 80, 150, 220) `
  -CanvasSize 96 `
  -Padding 4

Write-Host "Prepared player_default_128.png and marker_goldshrine_96.png in $outputPath."
