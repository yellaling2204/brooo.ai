Add-Type -AssemblyName System.Drawing

function Create-Screenshot {
    param(
        [string]$Path,
        [string]$Category,
        [string]$Header,
        [string]$BodyText,
        [System.Drawing.Color]$AccentColor
    )

    $width = 700
    $height = 480
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 24, 27)) # zinc-900
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Card background
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(39, 39, 42)) # zinc-800
    $g.FillRectangle($cardBrush, 30, 30, 640, 420)

    # Accent top border
    $accentBrush = New-Object System.Drawing.SolidBrush($AccentColor)
    $g.FillRectangle($accentBrush, 30, 30, 640, 8)

    # Category Pill
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(63, 63, 70))
    $g.FillRectangle($pillBrush, 50, 55, 160, 32)
    $pillFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $pillTextBrush = New-Object System.Drawing.SolidBrush($AccentColor)
    $g.DrawString($Category.ToUpper(), $pillFont, $pillTextBrush, 60, 62)

    # Header
    $headerFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($Header, $headerFont, $headerBrush, 50, 105)

    # Body Text
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Regular)
    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(212, 212, 216)) # zinc-300
    $bodyRect = New-Object System.Drawing.RectangleF(50, 160, 600, 260)
    $g.DrawString($BodyText, $bodyFont, $bodyBrush, $bodyRect)

    # Save
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created screenshot: $Path"
}

$imagesDir = "C:\Users\yella\Documents\project\brooo.ai\tests\images"

# 01 - Interview
Create-Screenshot `
    -Path "$imagesDir\01-interview.png" `
    -Category "Job Interview" `
    -Header "ABC Technologies — Technical Round" `
    -BodyText "Dear Candidate,`n`nYour software engineering interview with ABC Technologies is scheduled for October 12, 2026 at 11:00 AM IST.`n`nPlease prepare for SQL and System Design concepts.`n`nMeeting link: https://meet.abc-tech.com/interview-8821" `
    -AccentColor ([System.Drawing.Color]::FromArgb(59, 130, 246))

# 02 - Job Description
Create-Screenshot `
    -Path "$imagesDir\02-job-description.png" `
    -Category "Career Opportunity" `
    -Header "Acme Corp — Senior Backend Engineer" `
    -BodyText "Company: Acme Corp`nRole: Senior Backend Engineer`nLocation: Remote / Bengaluru`nSalary: `$140,000 - `$160,000 / year`nKey Skills: TypeScript, Node.js, Distributed Systems, PostgreSQL`n`nApplication Deadline: October 20, 2026`nApply: careers@acmecorp.io" `
    -AccentColor ([System.Drawing.Color]::FromArgb(16, 185, 129))

# 03 - Insurance
Create-Screenshot `
    -Path "$imagesDir\03-insurance.png" `
    -Category "Policy Notice" `
    -Header "SafeGuard Auto Insurance Policy" `
    -BodyText "Policyholder: John Doe`nPolicy Number: POL-77492-V`nVehicle: 2022 Honda Civic`n`nStatus: Expiration Approaching`nExpiration Date: November 15, 2026`n`nAction Required: Renew your policy before November 15 to maintain active coverage without lapses." `
    -AccentColor ([System.Drawing.Color]::FromArgb(245, 158, 11))

# 04 - Bill
Create-Screenshot `
    -Path "$imagesDir\04-bill.png" `
    -Category "Utility Statement" `
    -Header "Apex Power & Electricity Bill" `
    -BodyText "Account Number: 884-291-039`nStatement Date: October 05, 2026`n`nTotal Amount Due: `$124.50`nPayment Due Date: October 25, 2026`n`nAvoid a `$15 late penalty by completing your payment before October 25 via apexpower.com/pay." `
    -AccentColor ([System.Drawing.Color]::FromArgb(168, 85, 247))

# 05 - Scam Message
Create-Screenshot `
    -Path "$imagesDir\05-scam-message.png" `
    -Category "Urgent Notification" `
    -Header "CLAIM YOUR $5,000,000 LOTTERY NOW!" `
    -BodyText "CONGRATULATIONS! Your mobile number was chosen in the Global Mega Cash Lottery.`n`nYou have won $5,000,000 USD! To claim, you must wire a $250 verification fee immediately and enter your bank account PIN at: http://bit.ly/claim-mega-cash-now`n`nWARNING: Must respond within 60 minutes or prize is forfeited!" `
    -AccentColor ([System.Drawing.Color]::FromArgb(239, 68, 68))
