$path = 'src/3d/engine.js'
$content = Get-Content -Raw $path

# 1. Slow down AI core and ring rotations
$content = $content.Replace(
    "    // Pulse core`r`n    if (WORLD.core) WORLD.core.rotation.y += dt * 0.15;`r`n    if (WORLD.coreRing1) WORLD.coreRing1.rotation.z -= dt * 0.22;`r`n    if (WORLD.coreRing2) WORLD.coreRing2.rotation.x += dt * 0.18;",
    "    // Pulse core — slowed for cinematic feel`r`n    if (WORLD.core) WORLD.core.rotation.y += dt * 0.06;`r`n    if (WORLD.coreRing1) WORLD.coreRing1.rotation.z -= dt * 0.08;`r`n    if (WORLD.coreRing2) WORLD.coreRing2.rotation.x += dt * 0.05;"
)

# 2. Replace camera progression block (the if/else with targetProg logic)
$oldCamBlock = "    // Smooth camera progression — deliberately slow for cinematic feel
    if (RIG.targetProg !== null) {
      // Nav-click fly-to: slower, more cinematic glide
      RIG.smooth = lerp(RIG.smooth, RIG.targetProg, clamp(dt * 1.6, 0, 1));
      if (Math.abs(RIG.smooth - RIG.targetProg) < 0.005) {
        RIG.smooth = RIG.targetProg;
        RIG.targetProg = null;
      }
    } else {
      // Scroll-driven: slow drift so animation moves gently with scroll
      RIG.smooth = lerp(RIG.smooth, RIG.prog, clamp(dt * 1.8, 0, 1));
    }"

$newCamBlock = "    // Continuous scroll-driven camera — read scroll every frame so wheel,
    // trackpad, touch, and smooth-scrolled nav clicks all move the background.
    const CAM_FOLLOW = 1.35;
    const _sy = window.scrollY || 0;
    const _maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const _rawProg = Math.min(Math.max(_sy / _maxScroll, 0), 1) * (WAYPOINTS.length - 1);
    RIG.prog = _rawProg;
    RIG.smooth = lerp(RIG.smooth, RIG.prog, clamp(dt * CAM_FOLLOW, 0, 1));"

$content = $content.Replace($oldCamBlock, $newCamBlock)

# 3. Slow down rotating objects
$content = $content.Replace(
    "    // Rotate rotating meshes`r`n    rotatingObjects.forEach(item => {`r`n      if (item.rx) item.mesh.rotation.x += dt * item.rx;`r`n      if (item.ry) item.mesh.rotation.y += dt * item.ry;`r`n      if (item.rz) item.mesh.rotation.z += dt * item.rz;`r`n    });",
    "    // Rotate rotating meshes — apply 0.45x slow multiplier`r`n    rotatingObjects.forEach(item => {`r`n      if (item.rx) item.mesh.rotation.x += dt * item.rx * 0.45;`r`n      if (item.ry) item.mesh.rotation.y += dt * item.ry * 0.45;`r`n      if (item.rz) item.mesh.rotation.z += dt * item.rz * 0.45;`r`n    });"
)

Set-Content -NoNewline -Path $path -Value $content
Write-Host "engine.js patched OK"
