$pages = @("costing", "sales-order", "planning", "procurement", "production", "final-qc", "packing", "dispatch")
foreach ($page in $pages) {
    $dir = "src/app/$page"
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    $title = $page.Replace('-', ' ')
    $title = (Get-Culture).TextInfo.ToTitleCase($title)

    $content = @"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight capitalize">$title</h1>
        <Button>Manage</Button>
      </div>
      <Card>
        <CardHeader>
           <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">Module for managing $title process.</p>
        </CardContent>
      </Card>
    </div>
  )
}
"@
    Set-Content -Path "$dir/page.tsx" -Value $content
}
Write-Host "Pages created successfully"
