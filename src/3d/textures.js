/* =====================================================================
   THREEUI KAGE ENGINE — PROCEDURAL TEXTURE & ASSET PIPELINE
   High-performance GPU-canvas generated textures and texture loaders
   ===================================================================== */

const TAU = Math.PI * 2;
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/* PRNG + procedural noise for cyber surfaces */
export function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noise2D(seed) {
  const rnd = mulberry32(seed);
  const P = new Uint8Array(512);
  for (let i = 0; i < 256; i++) P[i] = i;
  for (let i = 255; i > 0; i--) { const r = (rnd() * (i + 1)) | 0; const q = P[i]; P[i] = P[r]; P[r] = q; }
  for (let i = 0; i < 256; i++) P[256 + i] = P[i];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y) => { h &= 3; const u = h < 2 ? x : y, v = h < 2 ? y : x; return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v); };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const A = P[X] + Y, B = P[X + 1] + Y;
    return lerp(lerp(grad(P[A], xf, yf), grad(P[B], xf - 1, yf), u),
                lerp(grad(P[A + 1], xf, yf - 1), grad(P[B + 1], xf - 1, yf - 1), u), v);
  };
}

/* 1. Cyber Grid Floor Texture */
export function texCyberGrid() {
  const S = 512, c = cvs(S, S), x = c.getContext('2d');
  x.fillStyle = '#050814'; x.fillRect(0, 0, S, S);
  const step = 64;
  // major grid
  x.strokeStyle = 'rgba(0,245,255,0.32)'; x.lineWidth = 1.5;
  for (let p = 0; p <= S; p += step) {
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, S); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(S, p); x.stroke();
  }
  // minor grid
  x.strokeStyle = 'rgba(123,47,247,0.14)'; x.lineWidth = 0.8;
  for (let p = 0; p <= S; p += step / 4) {
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, S); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(S, p); x.stroke();
  }
  // intersection luminous dots
  x.fillStyle = '#00f5ff';
  for (let i = 0; i <= S; i += step) {
    for (let j = 0; j <= S; j += step) {
      x.beginPath(); x.arc(i, j, 2.5, 0, TAU); x.fill();
    }
  }
  return c;
}

/* 2. Cyber Wall / Structure Texture */
export function texCyberWall() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  x.fillStyle = '#080d1f'; x.fillRect(0, 0, W, H);
  const n = noise2D(88);
  const id = x.getImageData(0, 0, W, H), d = id.data;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const v = 10 + (n(i * 0.07, j * 0.02) * 0.5 + 0.5) * 16 + Math.random() * 6;
      const k = (j * W + i) * 4;
      d[k] = v + 4; d[k + 1] = v + 8; d[k + 2] = v + 24; d[k + 3] = 255;
    }
  }
  x.putImageData(id, 0, 0);
  // circuit traces
  x.strokeStyle = 'rgba(0,245,255,0.30)'; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(0, 128); x.lineTo(160, 128); x.lineTo(224, 192); x.lineTo(512, 192); x.stroke();
  x.beginPath(); x.moveTo(0, 384); x.lineTo(320, 384); x.lineTo(380, 324); x.lineTo(512, 324); x.stroke();
  x.strokeStyle = 'rgba(255,77,157,0.25)'; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 196); x.lineTo(184, 252); x.lineTo(184, 512); x.stroke();
  return c;
}

/* 3. Cyber Sky / Celestial Dome */
export function texCyberSky() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#010306');
  g.addColorStop(0.45, '#040816');
  g.addColorStop(1, '#0c0724');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rnd = mulberry32(1337);
  for (let i = 0; i < 520; i++) {
    const px = rnd() * W, py = rnd() * H, r = rnd() * 1.5, a = 0.2 + rnd() * 0.8;
    x.fillStyle = rnd() > 0.4 ? `rgba(0,245,255,${a})` : `rgba(255,77,157,${a})`;
    x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
  }
  const hg = x.createLinearGradient(0, H * 0.65, 0, H);
  hg.addColorStop(0, 'rgba(123,47,247,0.0)');
  hg.addColorStop(1, 'rgba(0,245,255,0.15)');
  x.fillStyle = hg; x.fillRect(0, H * 0.65, W, H * 0.35);
  return c;
}

