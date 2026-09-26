/* =====================================================================
   MD MOHIUDDIN — THREEUI / KAGE 3D CINEMATIC ENGINE
   Spline Camera Rig, 11 Curated 3D Scenes, Procedural Shaders,
   Image 1 (Portrait) & Image 2 (Workshop) 3D Integration,
   Traveling Data Pulses, Particle Dissolutions & Interactive Wisps
   ===================================================================== */

import {
  texCyberGrid, texCyberWall, texCyberSky, texCyberHorizon,
  texGlow, texWisp, texCyberCore, texProjectCard,
  texTechGlobe, texCodePanel, texPedestalBadge,
  makeTexture, mulberry32, noise2D
} from './textures.js';
import { REAL_PROJECTS, CHAPTERS } from '../data/portfolioData.js';

export function createEngine() {
  const THREE = window.THREE;
  if (!THREE) {
    console.error('[Engine] THREE.js is not loaded on window.');
    return null;
  }

  /* Viewport helpers */
  const dpr   = () => Math.min(window.devicePixelRatio || 1, 1.75);
  const vpW   = () => window.innerWidth;
  const vpH   = () => window.innerHeight;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp  = (a, b, t)   => a + (b - a) * t;
  const smooth= (lo, hi, v) => { const x = clamp((v - lo) / (hi - lo), 0, 1); return x * x * (3 - 2 * x); };
  const TAU   = Math.PI * 2;

  let renderer, scene, camera, clock;
  let portraitMesh, portraitHolo, workshopMesh, workshopDissolveParticles;
  let bannerMesh, bannerHolo, bannerGroup;
  let philosophyPortrait;
  let pulsePackets = [];
  let rotatingObjects = [];
  let interactiveNodes = [];

  const uT = { value: 0 };
  const WORLD = { uT, haze: [], dataStreams: [] };
  const WISPS = { list: [], next: 0, pts: null, geom: null, pos: null, aA: null, aS: null };
  // RIG.prog   — target chapter index (float 0-10), driven by scroll or nav click
  // RIG.smooth — currently interpolated chapter index for camera
  // RIG.targetProg — set by flyToChapter() nav click; cleared once arrived
  const RIG = { prog: 0, smooth: 0, mx: 0, my: 0, tmx: 0, tmy: 0, intro: 0, targetProg: null, _navActive: false };

  let curveP, curveT, _p, _t, _d;
  let raycaster, mouseNorm;

  /* Helper to create texture */
  const tex = (cvs, opt) => makeTexture(THREE, cvs, opt);

  /* ---------------------------------------------------------------------
     1 · CAMERA RIG WAYPOINTS (11 SCENES ALONG Z AXIS)
     --------------------------------------------------------------------- */
  const WAYPOINTS = [
    // 0: Genesis (Hero) - Intro (Portrait Scene)
    { p: [0, 4.2, 14],       t: [0, 3.8, 0] },
    // 1: Genesis - Identity Matrix (3D Banner Scene)
    { p: [0, 4.2, 0],        t: [0, 4.0, -9] },
    // 2: The Builder (Workshop Scene)
    { p: [-2.4, 5.0, -14],   t: [0, 4.5, -24] },
    // 3: Generative AI
    { p: [3.2, 7.5, -42],    t: [0, 7.0, -56] },
    // 4: AI Automation
    { p: [-3.5, 5.5, -74],   t: [0, 5.0, -88] },
    // 5: DevOps Infrastructure
    { p: [3.0, 6.0, -106],   t: [0, 5.2, -120] },
    // 6: Mentor Lab (Image 2 Auditorium)
    { p: [0, 5.4, -138],     t: [0, 5.2, -152] },
    // 7: Computer Science Fundamentals
    { p: [-3.0, 6.5, -170],  t: [0, 6.0, -184] },
    // 8: Project Universe
    { p: [2.8, 6.0, -202],   t: [0, 5.5, -218] },
    // 9: Technology Constellation
    { p: [-2.2, 7.2, -238],  t: [0, 7.0, -254] },
    // 10: My Philosophy
    { p: [0, 5.0, -272],     t: [0, 4.8, -286] },
    // 11: Digital Horizon
    { p: [0, 5.0, -304],     t: [0, 6.0, -332] }
  ];

  function buildRig() {
    const ptsP = WAYPOINTS.map(w => new THREE.Vector3(...w.p));
    const ptsT = WAYPOINTS.map(w => new THREE.Vector3(...w.t));
    curveP = new THREE.CatmullRomCurve3(ptsP, false, 'catmullrom', 0.12);
    curveT = new THREE.CatmullRomCurve3(ptsT, false, 'catmullrom', 0.12);
  }

  function applyCamera() {
    if (!curveP || !curveT) return;
    const maxIdx = WAYPOINTS.length - 1;
    const s = clamp(RIG.smooth / maxIdx, 0, 1);

    curveP.getPoint(s, _p);
    curveT.getPoint(s, _t);

    // Initial cinematic intro dolly-in
    const introDist = (1 - RIG.intro) * 12.0;
    _p.z += introDist;
    _p.y += (1 - RIG.intro) * 2.0;

    // Mouse parallax
    const px = RIG.mx * 1.8;
    const py = RIG.my * 1.1;

    camera.position.set(_p.x + px, _p.y + py, _p.z);
    camera.lookAt(_t.x + px * 0.4, _t.y + py * 0.4, _t.z);

    // Dynamic tilt on personal portrait
    if (portraitMesh) {
      portraitMesh.rotation.y = RIG.mx * 0.18;
      portraitMesh.rotation.x = -RIG.my * 0.12;
      if (portraitHolo) {
        portraitHolo.rotation.y = RIG.mx * 0.22;
        portraitHolo.rotation.x = -RIG.my * 0.15;
      }
    }

    // Dynamic tilt on banner projection
    if (bannerMesh) {
      bannerMesh.rotation.y = RIG.mx * 0.12;
      bannerMesh.rotation.x = -RIG.my * 0.08;
      if (bannerHolo) {
        bannerHolo.rotation.y = RIG.mx * 0.15;
        bannerHolo.rotation.x = -RIG.my * 0.10;
      }
    }

    // Dynamic tilt on workshop projection
    if (workshopMesh) {
      workshopMesh.rotation.y = RIG.mx * 0.10;
      workshopMesh.rotation.x = -RIG.my * 0.08;
    }

    // Smooth opacity cross-fade for seamless travel
    // Fade portrait: 1.0 at 0..0.4, fades to 0 at 0.4..0.9
    if (portraitMesh && portraitMesh.material) {
      let pAlpha = 1.0;
      if (RIG.smooth > 0.4) {
        pAlpha = clamp(1.0 - (RIG.smooth - 0.4) / 0.5, 0, 1);
      }
      portraitMesh.material.opacity = pAlpha;
      portraitMesh.visible = pAlpha > 0.01;
      if (portraitHolo && portraitHolo.material) {
        portraitHolo.material.opacity = pAlpha * 0.45;
        portraitHolo.visible = pAlpha > 0.01;
      }
    }

    // Fade banner: 0 at <0.2, fades in 0.2..0.7, full 0.7..1.3, fades out 1.3..1.85
    if (bannerMesh && bannerMesh.material) {
      let bAlpha = 0.0;
      if (RIG.smooth >= 0.2 && RIG.smooth < 0.7) {
        bAlpha = clamp((RIG.smooth - 0.2) / 0.5, 0, 1);
      } else if (RIG.smooth >= 0.7 && RIG.smooth <= 1.3) {
        bAlpha = 1.0;
      } else if (RIG.smooth > 1.3 && RIG.smooth <= 1.85) {
        bAlpha = clamp(1.0 - (RIG.smooth - 1.3) / 0.55, 0, 1);
      }
      bannerMesh.material.opacity = bAlpha;
      bannerMesh.visible = bAlpha > 0.01;
      if (bannerHolo && bannerHolo.material) {
        bannerHolo.material.opacity = bAlpha * 0.45;
        bannerHolo.visible = bAlpha > 0.01;
      }
    }
  }

  /* ---------------------------------------------------------------------
     2 · LIGHTS & GLOBAL STAGE
     --------------------------------------------------------------------- */
  function buildLights() {
    scene.add(new THREE.HemisphereLight(0x00f5ff, 0x050814, 0.45));
    const key = new THREE.DirectionalLight(0x00f5ff, 1.6);
    key.position.set(10, 26, 14); key.target.position.set(0, 4, -50);
    scene.add(key.target); scene.add(key);

    const rim = new THREE.DirectionalLight(0x7b2ff7, 1.4);
    rim.position.set(-20, 18, -120); rim.target.position.set(0, 5, -150);
    scene.add(rim.target); scene.add(rim);

    const magenta = new THREE.PointLight(0xff4d9d, 2.5, 45, 2);
    magenta.position.set(0, 6, -8);
    scene.add(magenta);

    const cyanStage = new THREE.PointLight(0x00f5ff, 2.2, 50, 2);
    cyanStage.position.set(0, 8, -150);
    scene.add(cyanStage);
  }

  function buildGlobalEnvironment() {
    // 1. Endless cyber grid floor spanning from z = 30 to z = -360
    const floorTex = tex(texCyberGrid(), { wS: THREE.RepeatWrapping, wT: THREE.RepeatWrapping, rep: [40, 90] });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 440),
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.25,
        metalness: 0.85,
        emissive: 0x001525,
        emissiveIntensity: 0.65
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -165);
    scene.add(floor);

    // 2. Cyber sky dome
    const skyTex = tex(texCyberSky(), { wS: THREE.RepeatWrapping, wT: THREE.RepeatWrapping, rep: [1, 1] });
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(240, 32, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })
    );
    sky.position.set(0, 0, -165);
    scene.add(sky);

    // 3. Cyber skyline at distant horizons
    const horizTex = tex(texCyberHorizon(), { wS: THREE.ClampToEdgeWrapping, wT: THREE.ClampToEdgeWrapping });
    const horiz1 = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 60),
      new THREE.MeshBasicMaterial({ map: horizTex, transparent: true, depthWrite: false })
    );
    horiz1.position.set(0, 30, -350);
    scene.add(horiz1);
  }

  /* ---------------------------------------------------------------------
     3 · SCENE 01: DIGITAL GENESIS (IMAGE 1 — PORTRAIT)
     --------------------------------------------------------------------- */
  function buildHeroScene() {
    const loader = new THREE.TextureLoader();
    loader.load('/assets/portrait.png', texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      // Portrait Plane: aspect ratio 768:1024 = 3:4 -> w = 4.2, h = 5.6
      const w = 4.2, h = 5.6;
      const portraitGeo = new THREE.PlaneGeometry(w, h, 32, 32);

      // Subtle curved vertex distortion for 3D depth
      const pos = portraitGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        pos.setZ(i, -Math.pow(dist / 3.0, 2) * 0.35);
      }
      portraitGeo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.2,
        emissive: 0x051226,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      });

      portraitMesh = new THREE.Mesh(portraitGeo, mat);
      portraitMesh.position.set(0, 4.1, 1.5);
      scene.add(portraitMesh);

      // Holographic floating border frame with glowing corners
      const frameGeo = new THREE.PlaneGeometry(w + 0.35, h + 0.35);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      portraitHolo = new THREE.Mesh(frameGeo, frameMat);
      portraitHolo.position.set(0, 4.1, 1.42);
      scene.add(portraitHolo);

      // 4 Glowing corner brackets
      const bracketMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
      const bSize = 0.4, bThick = 0.05;
      [
        [-w/2 - 0.15,  h/2 + 0.15],
        [ w/2 + 0.15,  h/2 + 0.15],
        [-w/2 - 0.15, -h/2 - 0.15],
        [ w/2 + 0.15, -h/2 - 0.15]
      ].forEach(([bx, by]) => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(bSize, bSize, bThick), bracketMat);
        bracket.position.set(bx, by, 0.05);
        portraitHolo.add(bracket);
      });
    });

    // Flanking architectural cyber pillars
    const wallTex = tex(texCyberWall(), { wS: THREE.RepeatWrapping, wT: THREE.RepeatWrapping, rep: [1, 3] });
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.3, metalness: 0.9, emissive: 0x001833, emissiveIntensity: 0.4 });
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

    function pylon(px, pz, h = 18, bw = 2.2) {
      const g = new THREE.Group();
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(bw, h, bw), wallMat);
      pillar.position.y = h / 2;
      g.add(pillar);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), cyanMat);
      strip.position.set(bw / 2 + 0.06, h / 2, 0);
      g.add(strip);
      g.position.set(px, 0, pz);
      scene.add(g);
    }
    pylon(-7.5, 3, 18, 2.5);
    pylon(7.5, 3, 18, 2.5);
  }

  /* ---------------------------------------------------------------------
     3.5 · SCENE 01B: THE CYBER BANNER (IMAGE 3 — BANNER AS 3D BACKGROUND)
     --------------------------------------------------------------------- */
  function buildBannerScene() {
    bannerGroup = new THREE.Group();
    bannerGroup.position.set(0, 4.2, -9);

    const loader = new THREE.TextureLoader();
    loader.load('/assets/banner.png', texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      // 1024x560 aspect ratio (~1.828)
      // Precise framed 3D panel matching Developer workshop scale (6.8 x 3.72)
      const w = 6.8, h = 3.72;
      const bannerGeo = new THREE.PlaneGeometry(w, h, 32, 16);

      // Subtle curved vertex distortion for cinematic depth
      const pos = bannerGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -Math.pow(x / 3.4, 2) * 0.22);
      }
      bannerGeo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.2,
        emissive: 0x07162e,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });

      bannerMesh = new THREE.Mesh(bannerGeo, mat);
      bannerGroup.add(bannerMesh);

      // Holographic glowing cyber frame
      const frameGeo = new THREE.PlaneGeometry(w + 0.25, h + 0.25, 32, 16);
      const fpos = frameGeo.attributes.position;
      for (let i = 0; i < fpos.count; i++) {
        const x = fpos.getX(i);
        fpos.setZ(i, -Math.pow(x / 3.4, 2) * 0.22 - 0.02);
      }
      frameGeo.computeVertexNormals();

      const frameMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
      });
      bannerHolo = new THREE.Mesh(frameGeo, frameMat);
      bannerGroup.add(bannerHolo);

      // Four corner cyber brackets
      const bMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.6 });
      const bSize = 0.38, bThick = 0.03;
      [
        [-w / 2 - 0.08,  h / 2 + 0.08],
        [ w / 2 + 0.08,  h / 2 + 0.08],
        [-w / 2 - 0.08, -h / 2 - 0.08],
        [ w / 2 + 0.08, -h / 2 - 0.08]
      ].forEach(([bx, by]) => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(bSize, bSize, bThick), bMat);
        bracket.position.set(bx, by, 0.04);
        bannerHolo.add(bracket);
      });
    });

    // Ambient floating cyberspace particles around the banner
    const N = 50;
    const pPos = new Float32Array(N * 3);
    const rnd = mulberry32(777);
    for (let i = 0; i < N; i++) {
      pPos[i * 3]     = (rnd() - 0.5) * 11;
      pPos[i * 3 + 1] = (rnd() - 0.5) * 6;
      pPos[i * 3 + 2] = (rnd() - 0.5) * 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const bannerStars = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.1,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      })
    );
    bannerGroup.add(bannerStars);

    // Flanking neon vertical light conduits
    [-4.2, 4.2].forEach(lx => {
      const conduitGeo = new THREE.CylinderGeometry(0.06, 0.06, 8, 16);
      const conduitMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.position.set(lx, 0, 0);
      bannerGroup.add(conduit);
    });

    // Soft cyan point light illuminating the banner
    const bannerLight = new THREE.PointLight(0x00f5ff, 1.4, 12, 2);
    bannerLight.position.set(0, 0, 2.0);
    bannerGroup.add(bannerLight);

    scene.add(bannerGroup);
  }

  /* ---------------------------------------------------------------------
     4 · SCENE 02: THE BUILDER — TECH STACK GLOBES + JS CODE PANEL
     --------------------------------------------------------------------- */
  function buildDeveloperScene() {
    const group = new THREE.Group();
    group.position.set(0, 4.5, -24);

    // ── CENTER PANEL: Glowing JS code editor ──────────────────────────────
    const panelTex = tex(texCodePanel());
    const panelW = 7.2, panelH = 4.5;
    const panelGeo = new THREE.PlaneGeometry(panelW, panelH);
    const panelMat = new THREE.MeshBasicMaterial({
      map: panelTex,
      transparent: true,
      opacity: 0.92
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0, 0);
    group.add(panel);

    // Neon border frame around the panel
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.35
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(panelW + 0.18, panelH + 0.18, 0.04),
      frameMat
    );
    group.add(frame);
    rotatingObjects.push({ mesh: frame, rz: 0.04 }); // very slow rotation pulse

    // Corner accent glow planes
    const cornerGlowTex = tex(texGlow('rgba(0,245,255,0.9)', 'rgba(123,47,247,0.3)'));
    [[-panelW / 2, panelH / 2], [panelW / 2, panelH / 2],
     [-panelW / 2, -panelH / 2], [panelW / 2, -panelH / 2]].forEach(([cx, cy]) => {
      const g = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.9),
        new THREE.MeshBasicMaterial({
          map: cornerGlowTex,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7
        })
      );
      g.position.set(cx, cy, 0.05);
      group.add(g);
    });

    // ── FOUR CORNER TECH-STACK GLOBES ─────────────────────────────────────
    const TECHS = [
      {
        logo: 'react',   name: 'React.js',  sub: 'Frontend Library',
        color: '#61DAFB', bg0: '#0e2433',   bg1: '#082030',
        pos: [-4.8,  2.4, 1.4], emissive: 0x61dafb
      },
      {
        logo: 'nextjs',  name: 'Next.js',   sub: 'Full-Stack Framework',
        color: '#ffffff', bg0: '#1a1a2e',   bg1: '#0f0f1a',
        pos: [ 4.8,  2.4, 1.4], emissive: 0xffffff
      },
      {
        logo: 'nodejs',  name: 'Node.js',   sub: 'JavaScript Runtime',
        color: '#339933', bg0: '#0b2612',   bg1: '#051609',
        pos: [-4.8, -2.4, 1.4], emissive: 0x339933
      },
      {
        logo: 'express', name: 'Express.js', sub: 'Backend Framework',
        color: '#ffffff', bg0: '#1c1c24',   bg1: '#101018',
        pos: [ 4.8, -2.4, 1.4], emissive: 0xffffff
      }
    ];

    TECHS.forEach(t => {
      const globeTex = tex(texTechGlobe(t));
      const sphereGeo = new THREE.SphereGeometry(0.82, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        map: globeTex,
        emissiveMap: globeTex,
        emissive: new THREE.Color(t.emissive),
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.6
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...t.pos);
      sphere.userData = { isInteractive: true, title: `${t.name} — ${t.sub}` };
      group.add(sphere);
      interactiveNodes.push(sphere);
      // Slow self-rotation so logo stays readable
      rotatingObjects.push({ mesh: sphere, ry: 0.18 });

      // Orbiting ring
      const ringColor = new THREE.Color(t.emissive);
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.05, 1.18, 32),
        new THREE.MeshBasicMaterial({
          color: ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending
        })
      );
      ringMesh.position.set(...t.pos);
      group.add(ringMesh);
      rotatingObjects.push({ mesh: ringMesh, rx: 0.55, ry: 0.38 });

      // Glow halo behind sphere
      const haloTex = tex(texGlow(
        `rgba(${parseInt(t.color.slice(1,3),16)},${parseInt(t.color.slice(3,5),16)},${parseInt(t.color.slice(5,7),16)},0.8)`,
        'rgba(5,8,20,0)'
      ));
      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 2.4),
        new THREE.MeshBasicMaterial({
          map: haloTex,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55
        })
      );
      halo.position.set(t.pos[0], t.pos[1], t.pos[2] - 0.5);
      group.add(halo);

      // Connection conduit line from globe to panel corner
      const panelCorner = new THREE.Vector3(
        t.pos[0] > 0 ? panelW / 2 : -panelW / 2,
        t.pos[1] > 0 ? panelH / 2 : -panelH / 2,
        0
      );
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        panelCorner,
        new THREE.Vector3(...t.pos)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(t.emissive),
        transparent: true, opacity: 0.45
      });
      group.add(new THREE.Line(lineGeo, lineMat));

      // Traveling pulse packet along the conduit
      const pulseGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(t.emissive) });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.userData = {
        p1: panelCorner.clone(),
        p2: new THREE.Vector3(...t.pos),
        progress: Math.random(),
        speed: 0.28 + Math.random() * 0.18
      };
      group.add(pulse);
      pulsePackets.push(pulse);
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     5 · SCENE 03: GENERATIVE AI (NEURAL CORE & SYNAPSES)
     --------------------------------------------------------------------- */
  function buildAiScene() {
    const group = new THREE.Group();
    group.position.set(0, 7.0, -56);

    // Glowing AI core sphere
    const coreMat = new THREE.MeshBasicMaterial({
      map: tex(texCyberCore()),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 32), coreMat);
    group.add(core);
    WORLD.core = core;

    // Dual rotating cyber rings
    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(7.2, 8.0, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })
    );
    ring1.rotation.x = Math.PI / 3;
    core.add(ring1);
    WORLD.coreRing1 = ring1;

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(8.5, 9.2, 40),
      new THREE.MeshBasicMaterial({ color: 0xff4d9d, side: THREE.DoubleSide, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
    );
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    core.add(ring2);
    WORLD.coreRing2 = ring2;

    // Synapsing neural pathways radiating outwards
    const N = 12;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * TAU;
      const rad = 11 + (i % 3) * 2;
      const targetPos = new THREE.Vector3(Math.cos(angle) * rad, Math.sin(angle) * (rad * 0.6), (i % 2 === 0 ? 3 : -3));

      const pathGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), targetPos]);
      const pathMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00f5ff : 0x7b2ff7,
        transparent: true,
        opacity: 0.45
      });
      group.add(new THREE.Line(pathGeo, pathMat));

      // AI concept satellite node
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f5ff : 0x7b2ff7 })
      );
      sat.position.copy(targetPos);
      group.add(sat);
    }

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     6 · SCENE 04: AI AUTOMATION (FRAMEWORK & LIBRARY PIPELINE STATIONS)
     --------------------------------------------------------------------- */
  function buildAutomationScene() {
    const group = new THREE.Group();
    group.position.set(0, 5.0, -88);

    // 6 pipeline framework & library tech stations
    const STATIONS = [
      {
        step: "01",
        pipeline: "INPUT",
        name: "React.js",
        sub: "Frontend Library",
        logo: "react",
        color: "#61DAFB",
        bg0: "#0b2636",
        bg1: "#061520",
        emissive: 0x61dafb
      },
      {
        step: "02",
        pipeline: "STYLING",
        name: "Tailwind CSS",
        sub: "CSS Framework",
        logo: "tailwind",
        color: "#38BDF8",
        bg0: "#08273d",
        bg1: "#041420",
        emissive: 0x38bdf8
      },
      {
        step: "03",
        pipeline: "FULL-STACK",
        name: "Next.js",
        sub: "Full-Stack App",
        logo: "nextjs",
        color: "#FFFFFF",
        bg0: "#1a1a2e",
        bg1: "#0c0c16",
        emissive: 0xffffff
      },
      {
        step: "04",
        pipeline: "RUNTIME",
        name: "Node.js",
        sub: "JavaScript Engine",
        logo: "nodejs",
        color: "#339933",
        bg0: "#0b2612",
        bg1: "#051609",
        emissive: 0x339933
      },
      {
        step: "05",
        pipeline: "STORAGE",
        name: "MongoDB",
        sub: "NoSQL Database",
        logo: "mongo",
        color: "#00ED64",
        bg0: "#082b15",
        bg1: "#04170b",
        emissive: 0x00ed64
      },
      {
        step: "06",
        pipeline: "3D VISUAL",
        name: "Three.js",
        sub: "3D WebGL Library",
        logo: "threejs",
        color: "#00F5FF",
        bg0: "#072636",
        bg1: "#03141f",
        emissive: 0x00f5ff
      }
    ];

    const stations = [];
    const startX = -8.5, stepX = 3.4;

    STATIONS.forEach((st, i) => {
      const x = startX + i * stepX;
      // Parabolic arch curve
      const y = Math.sin((i / (STATIONS.length - 1)) * Math.PI) * 1.5;
      const z = (i % 2 === 0 ? 1 : -1) * 0.8;
      const pos = new THREE.Vector3(x, y, z);
      stations.push(pos);

      // Station Hub Pedestal Base
      const hubBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 1.15, 0.45, 24),
        new THREE.MeshStandardMaterial({
          color: 0x081228,
          metalness: 0.85,
          roughness: 0.25,
          emissive: new THREE.Color(st.emissive),
          emissiveIntensity: 0.4
        })
      );
      hubBase.position.copy(pos);
      group.add(hubBase);

      // Pedestal Glowing Rim Ring
      const rim = new THREE.Mesh(
        new THREE.RingGeometry(0.86, 0.98, 24),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(st.emissive),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending
        })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(pos.x, pos.y + 0.23, pos.z);
      group.add(rim);

      // Rotating Tech Stack Globe on top of pedestal (2-part texture: front and back logos)
      const globeTex = tex(texTechGlobe(st));
      const globeGeo = new THREE.SphereGeometry(0.68, 32, 32);
      const globeMat = new THREE.MeshStandardMaterial({
        map: globeTex,
        emissiveMap: globeTex,
        emissive: new THREE.Color(st.emissive),
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.6
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      globe.position.set(pos.x, pos.y + 0.85, pos.z);
      globe.userData = {
        isInteractive: true,
        title: `STATION ${st.step} // ${st.name} (${st.sub}) — ${st.pipeline}`
      };
      group.add(globe);
      interactiveNodes.push(globe);
      // Gentle rotation around Y axis — both opposite sides have the logo!
      rotatingObjects.push({ mesh: globe, ry: 0.2 });

      // Orbiting Neon Ring around the globe
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1.02, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(st.emissive),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending
        })
      );
      ringMesh.position.set(pos.x, pos.y + 0.85, pos.z);
      ringMesh.rotation.x = Math.PI / 3.5;
      group.add(ringMesh);
      rotatingObjects.push({ mesh: ringMesh, rx: 0.45, ry: 0.32 });

      // Glow halo behind globe
      const haloTex = tex(texGlow(
        `rgba(${parseInt(st.color.slice(1,3),16)},${parseInt(st.color.slice(3,5),16)},${parseInt(st.color.slice(5,7),16)},0.75)`,
        'rgba(5,8,20,0)'
      ));
      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 2.1),
        new THREE.MeshBasicMaterial({
          map: haloTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.5
        })
      );
      halo.position.set(pos.x, pos.y + 0.85, pos.z - 0.4);
      group.add(halo);

      // Floating Holographic HUD Badge above each pedestal
      const badgeCanvas = texPedestalBadge(st.step, st.name, st.sub, st.color);
      const badgeTex = tex(badgeCanvas);
      const badgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.6),
        new THREE.MeshBasicMaterial({
          map: badgeTex,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide
        })
      );
      badgeMesh.position.set(pos.x, pos.y + 1.9, pos.z);
      badgeMesh.userData = {
        isInteractive: true,
        title: `${st.step} // ${st.name} — ${st.sub}`
      };
      group.add(badgeMesh);
      interactiveNodes.push(badgeMesh);
    });

    // Conduit connecting lines across pipeline arc
    for (let i = 0; i < stations.length - 1; i++) {
      const p1 = new THREE.Vector3(stations[i].x, stations[i].y + 0.85, stations[i].z);
      const p2 = new THREE.Vector3(stations[i + 1].x, stations[i + 1].y + 0.85, stations[i + 1].z);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(STATIONS[i].emissive),
        transparent: true,
        opacity: 0.5
      });
      group.add(new THREE.Line(lineGeo, lineMat));

      // Animated traveling data packet along conduit
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          blending: THREE.AdditiveBlending
        })
      );
      packet.userData = { p1, p2, progress: i * 0.18, speed: 0.32 + i * 0.04 };
      group.add(packet);
      pulsePackets.push(packet);
    }

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     7 · SCENE 05: DEVOPS INFRASTRUCTURE (SERVERS, CONTAINERS, CI/CD)
     --------------------------------------------------------------------- */
  function buildDevopsScene() {
    const group = new THREE.Group();
    group.position.set(0, 5.2, -120);

    // 3D Server Racks on both sides
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x060c1c, metalness: 0.9, roughness: 0.3, emissive: 0x001525, emissiveIntensity: 0.3 });
    const ledMat1 = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const ledMat2 = new THREE.MeshBasicMaterial({ color: 0x00ff66 });

    function serverRack(x, z) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.0, 1.8), rackMat);
      rack.position.set(x, 3.5, z);
      group.add(rack);

      // Blinking LEDs on rack face
      for (let row = 0; row < 7; row++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.08), row % 2 === 0 ? ledMat1 : ledMat2);
        led.position.set(x, 1.0 + row * 0.8, z + 0.95);
        group.add(led);
      }
    }

    serverRack(-6.5, -2);
    serverRack(-6.5, 4);
    serverRack( 6.5, -2);
    serverRack( 6.5, 4);

    // Floating Docker/Container Cubes in center
    for (let i = 0; i < 4; i++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.4, 1.4),
        new THREE.MeshStandardMaterial({
          color: 0x0a1636,
          metalness: 0.8,
          roughness: 0.2,
          wireframe: false,
          emissive: 0x00f5ff,
          emissiveIntensity: 0.4
        })
      );
      cube.position.set((i - 1.5) * 2.8, 3.8 + Math.sin(i) * 0.8, 1.0);
      group.add(cube);
      rotatingObjects.push({ mesh: cube, rx: 0.3, ry: 0.5 });

      // Wireframe overlay on container
      const wire = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 1.45, 1.45),
        new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.5 })
      );
      cube.add(wire);
    }

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     8 · SCENE 06: MENTOR LAB (IMAGE 2 — WORKSHOP & AUDITORIUM)
     --------------------------------------------------------------------- */
  function buildMentorScene() {
    const group = new THREE.Group();
    group.position.set(0, 5.2, -152);

    const loader = new THREE.TextureLoader();
    loader.load('/assets/workshop.png', texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      // Workshop Photo Aspect Ratio: 960x384 = 2.5:1 -> w = 11.0, h = 4.4
      const w = 11.0, h = 4.4;
      const screenGeo = new THREE.PlaneGeometry(w, h, 36, 16);

      // Gentle curved cylindrical projection (auditorium screen)
      const pos = screenGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -Math.pow(x / (w * 0.6), 2) * 0.9);
      }
      screenGeo.computeVertexNormals();

      const screenMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.15,
        emissive: 0x0b1a35,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide
      });

      workshopMesh = new THREE.Mesh(screenGeo, screenMat);
      workshopMesh.position.set(0, 1.5, 0);
      group.add(workshopMesh);

      // Curved Holographic Frame
      const frameGeo = new THREE.PlaneGeometry(w + 0.4, h + 0.4, 36, 16);
      const fPos = frameGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const x = fPos.getX(i);
        fPos.setZ(i, -Math.pow(x / (w * 0.6), 2) * 0.9 - 0.04);
      }
      frameGeo.computeVertexNormals();

      const frame = new THREE.Mesh(
        frameGeo,
        new THREE.MeshBasicMaterial({ color: 0x7b2ff7, wireframe: true, transparent: true, opacity: 0.45 })
      );
      frame.position.set(0, 1.5, 0);
      group.add(frame);
    });

    // Particle Dissolution Effect around screen edges
    const N = 380;
    const pos = new Float32Array(N * 3);
    const rnd = mulberry32(777);
    for (let i = 0; i < N; i++) {
      // Radiate from edges of the 11 x 4.4 display
      const edge = rnd() > 0.5 ? 1 : -1;
      pos[i * 3]     = edge * (5.0 + rnd() * 3.5);
      pos[i * 3 + 1] = (rnd() - 0.5) * 5.0 + 1.5;
      pos[i * 3 + 2] = -rnd() * 8.0;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    workshopDissolveParticles = new THREE.Points(
      partGeo,
      new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.18,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      })
    );
    group.add(workshopDissolveParticles);

    // Orbiting Floating Knowledge Badges (React, GenAI, DevOps, Next.js, Node)
    const topics = ["HTML/CSS", "React.js", "Next.js", "Generative AI", "n8n Automation", "DevOps", "Node.js", "Supabase"];
    topics.forEach((t, i) => {
      const angle = (i / topics.length) * TAU;
      const rad = 7.2;
      const kNode = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.45, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x0a1936, emissive: 0x00f5ff, emissiveIntensity: 0.5 })
      );
      kNode.position.set(Math.cos(angle) * rad, 1.5 + Math.sin(angle) * 2.2, Math.sin(angle) * 3.0);
      group.add(kNode);
      rotatingObjects.push({ mesh: kNode, rx: 0.1, ry: 0.2 });
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     9 · SCENE 07: COMPUTER SCIENCE (BEYOND THE FRAMEWORK KNOWLEDGE GRAPH)
     --------------------------------------------------------------------- */
  function buildCsScene() {
    const group = new THREE.Group();
    group.position.set(0, 6.0, -184);

    // Central "Computer Science" Core
    const csCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.4, 2),
      new THREE.MeshStandardMaterial({ color: 0x00f5ff, wireframe: true, emissive: 0x00f5ff, emissiveIntensity: 0.8 })
    );
    group.add(csCore);
    rotatingObjects.push({ mesh: csCore, rx: 0.2, ry: 0.3 });

    // Surrounding fundamental pillars (Algorithms, Data Structures, Architecture, Networking, Systems)
    const pillars = [
      { name: "Algorithms", pos: [-5.2,  2.8,  1.5] },
      { name: "Data Structures", pos: [ 5.2,  2.8,  1.5] },
      { name: "System Architecture", pos: [-4.5, -2.5, -1.0] },
      { name: "Networking Protocols", pos: [ 4.5, -2.5, -1.0] },
      { name: "Memory & Logic", pos: [ 0.0,  4.2, -2.0] }
    ];

    pillars.forEach(p => {
      const pMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9),
        new THREE.MeshBasicMaterial({ color: 0x7b2ff7, wireframe: true })
      );
      pMesh.position.set(...p.pos);
      group.add(pMesh);
      rotatingObjects.push({ mesh: pMesh, rx: 0.4, ry: 0.6 });

      // Connecting line to core
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...p.pos)]),
        new THREE.LineBasicMaterial({ color: 0x7b2ff7, transparent: true, opacity: 0.5 })
      );
      group.add(line);
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     10 · SCENE 08: PROJECT UNIVERSE (FLOATING 3D PROJECT WORLDS)
     --------------------------------------------------------------------- */
  function buildProjectsScene() {
    const group = new THREE.Group();
    group.position.set(0, 5.5, -218);

    REAL_PROJECTS.forEach((proj, i) => {
      // Arrange 6 projects in a curved arc around the camera track
      const angle = (i - 2.5) * 0.48;
      const rad = 9.5;
      const px = Math.sin(angle) * rad;
      const pz = (Math.cos(angle) - 1.0) * rad + (i % 2 === 0 ? 2 : -2);
      const py = (i % 2 === 0 ? 1 : -1) * 1.4;

      const pGroup = new THREE.Group();
      pGroup.position.set(px, py, pz);

      // Holographic card texture
      const cardCanvas = texProjectCard(proj.title, proj.category, proj.color);
      const cardTex = tex(cardCanvas);
      const cardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 2.25),
        new THREE.MeshBasicMaterial({ map: cardTex, side: THREE.DoubleSide })
      );
      pGroup.add(cardMesh);

      // Glowing rim
      const rim = new THREE.Mesh(
        new THREE.PlaneGeometry(3.75, 2.4),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(proj.color), wireframe: true, transparent: true, opacity: 0.6 })
      );
      pGroup.add(rim);

      cardMesh.userData = { isInteractive: true, project: proj };
      interactiveNodes.push(cardMesh);

      pGroup.lookAt(0, 0, 8); // face inward toward camera trajectory
      group.add(pGroup);
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     11 · SCENE 09: TECHNOLOGY CONSTELLATION (SKILLS STAR CLUSTERS)
     --------------------------------------------------------------------- */
  function buildConstellationScene() {
    const group = new THREE.Group();
    group.position.set(0, 7.0, -254);

    const categories = [
      { name: "Frontend", color: 0x00f5ff, cx: -6, cy:  2, cz: 0 },
      { name: "Backend",  color: 0x7b2ff7, cx:  6, cy:  2, cz: 0 },
      { name: "Database", color: 0x00ffcc, cx: -5, cy: -3, cz: 1 },
      { name: "AI & GenAI",color: 0xff4d9d, cx:  5, cy: -3, cz: 1 },
      { name: "DevOps",   color: 0xffaa00, cx:  0, cy:  4, cz: -2 }
    ];

    categories.forEach(cat => {
      // Cluster stars
      const count = 14;
      const pts = [];
      const rnd = mulberry32(cat.cx * 100 + 42);
      for (let j = 0; j < count; j++) {
        const star = new THREE.Vector3(
          cat.cx + (rnd() - 0.5) * 3.5,
          cat.cy + (rnd() - 0.5) * 3.5,
          cat.cz + (rnd() - 0.5) * 3.5
        );
        pts.push(star);

        const starMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshBasicMaterial({ color: cat.color })
        );
        starMesh.position.copy(star);
        group.add(starMesh);
      }

      // Constellation lines connecting stars in cluster
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: cat.color, transparent: true, opacity: 0.35 });
      group.add(new THREE.Line(lineGeo, lineMat));
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     12 · SCENE 10: MY PHILOSOPHY (REAPPEARANCE OF PORTRAIT 1 SILHOUETTE)
     --------------------------------------------------------------------- */
  function buildPhilosophyScene() {
    const group = new THREE.Group();
    group.position.set(0, 4.8, -286);

    // Portrait reappears with soft ethereal backlit treatment
    const loader = new THREE.TextureLoader();
    loader.load('/assets/portrait.png', texture => {
      const w = 3.6, h = 4.8;
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.2,
        color: 0x4466aa,
        emissive: 0x050c18,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85
      });
      philosophyPortrait = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      group.add(philosophyPortrait);

      // Backlight halo
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(2.6, 3.8, 36),
        new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending })
      );
      halo.position.z = -0.15;
      group.add(halo);
    });

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     13 · SCENE 11: DIGITAL HORIZON (CONVERGING DATA STREAMS & PORTAL)
     --------------------------------------------------------------------- */
  function buildHorizonScene() {
    const group = new THREE.Group();
    group.position.set(0, 6.0, -332);

    // Giant Gateway Ring
    const gateGeo = new THREE.TorusGeometry(8.5, 0.45, 16, 64);
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1
    });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    group.add(gate);
    rotatingObjects.push({ mesh: gate, rx: 0, ry: 0, rz: 0.15 });

    // Inner glowing destination disk
    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(8.2, 48),
      new THREE.MeshBasicMaterial({
        color: 0x050f28,
        transparent: true,
        opacity: 0.85
      })
    );
    group.add(disk);

    // Converging streams of data rays
    const N = 18;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * TAU;
      const r = 16.0;
      const p1 = new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 30.0);
      const p2 = new THREE.Vector3(Math.cos(angle) * 7.5, Math.sin(angle) * 7.5, 0);

      const rayGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const rayMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00f5ff : 0x7b2ff7,
        transparent: true,
        opacity: 0.4
      });
      group.add(new THREE.Line(rayGeo, rayMat));
    }

    scene.add(group);
  }

  /* ---------------------------------------------------------------------
     14 · INTERACTIVE CURSOR WISPS & ATMOSPHERE
     --------------------------------------------------------------------- */
  function buildAtmosphere() {
    const hazeTex = tex(texGlow('rgba(0,245,255,0.4)', 'rgba(123,47,247,0.1)'));
    const rnd = mulberry32(99);
    for (let i = 0; i < 12; i++) {
      const s = 16 + rnd() * 24;
      const h = new THREE.Mesh(
        new THREE.PlaneGeometry(s, s * 0.6),
        new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.08 + rnd() * 0.08 })
      );
      h.position.set((rnd() - 0.5) * 60, 2 + rnd() * 18, -20 - i * 26);
      h.userData = { sp: 0.04 + rnd() * 0.08, ph: rnd() * TAU, x0: h.position.x };
      scene.add(h);
      WORLD.haze.push(h);
    }

    // Floating global embers
    const N = 500, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (rnd() - 0.5) * 50;
      pos[i * 3 + 1] = rnd() * 22;
      pos[i * 3 + 2] = 20 - rnd() * 360;
      seed[i] = rnd();
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    eg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    const embers = new THREE.Points(
      eg,
      new THREE.ShaderMaterial({
        uniforms: { uT: uT, uTex: { value: tex(texGlow('rgba(0,245,255,1)', 'rgba(123,47,247,0.4)')) }, uPx: { value: vpH() } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: `
          attribute float aSeed; uniform float uT; uniform float uPx; varying float vA;
          void main() {
            vec3 p = position;
            p.y += sin(uT * 0.8 + aSeed * 6.28) * 0.8;
            p.x += cos(uT * 0.5 + aSeed * 4.0) * 0.5;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (10.0 + aSeed * 14.0) * (uPx / 820.0) / max(-mv.z, 0.4);
            gl_Position = projectionMatrix * mv;
            vA = 0.3 + 0.7 * sin(uT * 1.4 + aSeed * 11.0);
          }`,
        fragmentShader: `
          uniform sampler2D uTex; varying float vA;
          void main() { vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a * vA); }`
      })
    );
    scene.add(embers);
  }

  function buildWisps() {
    const N = 80;
    WISPS.pos = new Float32Array(N * 3);
    WISPS.aA  = new Float32Array(N);
    WISPS.aS  = new Float32Array(N);
    for (let i = 0; i < N; i++) WISPS.list.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1 });

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(WISPS.pos, 3));
    g.setAttribute('aA', new THREE.BufferAttribute(WISPS.aA, 1));
    g.setAttribute('aS', new THREE.BufferAttribute(WISPS.aS, 1));
    WISPS.geom = g;

    WISPS.pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: { uTex: { value: tex(texWisp()) }, uPx: { value: vpH() } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: `
          attribute float aA; attribute float aS; uniform float uPx; varying float vA;
          void main() { vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uPx * aS / max(-mv.z, 0.4); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
          uniform sampler2D uTex; varying float vA;
          void main() { if(vA <= 0.0) discard; vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a * vA); }`
      })
    );
    WISPS.pts.frustumCulled = false;
    WISPS.pts.renderOrder = 10;
    scene.add(WISPS.pts);
  }

  function emitWisp(nx, ny) {
    const w = WISPS.list[WISPS.next];
    WISPS.next = (WISPS.next + 1) % WISPS.list.length;
    const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
    const p = camera.position.clone().addScaledVector(v, 4.0);
    w.x = p.x; w.y = p.y; w.z = p.z;
    w.vx = (Math.random() - 0.5) * 0.9;
    w.vy = (Math.random() - 0.5) * 0.9;
    w.vz = (Math.random() - 0.5) * 0.9;
    w.life = 1.0;
    w.max = 0.8 + Math.random() * 0.6;
  }

  function updateWisps(dt) {
    const { list, pos, aA, aS, geom } = WISPS;
    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      if (w.life > 0) {
        w.life -= dt / w.max;
        w.x += w.vx * dt; w.y += w.vy * dt; w.z += w.vz * dt;
        pos[i * 3]     = w.x;
        pos[i * 3 + 1] = w.y;
        pos[i * 3 + 2] = w.z;
        aA[i] = Math.max(0, w.life);
        aS[i] = 0.06 * Math.sin(w.life * Math.PI);
      } else {
        aA[i] = 0;
      }
    }
    geom.attributes.position.needsUpdate = true;
    geom.attributes.aA.needsUpdate = true;
    geom.attributes.aS.needsUpdate = true;
  }

  /* ---------------------------------------------------------------------
     15 · INITIALIZE WEBGL & RENDER LOOP
     --------------------------------------------------------------------- */
  function initGL() {
    const canvas = document.getElementById('gl');
    renderer = new THREE.WebGLRenderer({ canvas, powerPreference: 'high-performance', antialias: false, alpha: false });
    renderer.setPixelRatio(dpr());
    renderer.setSize(vpW(), vpH());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);
    scene.fog = new THREE.FogExp2(0x050814, 0.015);

    camera = new THREE.PerspectiveCamera(40, vpW() / vpH(), 0.3, 380);
    clock  = new THREE.Clock();

    _p = new THREE.Vector3();
    _t = new THREE.Vector3();
    _d = new THREE.Vector3();
    raycaster = new THREE.Raycaster();
    mouseNorm = new THREE.Vector2();

    buildLights();
    buildGlobalEnvironment();
    buildHeroScene();
    buildBannerScene();
    buildDeveloperScene();
    buildAiScene();
    buildAutomationScene();
    buildDevopsScene();
    buildMentorScene();
    buildCsScene();
    buildProjectsScene();
    buildConstellationScene();
    buildPhilosophyScene();
    buildHorizonScene();
    buildAtmosphere();
    buildWisps();
    buildRig();
  }

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 0.1);
    uT.value += dt;

    // Pulse core — slow cinematic speed
    if (WORLD.core) WORLD.core.rotation.y += dt * 0.06;
    if (WORLD.coreRing1) WORLD.coreRing1.rotation.z -= dt * 0.08;
    if (WORLD.coreRing2) WORLD.coreRing2.rotation.x += dt * 0.05;

    // Rotate rotating meshes — slowed for cinematic feel
    rotatingObjects.forEach(item => {
      if (item.rx) item.mesh.rotation.x += dt * item.rx * 0.45;
      if (item.ry) item.mesh.rotation.y += dt * item.ry * 0.45;
      if (item.rz) item.mesh.rotation.z += dt * item.rz * 0.45;
    });

    // Update automation traveling pulses
    pulsePackets.forEach(p => {
      p.userData.progress += dt * p.userData.speed;
      if (p.userData.progress > 1) p.userData.progress = 0;
      p.position.lerpVectors(p.userData.p1, p.userData.p2, p.userData.progress);
    });

    // Drift haze planes
    WORLD.haze.forEach(h => {
      h.position.x = h.userData.x0 + Math.sin(uT.value * h.userData.sp + h.userData.ph) * 3.5;
    });

    // Shimmer workshop particles
    if (workshopDissolveParticles) {
      workshopDissolveParticles.rotation.y += dt * 0.05;
    }

    updateWisps(dt);

    // -----------------------------------------------------------------------
    // CAMERA PROGRESSION
    //
    // Two modes:
    //   A) Nav-click fly-to: RIG.targetProg is set; camera glides to chapter.
    //      Once arrived, we clear targetProg and let scroll take over.
    //   B) Scroll-driven: camera smoothly follows RIG.prog (set by setProgress).
    //
    // The key insight: lerp factor must be gentle (~2x per second) so each
    // scroll section is individually visible rather than rushed past.
    // -----------------------------------------------------------------------
    if (RIG.targetProg !== null) {
      // Nav-click: cinematic glide to exact chapter index
      RIG.smooth = lerp(RIG.smooth, RIG.targetProg, clamp(dt * 2.0, 0, 1));
      if (Math.abs(RIG.smooth - RIG.targetProg) < 0.002) {
        RIG.smooth = RIG.targetProg;
        RIG.targetProg = null;
      }
    } else {
      // Scroll-driven: gentle follow — alpha ~1.4 means ~75% of the way
      // in one second, which feels smooth but not instant.
      RIG.smooth = lerp(RIG.smooth, RIG.prog, clamp(dt * 1.4, 0, 1));
    }

    RIG.mx = lerp(RIG.mx, RIG.tmx, clamp(dt * 2.2, 0, 1));
    RIG.my = lerp(RIG.my, RIG.tmy, clamp(dt * 2.2, 0, 1));

    applyCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  }

  function onResize() {
    if (!renderer || !camera) return;
    renderer.setSize(vpW(), vpH());
    renderer.setPixelRatio(dpr());
    camera.aspect = vpW() / vpH();
    camera.updateProjectionMatrix();
  }

  function setProgress(val) {
    // Clamp to valid range
    RIG.prog = Math.min(Math.max(val, 0), WAYPOINTS.length - 1);
  }

  function flyToChapter(index) {
    const target = Math.min(Math.max(index, 0), WAYPOINTS.length - 1);
    RIG.targetProg = target;
    // Also update prog so if user stops scrolling after nav click,
    // scroll-driven camera won't fight back to the wrong position.
    RIG.prog = target;
  }

  function setPointer(nx, ny) {
    RIG.tmx = nx;
    RIG.tmy = ny;
    if (Math.random() < 0.42) emitWisp(nx, ny);
  }

  function triggerIntro() {
    const t0 = performance.now();
    const intro = now => {
      const el = (now - t0) / 1800;
      RIG.intro = smooth(0, 1, clamp(el, 0, 1));
      if (el < 1) requestAnimationFrame(intro);
    };
    requestAnimationFrame(intro);
  }

  // Public interface
  return {
    initGL,
    renderFrame,
    onResize,
    setProgress,
    flyToChapter,
    setPointer,
    triggerIntro,
    getSmoothProgress: () => RIG.smooth
  };
}
