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

/* Helper to convert canvas to Three Texture */
export function makeTexture(THREE, canvasEl, opt = {}) {
  const t = new THREE.CanvasTexture(canvasEl);
  t.wrapS = opt.wS || THREE.ClampToEdgeWrapping;
  t.wrapT = opt.wT || THREE.ClampToEdgeWrapping;
  if (opt.rep) t.repeat.set(opt.rep[0], opt.rep[1]);
  return t;
}