/* 4. Distant Cyber Skyline Horizon */
export function texCyberHorizon() {
  const W = 1024, H = 256, c = cvs(W, H), x = c.getContext('2d');
  x.fillStyle = '#050814'; x.fillRect(0, 0, W, H);
  const rnd = mulberry32(999);
  let bx = 0;
  while (bx < W) {
    const bw = 28 + rnd() * 60, bh = 60 + rnd() * 160;
    x.fillStyle = `rgba(${8 + (rnd() * 20) | 0},${12 + (rnd() * 24) | 0},${36 + (rnd() * 36) | 0},1)`;
    x.fillRect(bx, H - bh, bw, bh);
    x.fillStyle = `rgba(0,245,255,${0.1 + rnd() * 0.5})`;
    const cols = Math.floor(bw / 12), rows = Math.floor(bh / 18);
    for (let ci = 0; ci < cols; ci++) {
      for (let ri = 0; ri < rows; ri++) {
        if (rnd() > 0.45) x.fillRect(bx + ci * 12 + 3, H - bh + ri * 18 + 5, 6, 8);
      }
    }
    bx += bw;
  }
  return c;
}

/* 5. Radial Glow / Particle Sprite */
export function texGlow(inner = 'rgba(0,245,255,0.85)', mid = 'rgba(123,47,247,0.35)') {
  const S = 128, c = cvs(S, S), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, mid);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return c;
}

/* 6. Cursor Wisp Particle */
export function texWisp() {
  const S = 64, c = cvs(S, S), x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.2, '#00f5ff');
  g.addColorStop(0.65, 'rgba(0,245,255,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return c;
}

/* 7. Central Generative AI Core */
export function texCyberCore() {
  const S = 512, c = cvs(S, S), x = c.getContext('2d'), cx = S / 2;
  const g = x.createRadialGradient(cx, cx, 18, cx, cx, 230);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.18, '#00f5ff');
  g.addColorStop(0.5, '#7b2ff7');
  g.addColorStop(0.75, 'rgba(255,77,157,0.45)');
  g.addColorStop(1, 'rgba(5,8,20,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(0,245,255,0.6)'; x.lineWidth = 2.5;
  x.beginPath(); x.arc(cx, cx, 185, 0, TAU); x.stroke();
  x.strokeStyle = 'rgba(123,47,247,0.45)'; x.setLineDash([10, 14]); x.lineWidth = 1.8;
  x.beginPath(); x.arc(cx, cx, 148, 0, TAU); x.stroke();
  x.setLineDash([]); x.strokeStyle = 'rgba(255,77,157,0.35)'; x.lineWidth = 1.2;
  x.beginPath(); x.arc(cx, cx, 112, 0.4, Math.PI - 0.4); x.stroke();
  return c;
}

