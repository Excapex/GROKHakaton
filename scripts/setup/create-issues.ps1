param([switch]$Create)
$ErrorActionPreference = 'Stop'
$team = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'team.json') -Raw | ConvertFrom-Json
$items = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'backlog.json') -Raw | ConvertFrom-Json
if ($team.repo -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' -or $team.repo -match 'YOUR_OWNER') { throw 'Popuni stvarni repo u team.json.' }
if ($team.builderA -match 'GITHUB_HANDLE' -or $team.builderB -match 'GITHUB_HANDLE') { throw 'Popuni stvarne GitHub naloge.' }
if (-not $Create) {
  $items | Select-Object id,owner,sp,title | Format-Table -AutoSize
  Write-Output "Preview: $($items.Count) issue-a za $($team.repo). Pokreni sa -Create za upis."
  exit 0
}
function Invoke-GhChecked([string[]]$CliArgs) {
  $result = & gh @CliArgs
  if ($LASTEXITCODE -ne 0) { throw "GitHub CLI nije uspeo: $($CliArgs[0]) $($CliArgs[1])" }
  return $result
}
Invoke-GhChecked @('auth','status') | Out-Null
$repo = [string]$team.repo
$labels = @{
  'priority:P0'='B60205'; 'priority:P1'='FBCA04';
  'status:ready'='0E8A16'; 'status:in-progress'='1D76DB';
  'status:review'='5319E7'; 'status:blocked'='D93F0B'; 'status:done'='BFDADC';
  'owner:A'='0052CC'; 'owner:B'='006B75'
}
foreach ($n in 1,2,3,5) { $labels["sp:$n"]='C5DEF5' }
foreach ($area in ($items.area | Sort-Object -Unique)) { $labels["area:$area"]='D4C5F9' }
foreach ($label in $labels.GetEnumerator()) {
  Invoke-GhChecked @('label','create',$label.Key,'--repo',$repo,'--color',$label.Value,'--force') | Out-Null
}
$existing = @(Invoke-GhChecked @('issue','list','--repo',$repo,'--state','all','--limit','1000','--json','number,title') | ConvertFrom-Json)
$map = @{}
foreach ($item in $items) {
  $title = "[$($item.id)] $($item.title)"
  $found = @($existing | Where-Object title -eq $title)
  if ($found.Count -gt 1) { throw "Dupli naslovi za $($item.id); proveri rucno." }
  if ($found.Count -eq 1) { $map[$item.id]=$found[0].number; continue }
  $owner = if ($item.owner -eq 'A') { $team.builderA } else { $team.builderB }
  $dependencies = @($item.depends | ForEach-Object {
    if (-not $map.ContainsKey($_)) { throw "Neresena zavisnost $_" }
    "#$($map[$_])"
  }) -join ', '
  if (-not $dependencies) { $dependencies='nema' }
  $body = "## Ishod`n$($item.accept)`n`n## Plan`nVlasnik: $($item.owner)`nSP: $($item.sp)`nZavisnosti: $dependencies`n`n## Prihvatni kriterijumi`n- [ ] Implementiran navedeni ishod`n- [ ] Proveren negativan/nepotpun slucaj`n- [ ] PR pregledan i mergovan`n`n## Dokaz`nUpisati komande, rezultat i PR.`n"
  $bodyFile = Join-Path $PSScriptRoot 'issue-body.local.md'
  [IO.File]::WriteAllText($bodyFile,$body,[Text.UTF8Encoding]::new($false))
  Invoke-GhChecked @('issue','create','--repo',$repo,'--title',$title,'--body-file',$bodyFile,
    '--assignee',[string]$owner,'--label',"priority:P0,owner:$($item.owner),sp:$($item.sp),area:$($item.area),status:ready") | Out-Null
  $lookup = @(Invoke-GhChecked @('issue','list','--repo',$repo,'--state','all','--limit','1000','--json','number,title') | ConvertFrom-Json)
  $created = @($lookup | Where-Object title -eq $title)
  if ($created.Count -ne 1) { throw 'Neizvestan rezultat; proveri GitHub pre ponavljanja.' }
  $map[$item.id]=$created[0].number
  Write-Output "$($item.id) -> #$($created[0].number)"
}
$map | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'issue-map.local.json') -Encoding utf8
Write-Output 'Gotovo. Zavisnosti su u opisima; status ready ne znaci da su sve zavisnosti zatvorene.'
