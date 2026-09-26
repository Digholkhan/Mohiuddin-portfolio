/* =====================================================================
   MD MOHIUDDIN — CINEMATIC 3D DIGITAL UNIVERSE MAIN ENTRY POINT
   DOM Wiring, Audio Synthesizer, 3D Engine Initialization & Synchronization
   ===================================================================== */

import { createEngine } from './3d/engine.js';
import { audio } from './utils/audio.js';
import { REAL_PROJECTS, CHAPTERS } from './data/portfolioData.js';
import { mulberry32 } from './3d/textures.js';

(function () {
  'use strict';

  let engine = null;
  let sections = [];
  let anchors = [];
  let maxScroll = 1;

  const CHAPTER_COLORS = [
    '#00f5ff', // 01 Genesis
    '#38bdf8', // 02 Builder
    '#b347ff', // 03 AI Core
    '#00ffaa', // 04 Automation
    '#ff9f1c', // 05 DevOps
    '#ff2a85', // 06 Mentor Lab
    '#10b981', // 07 CS
    '#60a5fa', // 08 Projects
    '#a78bfa', // 09 Constellation
    '#fb7185', // 10 Philosophy
    '#00f5ff'  // 11 Horizon
  ];

  /* Viewport measurements */
  function measure() {
    sections = Array.from(document.querySelectorAll('.chapter-section'));
    if (!sections.length) return;

    maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);

    anchors = sections.map((el, i) => {
      if (i === 0) return 0;
      if (i === sections.length - 1) return maxScroll;
      // Target scroll position centers the chapter section nicely in the viewport
      const target = el.offsetTop + (el.offsetHeight * 0.5) - (window.innerHeight * 0.5);
      return Math.min(Math.max(target, 0), maxScroll);
    });

    // Ensure strictly increasing anchor values
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i] <= anchors[i - 1]) {
        anchors[i] = anchors[i - 1] + 20;
      }
    }
    // Make sure the last anchor is at maxScroll
    anchors[anchors.length - 1] = maxScroll;
    for (let i = anchors.length - 2; i >= 0; i--) {
      if (anchors[i] >= anchors[i + 1]) {
        anchors[i] = Math.max(0, anchors[i + 1] - 20);
      }
    }
  }

  function getScrollProgress(scrollY) {
    if (!anchors || anchors.length !== sections.length || maxScroll <= 10) {
      measure();
    }
    if (scrollY <= anchors[0]) return 0;
    const lastIdx = anchors.length - 1;
    if (scrollY >= anchors[lastIdx]) return lastIdx;

    for (let i = 0; i < lastIdx; i++) {
      if (scrollY <= anchors[i + 1]) {
        const segLen = anchors[i + 1] - anchors[i];
        if (segLen <= 0) return i;
        return i + (scrollY - anchors[i]) / segLen;
      }
    }
    return lastIdx;
  }

  /* 1. Procedural Film Grain Noise */
  function initGrain() {
    const S = 180;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    const d = ctx.createImageData(S, S);
    const p = d.data;
    const rnd = mulberry32(101);
    for (let i = 0; i < S * S * 4; i += 4) {
      const g = (rnd() * 255) | 0;
      p[i] = p[i + 1] = p[i + 2] = g;
      p[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    const el = document.getElementById('grain');
    if (el) el.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
  }

  /* 2. Populate Real Projects in Chapter 08 */
  function renderProjects() {
    const container = document.getElementById('projects-carousel');
    if (!container) return;

    container.innerHTML = REAL_PROJECTS.map((p, idx) => `
      <div class="p-card" style="--p-color: ${p.color}" data-project-id="${p.id}">
        <div>
          <div class="p-tag">${p.tag.toUpperCase()}</div>
          <h3 class="p-title">${p.title}</h3>
          <p class="p-desc">${p.description}</p>
        </div>
        <div>
          <div class="p-stack">
            ${p.tech.map(t => `<span>${t}</span>`).join('')}
          </div>
          <div class="p-actions">
            <button class="btn btn-primary p-btn open-proj-btn" data-project-idx="${idx}">
              <span>DETAILS & DEMO</span>
            </button>
            <a href="${p.github}" target="_blank" rel="noopener" class="btn btn-secondary p-btn" title="View Source on GitHub">
              <span>GITHUB</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Wire project detail modal
    document.querySelectorAll('.open-proj-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-project-idx'), 10);
        openProjectModal(REAL_PROJECTS[idx]);
      });
    });

    document.querySelectorAll('.p-card').forEach((card, idx) => {
      card.addEventListener('click', () => {
        openProjectModal(REAL_PROJECTS[idx]);
      });
    });
  }

  /* 3. Project Detail Modal */
  function openProjectModal(p) {
    audio.playClick();
    const modal = document.getElementById('project-modal');
    if (!modal || !p) return;

    document.getElementById('pm-badge').textContent = p.tag.toUpperCase();
    document.getElementById('pm-title').textContent = p.title;
    document.getElementById('pm-desc').textContent = p.description;
    document.getElementById('pm-live-btn').href = p.live;
    document.getElementById('pm-git-btn').href = p.github;

    const list = document.getElementById('pm-highlights-list');
    list.innerHTML = p.highlights.map(h => `<li>${h}</li>`).join('');

    const stack = document.getElementById('pm-tech-stack');
    stack.innerHTML = p.tech.map(t => `<span>${t}</span>`).join('');

    modal.classList.add('open');
  }

  function closeProjectModal() {
    audio.playClick();
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.remove('open');
  }

  /* 4. Intersection Observer for Chapter Reveals */
  function wireReveals() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('rv-in');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));
  }

  /* 5. Navigation, Smooth Camera Flights & HUD */
  function wireNavigation() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobile-menu');
    const navButtons = document.querySelectorAll('[data-nav]');
    const hudIdx = document.getElementById('hud-idx');
    const hudName = document.getElementById('hud-name');
    const hudFill = document.getElementById('hud-fill');

    function updateHUDAndNav(prog) {
      // Map prog (0 to 11) to chapter index (0 to 10)
      // When at intro (prog < 1.2), curIdx = 0 (Chapter 01: Genesis)
      // When at hero (prog ~ 1), curIdx = 0 (Chapter 01: Genesis)
      // When at builder (prog ~ 2), curIdx = 1 (Chapter 02: Builder), etc.
      const curIdx = prog < 1.2 ? 0 : Math.min(Math.max(Math.round(prog) - 1, 0), CHAPTERS.length - 1);
      const chapter = CHAPTERS[curIdx];
      const accent = CHAPTER_COLORS[curIdx] || '#00f5ff';

      // Dynamic chapter accent color
      document.documentElement.style.setProperty('--chapter-accent', accent);

      // Update Nav buttons (desktop)
      document.querySelectorAll('.nav-link').forEach((b, i) => {
        b.classList.toggle('on', i === curIdx);
      });

      // Update Mobile Nav buttons
      document.querySelectorAll('.m-link').forEach((b, i) => {
        b.classList.toggle('on', i === curIdx);
      });

      // Update HUD tracker
      if (hudIdx) hudIdx.textContent = `CHAPTER ${String(curIdx + 1).padStart(2, '0')} / 11`;
      if (hudName) hudName.textContent = chapter.title.split('//')[1]?.trim() || chapter.label.toUpperCase();
      const totalSteps = Math.max(sections.length - 1, 1);
      if (hudFill) hudFill.style.width = `${Math.min(Math.max(prog / totalSteps, 0), 1) * 100}%`;
    }

    // Scroll listener updates HUD & 3D camera
    window.addEventListener('scroll', () => {
      const sy = window.scrollY || 0;
      nav.classList.toggle('stuck', sy > 40);

      const prog = getScrollProgress(sy);
      if (engine) engine.setProgress(prog);

      updateHUDAndNav(prog);
    }, { passive: true });

    // Handle clicks on any navigation element
    navButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const targetIdx = parseInt(btn.getAttribute('data-nav'), 10);
        if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= CHAPTERS.length) return;

        audio.playTransition();

        // Close mobile menu if open
        if (mobileMenu) {
          mobileMenu.classList.remove('open');
          if (burger) burger.innerHTML = '<i></i><i></i>';
        }

        measure();
        // targetIdx 0 is Genesis (#hero, which is sections[1])
        // targetIdx >= 1 is section targetIdx + 1
        const sectionIdx = targetIdx === 0 ? 1 : targetIdx + 1;
        const targetY = anchors[sectionIdx] !== undefined ? anchors[sectionIdx] : 0;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });

        if (engine) {
          engine.flyToChapter(sectionIdx);
        }
      });
    });

    // Clicking brand logo scrolls to intro
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (engine) engine.flyToChapter(0);
      });
    }

    // Mobile burger toggle
    burger.addEventListener('click', () => {
      audio.playClick();
      const open = mobileMenu.classList.toggle('open');
      burger.innerHTML = open
        ? '<i style="top:15px;transform:rotate(45deg);width:22px"></i><i style="top:15px;transform:rotate(-45deg);width:22px"></i>'
        : '<i></i><i></i>';
    });

    // Audio synthesizer toggle button
    const audioBtn = document.getElementById('audio-toggle');
    const audioLabel = document.getElementById('audio-label');
    audioBtn.addEventListener('click', () => {
      const isOn = audio.toggle();
      audioBtn.classList.toggle('active', isOn);
      audioLabel.textContent = isOn ? 'AUDIO: ACTIVE' : 'AUDIO: OFF';
    });

    // Hover audio on buttons
    document.querySelectorAll('button, a, .p-card, .tech-card').forEach(el => {
      el.addEventListener('mouseenter', () => audio.playHover());
    });
  }

  /* 6. Mouse Tracking & Cursor Wisps */
  function wireMouse() {
    window.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      if (engine) engine.setPointer(nx, ny);
    }, { passive: true });
  }

  /* 7. Contact Console Form */
  function wireContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      audio.playClick();
      status.style.display = 'block';
      status.style.color = 'var(--cyan)';
      status.textContent = 'TRANSMITTING ENCRYPTED PAYLOAD ACROSS SECURE WEBSOCKET...';

      setTimeout(() => {
        audio.playBeep(1046.5, 0.25, 0.1); // High C confirmation beep
        status.style.color = 'var(--emerald)';
        status.textContent = '✓ TRANSMISSION CONFIRMED // MD MOHIUDDIN ACKNOWLEDGED.';
        form.reset();
      }, 1300);
    });
  }

  /* 8. Preloader & Cinematic Intro */
  function bootPreloader() {
    const fill = document.getElementById('pre-fill');
    const pct = document.getElementById('pre-pct');
    const pre = document.getElementById('pre');
    let loaded = 0;

    const iv = setInterval(() => {
      loaded += (Math.random() * 18 + 12) | 0;
      if (loaded > 100) loaded = 100;
      if (fill) fill.style.right = `${100 - loaded}%`;
      if (pct) pct.textContent = `${loaded}%`;

      if (loaded === 100) {
        clearInterval(iv);
        setTimeout(() => {
          pre.classList.add('done');
          document.body.classList.remove('is-locked');
          measure();
          const sy = window.scrollY || 0;
          const prog = getScrollProgress(sy);
          if (engine) engine.setProgress(prog);

          // Reveal hero section immediately
          document.querySelector('#hero [data-rv]')?.classList.add('rv-in');

          if (engine) engine.triggerIntro();
        }, 360);
      }
    }, 45);
  }

  /* 9. Init Entry Point */
  function init() {
    initGrain();
    renderProjects();
    wireReveals();
    wireNavigation();
    wireMouse();
    wireContactForm();
    measure();

    // Wire modal close handlers
    document.getElementById('pm-close')?.addEventListener('click', closeProjectModal);
    document.getElementById('pm-backdrop')?.addEventListener('click', closeProjectModal);
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeProjectModal();
    });

    window.addEventListener('resize', () => {
      measure();
      if (engine) engine.onResize();
    }, { passive: true });

    window.addEventListener('load', () => {
      measure();
      const sy = window.scrollY || 0;
      if (engine) engine.setProgress(getScrollProgress(sy));
    });

    // Start preloader immediately
    bootPreloader();

    // Initialize 3D Engine
    try {
      engine = createEngine();
      if (engine) {
        engine.initGL();
        requestAnimationFrame(engine.renderFrame);
      }
    } catch (err) {
      console.error('[Portfolio] 3D Engine initialization failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