/* 8. Holographic Project Preview Cards */
export function texProjectCard(title, category, color = '#00f5ff') {
  const W = 512, H = 320, c = cvs(W, H), x = c.getContext('2d');
  x.fillStyle = '#090f24'; x.fillRect(0, 0, W, H);
  // Grid background
  x.strokeStyle = 'rgba(255,255,255,0.06)'; x.lineWidth = 1;
  for (let i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 0; j < H; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  // Border with color
  x.strokeStyle = color; x.lineWidth = 3;
  x.strokeRect(4, 4, W - 8, H - 8);
  // Corner accents
  x.fillStyle = color;
  x.fillRect(0, 0, 18, 18);
  x.fillRect(W - 18, 0, 18, 18);
  x.fillRect(0, H - 18, 18, 18);
  x.fillRect(W - 18, H - 18, 18, 18);
  // Category banner
  x.fillStyle = 'rgba(0,0,0,0.5)';
  x.fillRect(20, 24, W - 40, 42);
  x.fillStyle = color;
  x.font = 'bold 15px "Courier New", monospace';
  x.fillText(category.toUpperCase(), 32, 50);
  // Title
  x.fillStyle = '#ffffff';
  x.font = 'bold 28px sans-serif';
  x.fillText(title, 32, 120);
  // Abstract schematic art
  x.strokeStyle = 'rgba(0,245,255,0.4)'; x.lineWidth = 2;
  x.strokeRect(32, 150, W - 64, 110);
  x.beginPath(); x.moveTo(32, 205); x.lineTo(W - 32, 205); x.stroke();
  x.fillStyle = 'rgba(123,47,247,0.3)';
  x.fillRect(40, 158, 80, 40);
  x.fillRect(140, 158, 120, 40);
  x.fillRect(280, 158, 90, 40);
  x.fillStyle = color;
  x.font = '13px monospace';
  x.fillText('● SYSTEM STATUS: ACTIVE // 3D INTERACTIVE NODE', 34, 292);
  return c;
}

/* 9. Tech Stack Globe Texture — draws logo + name on BOTH hemispheres (front & back) so it is always visible from all angles */
export function texTechGlobe(tech) {
  const W = 1024, H = 512, c = cvs(W, H), x = c.getContext('2d');

  // Deep dark cyber background fill
  x.fillStyle = '#050814';
  x.fillRect(0, 0, W, H);

  // Helper to draw a complete tech hemisphere (logo, rings, grid, name, sub) at (cx, cy)
  function drawHemisphere(cx, cy) {
    // 1. Radial gradient core seamlessly filling the hemisphere tile
    const bg = x.createRadialGradient(cx, cy, 20, cx, cy, 320);
    bg.addColorStop(0, tech.bg0 || '#0e2433');
    bg.addColorStop(0.6, tech.bg1 || '#082030');
    bg.addColorStop(1, '#050814');
    x.fillStyle = bg;
    x.fillRect(cx - 256, 0, 512, H);

    // 2. Latitude / longitude cyber grid lines
    x.strokeStyle = `${tech.color}24`;
    x.lineWidth = 1.3;
    for (let i = 1; i <= 6; i++) {
      x.beginPath();
      x.arc(cx, cy, 240 * (i * 0.16), 0, TAU);
      x.stroke();
    }
    for (let a = 0; a < TAU; a += Math.PI / 6) {
      x.beginPath();
      x.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
      x.lineTo(cx + Math.cos(a) * 230, cy + Math.sin(a) * 230);
      x.stroke();
    }

    // 3. Glowing perimeter aura
    const ring = x.createRadialGradient(cx, cy, 130, cx, cy, 245);
    ring.addColorStop(0, 'rgba(0,0,0,0)');
    ring.addColorStop(0.6, `${tech.color}14`);
    ring.addColorStop(1, `${tech.color}44`);
    x.fillStyle = ring;
    x.fillRect(cx - 256, 0, 512, H);

    // 4. Logo drawing at (cx, cy - 42)
    x.save();
    x.translate(cx, cy - 42);
    x.scale(1.8, 1.8);
    x.fillStyle = tech.color;
    x.strokeStyle = tech.color;

    const logo = tech.logo;
    if (logo === 'react') {
      // React atom icon
      x.lineWidth = 4.5;
      x.strokeStyle = '#61DAFB';
      x.fillStyle = '#61DAFB';
      x.beginPath(); x.arc(0, 0, 7.5, 0, TAU); x.fill();
      const angles = [0, Math.PI / 3, -Math.PI / 3];
      angles.forEach(angle => {
        x.save();
        x.rotate(angle);
        x.beginPath();
        x.ellipse(0, 0, 35, 12, 0, 0, TAU);
        x.stroke();
        x.restore();
      });
    } else if (logo === 'nextjs') {
      // Next.js "N" lettermark
      x.fillStyle = '#ffffff';
      x.font = 'bold 58px sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('N', 0, 0);
      x.fillStyle = tech.color || '#ffffff';
      x.beginPath();
      x.moveTo(15, -12); x.lineTo(34, 20); x.lineTo(34, -12);
      x.fill();
    } else if (logo === 'tailwind') {
      // Tailwind CSS fluid waves
      x.fillStyle = '#38BDF8';
      // Upper wave
      x.beginPath();
      x.moveTo(-24, -8);
      x.bezierCurveTo(-18, -24, -4, -24, 2, -12);
      x.bezierCurveTo(6, -4, 10, 0, 18, 0);
      x.bezierCurveTo(24, 0, 28, -6, 28, -12);
      x.bezierCurveTo(22, 2, 8, 2, 2, -8);
      x.bezierCurveTo(-2, -16, -6, -20, -14, -20);
      x.bezierCurveTo(-20, -20, -24, -14, -24, -8);
      x.closePath();
      x.fill();
      // Lower wave
      x.beginPath();
      x.moveTo(-12, 12);
      x.bezierCurveTo(-6, -4, 8, -4, 14, 6);
      x.bezierCurveTo(18, 14, 22, 18, 30, 18);
      x.bezierCurveTo(36, 18, 40, 12, 40, 6);
      x.bezierCurveTo(34, 22, 20, 22, 14, 12);
      x.bezierCurveTo(10, 4, 6, 0, -2, 0);
      x.bezierCurveTo(-8, 0, -12, 6, -12, 12);
      x.closePath();
      x.fill();
    } else if (logo === 'nodejs') {
      // Node.js hexagon
      x.strokeStyle = '#339933';
      x.lineWidth = 5.5;
      x.fillStyle = 'rgba(51,153,51,0.22)';
      x.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6;
        if (i === 0) x.moveTo(Math.cos(a) * 32, Math.sin(a) * 32);
        else x.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
      }
      x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#339933';
      x.font = 'bold 21px monospace';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('js', 0, 0);
    } else if (logo === 'mongo') {
      // MongoDB leaf
      x.fillStyle = '#00ED64';
      x.beginPath();
      x.moveTo(0, -36);
      x.bezierCurveTo(24, -22, 26, 8, 0, 36);
      x.bezierCurveTo(-26, 8, -24, -22, 0, -36);
      x.fill();
      x.fillStyle = '#ffffff';
      x.fillRect(-2.5, 6, 5, 28);
    } else if (logo === 'express') {
      // Express "e." wordmark
      x.fillStyle = '#ffffff';
      x.font = 'bold 50px monospace';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('e.', 0, 0);
      x.fillStyle = tech.color;
      x.fillRect(-28, 24, 56, 3);
    } else if (logo === 'threejs') {
      // Three.js wireframe deltahedron
      x.strokeStyle = '#00F5FF';
      x.lineWidth = 3.8;
      x.beginPath();
      x.moveTo(0, -32);
      x.lineTo(28, 22);
      x.lineTo(-28, 22);
      x.closePath();
      x.stroke();
      x.beginPath();
      x.moveTo(0, -32); x.lineTo(0, 10);
      x.moveTo(28, 22); x.lineTo(0, 10);
      x.moveTo(-28, 22); x.lineTo(0, 10);
      x.stroke();
      x.fillStyle = '#ffffff';
      x.beginPath(); x.arc(0, 10, 4, 0, TAU); x.fill();
    } else if (logo === 'n8n') {
      // n8n workflow nodes
      x.fillStyle = '#EA4B71';
      x.strokeStyle = '#EA4B71';
      x.lineWidth = 4.5;
      x.beginPath(); x.arc(-18, -10, 8, 0, TAU); x.fill();
      x.beginPath(); x.arc(18, -10, 8, 0, TAU); x.fill();
      x.beginPath(); x.arc(0, 16, 8, 0, TAU); x.fill();
      x.beginPath();
      x.moveTo(-18, -10); x.lineTo(0, 16); x.lineTo(18, -10);
      x.stroke();
    } else if (logo === 'supabase') {
      // Supabase lightning
      x.fillStyle = '#3ECF8E';
      x.beginPath();
      x.moveTo(3, -32);
      x.lineTo(-18, 4);
      x.lineTo(-2, 4);
      x.lineTo(-3, 32);
      x.lineTo(18, -4);
      x.lineTo(2, -4);
      x.closePath();
      x.fill();
    }
    x.restore();

    // 5. Tech name label
    x.fillStyle = '#ffffff';
    x.font = 'bold 36px "Courier New", monospace';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.shadowColor = tech.color;
    x.shadowBlur = 18;
    x.fillText(tech.name, cx, cy + 76);
    x.shadowBlur = 0;

    // 6. Subtitle
    x.fillStyle = `${tech.color}dd`;
    x.font = '20px "Courier New", monospace';
    x.fillText(tech.sub, cx, cy + 112);
  }

  // Draw on BOTH hemispheres (u = 0.25 and u = 0.75, 180 degrees opposite)
  drawHemisphere(W * 0.25, H * 0.5); // Front hemisphere (facing camera)
  drawHemisphere(W * 0.75, H * 0.5); // Back hemisphere (opposite side)

  return c;
}

/* 9b. Pedestal Holographic HUD Badge Texture — for pipeline & tech stations */
export function texPedestalBadge(step, name, sub, color = '#00f5ff') {
  const W = 512, H = 140, c = cvs(W, H), x = c.getContext('2d');
  // Cyber dark translucent background
  x.fillStyle = '#060c1c';
  x.fillRect(0, 0, W, H);

  // Border with accent corners
  x.strokeStyle = `${color}44`;
  x.lineWidth = 2;
  x.strokeRect(4, 4, W - 8, H - 8);

  // Top neon accent bar
  x.fillStyle = color;
  x.fillRect(4, 4, W - 8, 4);

  // Corner brackets
  const L = 16;
  x.strokeStyle = color;
  x.lineWidth = 3;
  // Top left
  x.beginPath(); x.moveTo(4, 4 + L); x.lineTo(4, 4); x.lineTo(4 + L, 4); x.stroke();
  // Top right
  x.beginPath(); x.moveTo(W - 4 - L, 4); x.lineTo(W - 4, 4); x.lineTo(W - 4, 4 + L); x.stroke();
  // Bottom left
  x.beginPath(); x.moveTo(4, H - 4 - L); x.lineTo(4, H - 4); x.lineTo(4 + L, H - 4); x.stroke();
  // Bottom right
  x.beginPath(); x.moveTo(W - 4 - L, H - 4); x.lineTo(W - 4, H - 4); x.lineTo(W - 4, H - 4 - L); x.stroke();

  // Step badge
  x.fillStyle = `${color}22`;
  x.fillRect(18, 20, 68, 42);
  x.strokeStyle = color;
  x.lineWidth = 1.5;
  x.strokeRect(18, 20, 68, 42);

  x.fillStyle = color;
  x.font = 'bold 22px monospace';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(step, 52, 41);

  // Main framework / library name
  x.fillStyle = '#ffffff';
  x.font = 'bold 34px "Courier New", monospace';
  x.textAlign = 'left';
  x.shadowColor = color;
  x.shadowBlur = 12;
  x.fillText(name.toUpperCase(), 102, 42);
  x.shadowBlur = 0;

  // Subtitle / category
  x.fillStyle = `${color}cc`;
  x.font = '19px "Courier New", monospace';
  x.fillText(sub.toUpperCase(), 102, 94);

  // Glowing status pulse dot
  x.fillStyle = '#00ff66';
  x.shadowColor = '#00ff66';
  x.shadowBlur = 8;
  x.beginPath(); x.arc(W - 32, 42, 6, 0, TAU); x.fill();
  x.shadowBlur = 0;

  return c;
}

/* 10. JS Code Panel Texture — glowing code editor display */
export function texCodePanel() {
  const W = 768, H = 480, c = cvs(W, H), x = c.getContext('2d');

  // Dark editor background
  x.fillStyle = '#060c1e';
  x.fillRect(0, 0, W, H);

  // Subtle grid
  x.strokeStyle = 'rgba(0,245,255,0.04)';
  x.lineWidth = 1;
  for (let i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 0; j < H; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }

  // Title bar
  const titleBar = x.createLinearGradient(0, 0, W, 0);
  titleBar.addColorStop(0, 'rgba(0,245,255,0.15)');
  titleBar.addColorStop(1, 'rgba(123,47,247,0.1)');
  x.fillStyle = titleBar;
  x.fillRect(0, 0, W, 38);
  // Traffic lights
  [[20, '#ff5f57'], [46, '#febc2e'], [72, '#28c840']].forEach(([cx, col]) => {
    x.fillStyle = col;
    x.beginPath(); x.arc(cx, 19, 7, 0, TAU); x.fill();
  });
  x.fillStyle = '#8e9db5';
  x.font = '14px "Courier New", monospace';
  x.textAlign = 'center';
  x.fillText('passion.js — MD MOHIUDDIN', W / 2, 24);

  // Line number gutter
  x.fillStyle = 'rgba(0,0,0,0.3)';
  x.fillRect(0, 38, 44, H - 38);
  x.strokeStyle = 'rgba(0,245,255,0.12)';
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(44, 38); x.lineTo(44, H); x.stroke();

  // Code lines: [lineNum, color, text]
  const lines = [
    [1,  '#7b2ff7',   '// 🚀 Passion-driven code by Md Mohiuddin'],
    [2,  '#565f73',   ''],
    [3,  '#ff4d9d',   'const passion = {'],
    [4,  '#00f5ff',   '  mission:   "Build. Automate. Teach.",'],
    [5,  '#00ffcc',   '  stack:     ["React", "Next.js", "Node.js",'],
    [6,  '#00ffcc',   '              "MongoDB", "Express", "AI"],'],
    [7,  '#ffaa00',   '  philosophy: "Technology is a craft.",'],
    [8,  '#00f5ff',   '  driven_by:  "Curiosity + Purpose",'],
    [9,  '#ff4d9d',   '};'],
    [10, '#565f73',   ''],
    [11, '#7b2ff7',   'async function buildFuture(idea) {'],
    [12, '#8e9db5',   '  await learn(idea);'],
    [13, '#8e9db5',   '  await build(idea);'],
    [14, '#8e9db5',   '  await teach(idea);'],
    [15, '#00f5ff',   '  return impact; // ∞'],
    [16, '#7b2ff7',   '}'],
  ];

  const lineH = 25, startY = 60;
  lines.forEach(([num, color, code]) => {
    const y = startY + (num - 1) * lineH;
    // Line number
    x.fillStyle = '#3d4d6a';
    x.font = '13px "Courier New", monospace';
    x.textAlign = 'right';
    x.fillText(num, 38, y + 13);
    // Code
    if (code) {
      x.fillStyle = color;
      x.textAlign = 'left';
      x.font = '14px "Courier New", monospace';
      x.shadowColor = color;
      x.shadowBlur = 4;
      x.fillText(code, 54, y + 13);
      x.shadowBlur = 0;
    }
  });

  // Blinking cursor at line 17
  x.fillStyle = '#00f5ff';
  x.fillRect(54, startY + 16 * lineH, 9, 18);

  // Bottom status bar
  const statusBar = x.createLinearGradient(0, 0, W, 0);
  statusBar.addColorStop(0, 'rgba(0,245,255,0.2)');
  statusBar.addColorStop(1, 'rgba(123,47,247,0.15)');
  x.fillStyle = statusBar;
  x.fillRect(0, H - 28, W, 28);
  x.fillStyle = '#00f5ff';
  x.font = '12px "Courier New", monospace';
  x.textAlign = 'left';
  x.fillText('● JS  UTF-8  LF  ◈ passion.js  Ln 17, Col 1', 12, H - 9);
  x.textAlign = 'right';
  x.fillStyle = '#7b2ff7';
  x.fillText('Full-Stack Developer ◆ AI Automation ◆ Mentor', W - 12, H - 9);

  return c;
}

/* Helper to convert canvas to Three Texture */
export function makeTexture(THREE, canvasEl, opt = {}) {
  const t = new THREE.CanvasTexture(canvasEl);
  t.wrapS = opt.wS || THREE.ClampToEdgeWrapping;
  t.wrapT = opt.wT || THREE.ClampToEdgeWrapping;
  if (opt.rep) t.repeat.set(opt.rep[0], opt.rep[1]);
  return t;
}
