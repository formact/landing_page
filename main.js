/**
 * FORMACT — AAA Game Landing Page
 * Core JavaScript Logic: Web Audio Synthesizer, 3D Procedural Canvas Visualizers,
 * Three.js GLTF 3D Viewer (model.glb), Interactive Forge Code Editor, Telemetry Engine.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. WEB AUDIO API SYNTHESIZER (Zero-dependency Cyber SFX)
// ==========================================================================
class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'hover':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.04);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
        break;

      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'tactical':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.setValueAtTime(900, t + 0.03);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'compile':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.28);
        break;

      case 'deploy':
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(160, t);
        sub.frequency.exponentialRampToValueAtTime(40, t + 0.6);
        subGain.gain.setValueAtTime(0.3, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(t);
        sub.stop(t + 0.6);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t + 0.1);
        osc.frequency.setValueAtTime(1200, t + 0.2);
        gain.gain.setValueAtTime(0.08, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t + 0.1);
        osc.stop(t + 0.5);
        break;
    }
  }
}

const sfx = new CyberAudioEngine();

// ==========================================================================
// 2. AMBIENT PARTICLES CANVAS
// ==========================================================================
function initAmbientParticles() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00e5ff';
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ==========================================================================
// 3. PROCEDURAL 3D WIREFRAME CANVASES (Phase Arm)
// ==========================================================================
function initPhaseArmCanvas() {
  const canvas = document.getElementById('phase-arm-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    angle += 0.015;

    ctx.save();
    ctx.translate(cx, cy);

    for (let r = 25; r <= 85; r += 20) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.4, angle + r * 0.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.8 - r * 0.006})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
}

// ==========================================================================
// 4. THREE.JS 3D GLTF VIEWPORT FOR model.glb
// ==========================================================================
function initModelGLBViewer() {
  const canvas = document.getElementById('forge-3d-canvas');
  const loaderEl = document.getElementById('forge-3d-loader');
  const fallbackImg = document.getElementById('forge-hammer-img');
  const viewport = document.getElementById('forge-viewport-center');

  if (!canvas || !viewport) return null;

  const colorHexMap = {
    cyan: 0x00e5ff,
    orange: 0xff7043,
    frost: 0x5cd9ff,
    green: 0x33f266
  };

  let scene, camera, renderer, controls, loadedModel;
  let keyLight, accentLight, pointLight;

  try {
    scene = new THREE.Scene();

    const rect = viewport.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 350;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableZoom = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 8.0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    keyLight = new THREE.DirectionalLight(colorHexMap.cyan, 2.8);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-4, -2, -4);
    scene.add(fillLight);

    accentLight = new THREE.DirectionalLight(colorHexMap.cyan, 2.0);
    accentLight.position.set(0, -3, 3);
    scene.add(accentLight);

    pointLight = new THREE.PointLight(colorHexMap.cyan, 4.0, 6);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const loader = new GLTFLoader();
    const modelPath = 'model.glb';

    loader.load(
      modelPath,
      (gltf) => {
        loadedModel = gltf.scene;

        // Wrapper group to guarantee 100% perfect geometric centering
        const wrapper = new THREE.Group();

        // Compute bounding box of GLTF mesh
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Center loadedModel inside wrapper
        loadedModel.position.set(-center.x, -center.y, -center.z);
        wrapper.add(loadedModel);

        // Scale wrapper intelligently to fit viewport
        const targetSize = 2.4;
        const scale = targetSize / (maxDim || 1);
        wrapper.scale.set(scale, scale, scale);

        // Position wrapper at scene origin
        wrapper.position.set(0, 0, 0);

        // Angle rotation to match the cinematic Arc Maul pose
        wrapper.rotation.set(0.2, -Math.PI / 4, 0.35);

        scene.add(wrapper);

        // Ensure controls target is centered at (0,0,0)
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }

        if (camera) {
          camera.position.set(0, 0.2, 3.8);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }

        if (loaderEl) {
          loaderEl.style.opacity = '0';
          setTimeout(() => { loaderEl.style.display = 'none'; }, 400);
        }
        if (fallbackImg) fallbackImg.style.opacity = '0';
      },
      (xhr) => {
        if (xhr.lengthComputable && loaderEl) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          const txt = loaderEl.querySelector('.loader-text');
          if (txt) txt.textContent = `LOADING 3D MODEL (${percent}%)`;
        }
      },
      (err) => {
        console.warn('GLTF loading fallback:', err);
        if (loaderEl) loaderEl.style.display = 'none';
        if (fallbackImg) fallbackImg.style.opacity = '1';
      }
    );

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      if (loadedModel) {
        loadedModel.position.y = Math.sin(Date.now() * 0.0015) * 0.05;
      }
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const r = viewport.getBoundingClientRect();
      if (r.width && r.height) {
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        renderer.setSize(r.width, r.height);
      }
    });
  } catch (e) {
    console.warn('Three.js failed:', e);
    if (fallbackImg) fallbackImg.style.opacity = '1';
    if (loaderEl) loaderEl.style.display = 'none';
  }

  return {
    setColor: (color) => {
      const hex = colorHexMap[color] || colorHexMap.cyan;
      if (keyLight) keyLight.color.setHex(hex);
      if (accentLight) accentLight.color.setHex(hex);
      if (pointLight) pointLight.color.setHex(hex);

      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child.isMesh && child.material) {
            if (child.material.emissive) {
              child.material.emissive.setHex(hex);
              child.material.emissiveIntensity = 0.5;
            }
          }
        });
      }
    }
  };
}

// ==========================================================================
// 5. INTERACTIVE SECTION 4 CODE EDITOR & PLACEHOLDER CODE (Matching section4.png)
// ==========================================================================
const forgeFiles = {
  weapon: `// FORMACT WEAPON CONFIGURATION
// Tweak the values and see the changes in real-time

const weapon = {
  name: "Arc Maul",
  type: "melee",
  damage: 85,       // base damage
  range: 3.2,       // meters
  cooldown: 1.4,    // seconds
  weight: 12.0,     // kg
  element: "energy", // energy | kinetic | frost | plasma
  color: "cyan",     // cyan | orange | green | frost
  special: {
    shockwave: true,
    stunChance: 0.18
  }
};

// Advanced (optional)
weapon.trailIntensity = 0.8;
weapon.glow = true;
weapon.particles = "arc";`,

  abilities: `// FORMACT ABILITY MODULE
// Modify ability parameters to calibrate combat skills

const ability = {
  name: "Vortex Slam",
  type: "kinetic_burst",
  damage: 92,        // burst damage
  radius: 4.5,       // meters
  cooldown: 1.1,     // seconds
  energyCost: 35,    // energy units
  statusEffect: "EMP_CRUSH"
};

ability.execute = function(arena) {
  arena.shockwave(this.radius, this.damage);
};`,

  defense: `// FORMACT DEFENSE SPECIFICATION
// Configure squad barrier & damage mitigation

const defense = {
  type: "Aegis Matrix",
  capacity: 450,     // shield HP
  mitigation: 0.60,  // damage reduction %
  rechargeRate: 15,  // shield/sec
  autoReflect: true
};`
};

function setupInteractiveForgeEditor(onColorChange, onStatsChange) {
  const textarea = document.getElementById('forge-code-textarea');
  const codeContent = document.getElementById('forge-code-content');
  const gutter = document.getElementById('forge-gutter');
  const tabBtns = document.querySelectorAll('.forge-tab-btn[data-file]');

  if (!textarea || !codeContent) return;

  let activeFile = 'weapon';

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightSyntax(code) {
    const escaped = escapeHTML(code);
    return escaped
      .replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>')
      .replace(/(".*?")/g, '<span class="code-str">$1</span>')
      .replace(/\b(const|let|var|function|return|new|class|this|if|else)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/([a-zA-Z0-9_]+)\s*:/g, '<span class="code-key">$1</span>:')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-num">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="code-bool">$1</span>');
  }

  function updateEditor() {
    const val = textarea.value;
    forgeFiles[activeFile] = val;

    const lines = val.split('\n');
    let gutterHTML = '';
    for (let i = 1; i <= lines.length; i++) {
      gutterHTML += `<span>${i}</span>`;
    }
    if (gutter) gutter.innerHTML = gutterHTML;

    codeContent.innerHTML = highlightSyntax(val);
    codeContent.parentElement.scrollTop = textarea.scrollTop;

    parseStatsFromCode(val);
  }

  function parseStatsFromCode(code) {
    const dMatch = code.match(/damage\s*:\s*(\d+(?:\.\d+)?)/);
    const rMatch = code.match(/range\s*:\s*(\d+(?:\.\d+)?)/) || code.match(/radius\s*:\s*(\d+(?:\.\d+)?)/);
    const cMatch = code.match(/cooldown\s*:\s*(\d+(?:\.\d+)?)/);
    const wMatch = code.match(/weight\s*:\s*(\d+(?:\.\d+)?)/);
    const colMatch = code.match(/color\s*:\s*"([^"]+)"/);

    const stats = {};
    if (dMatch) stats.damage = parseFloat(dMatch[1]);
    if (rMatch) stats.range = parseFloat(rMatch[1]);
    if (cMatch) stats.cooldown = parseFloat(cMatch[1]);
    if (wMatch) stats.weight = parseFloat(wMatch[1]);

    if (onStatsChange) onStatsChange(stats);

    if (colMatch && onColorChange) {
      const color = colMatch[1].toLowerCase();
      if (['cyan', 'orange', 'frost', 'green'].includes(color)) {
        onColorChange(color, false);
      }
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.play('click');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabBtns.forEach(b => {
        const line = b.querySelector('.tab-glow-line');
        if (line) line.remove();
      });
      const glowLine = document.createElement('span');
      glowLine.className = 'tab-glow-line';
      btn.appendChild(glowLine);

      activeFile = btn.getAttribute('data-file');
      textarea.value = forgeFiles[activeFile] || '';
      updateEditor();
    });
  });

  textarea.addEventListener('input', updateEditor);
  textarea.addEventListener('scroll', () => {
    if (codeContent.parentElement) {
      codeContent.parentElement.scrollTop = textarea.scrollTop;
      codeContent.parentElement.scrollLeft = textarea.scrollLeft;
    }
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      updateEditor();
    }
  });

  textarea.value = forgeFiles[activeFile];
  updateEditor();

  return {
    updateColorInCode: (color) => {
      let code = textarea.value;
      if (code.includes('color:')) {
        code = code.replace(/color\s*:\s*"[^"]+"/, `color: "${color}"`);
        textarea.value = code;
        updateEditor();
      }
    }
  };
}

// ==========================================================================
// 6. OPERATIVES SHOWCASE DATA
// ==========================================================================
const rolesData = [
  {
    name: "PHASE ARM",
    desc: "Frontline Kinetic Enforcer specializing in close-quarters devastation and barrier disruption.",
    opCode: "OP-01 // FIGHTER",
    tagline: "SMASH. BREAK. DOMINATE.",
    ability: "Kinetic Slam",
    stats: { damage: 95, range: 40, cooldown: 65, utility: 50 },
    codeSnippet: `<span class="code-comment">// New ability injected in real-time</span>
squad.<span class="code-fn">injectKineticSlam</span>({
  damage: <span class="code-num">95.0</span>,
  radius: <span class="code-num">3.5</span>,
  shieldPierce: <span class="code-bool">true</span>
});`
  },
  {
    name: "MUNITIONIST",
    desc: "Long-range ballistics and elemental energy routing specialist.",
    opCode: "OP-02 // WEAPONS",
    tagline: "CALIBRATE. OVERCLOCK. DESTROY.",
    ability: "Hyper Velocity Rail",
    stats: { damage: 90, range: 95, cooldown: 40, utility: 60 },
    codeSnippet: `<span class="code-comment">// Munitions optimization routine</span>
weapon.<span class="code-fn">setParticleVelocity</span>(<span class="code-num">3200</span>);
weapon.<span class="code-fn">addThermalMod</span>(<span class="code-num">45.0</span>);`
  },
  {
    name: "SINGULARITY",
    desc: "Gravitational field manipulation and spatial crowd control operative.",
    opCode: "OP-03 // ABILITY",
    tagline: "BEND REALITY. CONTROL THE VOID.",
    ability: "Vortex Field",
    stats: { damage: 70, range: 80, cooldown: 85, utility: 95 },
    codeSnippet: `<span class="code-comment">// Quantum vortex gravity field</span>
arena.<span class="code-fn">spawnGravitonCore</span>({
  pullRadius: <span class="code-num">12.0</span>,
  durationSec: <span class="code-num">4.5</span>
});`
  },
  {
    name: "VOID SHIELD",
    desc: "Defensive Matrix Engineer deploying adaptive energy barriers.",
    opCode: "OP-04 // DEFENSE",
    tagline: "HOLD THE LINE. ABSORB THE IMPACT.",
    ability: "Aegis Barrier",
    stats: { damage: 30, range: 50, cooldown: 50, utility: 90 },
    codeSnippet: `<span class="code-comment">// Hex-mesh barrier matrix</span>
shield.<span class="code-fn">deployAegisMatrix</span>({
  capacity: <span class="code-num">450.0</span>,
  autoReflect: <span class="code-bool">true</span>
});`
  },
  {
    name: "GRIDMASTER",
    desc: "Squad telemetry coordinator and energy reservoir architect.",
    opCode: "OP-05 // ARCHITECT",
    tagline: "CODE THE SQUAD. SYNCHRONIZE VICTORY.",
    ability: "Overclock Grid",
    stats: { damage: 40, range: 75, cooldown: 90, utility: 100 },
    codeSnippet: `<span class="code-comment">// Grid balancer & telemetry overclock</span>
squad.<span class="code-fn">boostTelemetryHz</span>(<span class="code-num">20.0</span>);
squad.<span class="code-fn">fillEnergyReservoir</span>(<span class="code-num">1.45</span>);`
  }
];

function initCleanHeroTitleGlider() {
  const heroTitle = document.getElementById('hero-title');
  const siteHeader = document.getElementById('site-header');
  const slot = document.getElementById('hero-title-slot');
  const pretitle = document.querySelector('.hero-pretitle');
  const subtitle = document.querySelector('.hero-subtitle');
  const actions = document.querySelector('.hero-actions');
  const rightLabel = document.querySelector('.hero-right-label');
  const scrollTicker = document.querySelector('.hero-scroll-ticker');

  if (!heroTitle || !siteHeader || !slot) return;

  // Initial natural relative layout
  heroTitle.style.position = 'relative';
  heroTitle.style.top = 'auto';
  heroTitle.style.left = 'auto';
  heroTitle.style.transform = 'none';
  heroTitle.style.margin = '0';
  heroTitle.style.zIndex = '1001';

  let startLeft = 0;
  let startTop = 0;
  const targetLeft = 48;
  const targetTop = 18;
  const targetScale = 0.32;

  function measurePositions() {
    heroTitle.style.position = 'relative';
    heroTitle.style.transform = 'none';
    const rect = slot.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top + window.scrollY;
  }

  measurePositions();
  window.addEventListener('resize', measurePositions);

  const surrounding = [pretitle, subtitle, actions, rightLabel, scrollTicker].filter(Boolean);

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '60% top',
    scrub: 0.2,
    onUpdate: (self) => {
      const p = self.progress;

      if (p <= 0.001) {
        // At exact top of page: 100% natural relative position in Hero Section
        heroTitle.style.position = 'relative';
        heroTitle.style.top = 'auto';
        heroTitle.style.left = 'auto';
        heroTitle.style.transform = 'none';
        siteHeader.classList.remove('scrolled');
        gsap.set(surrounding, { opacity: 1, y: 0 });
      } else {
        // When scrolling down: fixed positioning gliding smoothly to header top-left (48px, 18px)
        heroTitle.style.position = 'fixed';
        heroTitle.style.top = `${targetTop}px`;
        heroTitle.style.left = `${targetLeft}px`;
        heroTitle.style.transformOrigin = 'left top';

        // Interpolate position from start (slot) to target (header)
        const currentDeltaX = (1 - p) * (startLeft - targetLeft);
        const currentDeltaY = (1 - p) * (startTop - window.scrollY - targetTop);
        const currentScale = 1 - p * (1 - targetScale);

        gsap.set(heroTitle, {
          x: currentDeltaX,
          y: currentDeltaY,
          scale: currentScale,
          opacity: 1
        });

        // Fade out surrounding hero text as user scrolls
        const surroundingOpacity = Math.max(0, 1 - p * 2.5);
        gsap.set(surrounding, { opacity: surroundingOpacity, y: -12 * p });

        if (p > 0.4) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
      }
    }
  });
}

function initSmoothScrollAndGSAP() {
  const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  initCleanHeroTitleGlider();

  // --- Hero Section Animations ---
  gsap.from('.hero-pretitle span', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  gsap.from('.hero-title', {
    scale: 0.94,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  });

  gsap.from('.hero-subtitle span', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.hero-actions', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    delay: 0.8,
    ease: 'power3.out'
  });

  gsap.to('#hero-backdrop', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // --- Section 2 (Duality) Animations ---
  gsap.from('.duality-fighter-col', {
    x: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#duality',
      start: 'top 75%'
    }
  });

  gsap.from('.duality-tactical-col', {
    x: 50,
    opacity: 0,
    duration: 1,
    delay: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#duality',
      start: 'top 75%'
    }
  });

  // --- Section 3 (Roles) Animations ---
  gsap.from('.roles-left-col', {
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#roles',
      start: 'top 75%'
    }
  });

  gsap.from('.roles-overview-card', {
    y: 40,
    opacity: 0,
    duration: 0.9,
    delay: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#roles',
      start: 'top 75%'
    }
  });

  gsap.from('.operatives-carousel-wrap', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.4,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#roles',
      start: 'top 75%'
    }
  });

  // --- Section 4 (Forge) Animations ---
  gsap.from('.forge-left-col', {
    x: -50,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#forge',
      start: 'top 75%'
    }
  });

  gsap.from('#forge-viewport-center', {
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#forge',
      start: 'top 75%'
    }
  });

  gsap.from('.forge-code-window', {
    x: 50,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#forge',
      start: 'top 75%'
    }
  });

  // --- Section 5 (Sanctuary / System Specs) Animations ---
  const sanctuaryItems = document.querySelectorAll('.sanctuary-card, .sanctuary-thumb-item');
  if (sanctuaryItems.length) {
    gsap.from(sanctuaryItems, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sanctuary-grid, #sanctuary',
        start: 'top 80%'
      }
    });
  }

  // --- Section 6 (System Specs) Animations ---
  const specRows = document.querySelectorAll('.spec-table-row, .spec-card');
  if (specRows.length) {
    gsap.from(specRows, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.system-specs-container, #specs',
        start: 'top 80%'
      }
    });
  }
}

function setupRolesShowcase() {
  const tabBtns = document.querySelectorAll('.role-tab-btn');
  const thumbCards = document.querySelectorAll('.op-card-item, .op-thumb-card');

  const roleTitle = document.getElementById('role-title');
  const roleDesc = document.getElementById('role-desc');
  const roleCounter = document.getElementById('role-counter');
  const calloutCode = document.getElementById('callout-code');
  const calloutTitle = document.getElementById('callout-title');
  const calloutSub = document.getElementById('callout-sub');
  const roleCodeContent = document.getElementById('role-code-content');
  const roleAbility = document.getElementById('role-ability-name');

  const barD = document.getElementById('stat-bar-damage');
  const barR = document.getElementById('stat-bar-range');
  const barC = document.getElementById('stat-bar-cooldown');
  const barU = document.getElementById('stat-bar-utility');
  const numD = document.getElementById('stat-num-damage');
  const numR = document.getElementById('stat-num-range');
  const numC = document.getElementById('stat-num-cooldown');
  const numU = document.getElementById('stat-num-utility');

  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  let currentIdx = 0;

  function selectRole(idx, playSound = true) {
    if (playSound) sfx.play('click');
    currentIdx = idx;
    const data = rolesData[idx];
    if (!data) return;

    tabBtns.forEach((b, i) => {
      b.classList.toggle('active', i === idx);
      b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    thumbCards.forEach((t, i) => t.classList.toggle('active', i === idx));

    if (roleTitle) roleTitle.textContent = data.name;
    if (roleDesc) roleDesc.textContent = data.desc;
    if (roleCounter) roleCounter.textContent = `0${idx + 1} / 05`;
    if (calloutCode) calloutCode.textContent = data.opCode;
    if (calloutTitle) calloutTitle.textContent = data.name;
    if (calloutSub) calloutSub.textContent = data.tagline;
    if (roleCodeContent) roleCodeContent.innerHTML = data.codeSnippet;
    if (roleAbility) roleAbility.textContent = data.ability;

    if (barD) barD.style.width = data.stats.damage + '%';
    if (barR) barR.style.width = data.stats.range + '%';
    if (barC) barC.style.width = data.stats.cooldown + '%';
    if (barU) barU.style.width = data.stats.utility + '%';

    if (numD) numD.textContent = data.stats.damage;
    if (numR) numR.textContent = data.stats.range;
    if (numC) numC.textContent = data.stats.cooldown;
    if (numU) numU.textContent = data.stats.utility;

    gsap.fromTo('.roles-overview-card',
      { opacity: 0.85, scale: 0.99 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }
    );
  }

  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      selectRole(idx);
      resetAutoplay();
    });
    btn.addEventListener('mouseenter', () => sfx.play('hover'));
  });

  thumbCards.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      selectRole(idx);
      resetAutoplay();
    });
    thumb.addEventListener('mouseenter', () => sfx.play('hover'));
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newIdx = (currentIdx - 1 + rolesData.length) % rolesData.length;
      selectRole(newIdx);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const newIdx = (currentIdx + 1) % rolesData.length;
      selectRole(newIdx);
      resetAutoplay();
    });
  }

  let autoplayTimer = null;

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const nextIdx = (currentIdx + 1) % rolesData.length;
      selectRole(nextIdx, false);
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  const rolesSection = document.getElementById('roles');
  if (rolesSection) {
    rolesSection.addEventListener('mouseenter', stopAutoplay);
    rolesSection.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

// ==========================================================================
// 7. INITIALIZATION ON DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScrollAndGSAP();
  initAmbientParticles();
  initPhaseArmCanvas();
  setupRolesShowcase();

  const model3dViewer = initModelGLBViewer();

  const variantCards = document.querySelectorAll('.variant-item-card');
  const forgeHammerImg = document.getElementById('forge-hammer-img');

  const numD = document.getElementById('forge-num-damage');
  const numR = document.getElementById('forge-num-range');
  const numC = document.getElementById('forge-num-cooldown');
  const numW = document.getElementById('forge-num-weight');

  const barD = document.getElementById('forge-bar-damage');
  const barR = document.getElementById('forge-bar-range');
  const barC = document.getElementById('forge-bar-cooldown');
  const barW = document.getElementById('forge-bar-weight');

  const editor = setupInteractiveForgeEditor(
    (color, updateCode = true) => {
      variantCards.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-color') === color);
      });
      if (forgeHammerImg) {
        forgeHammerImg.className = 'forge-hammer-img ' + color;
      }
      if (model3dViewer) {
        model3dViewer.setColor(color);
      }
    },
    (stats) => {
      if (stats.damage !== undefined && numD) {
        numD.textContent = stats.damage;
        if (barD) barD.style.width = Math.min(stats.damage, 100) + '%';
      }
      if (stats.range !== undefined && numR) {
        numR.textContent = stats.range.toFixed(1);
        if (barR) barR.style.width = Math.min((stats.range / 5) * 100, 100) + '%';
      }
      if (stats.cooldown !== undefined && numC) {
        numC.textContent = stats.cooldown.toFixed(1);
        if (barC) barC.style.width = Math.min((stats.cooldown / 3) * 100, 100) + '%';
      }
      if (stats.weight !== undefined && numW) {
        numW.textContent = stats.weight.toFixed(1);
        if (barW) barW.style.width = Math.min((stats.weight / 25) * 100, 100) + '%';
      }
    }
  );

  variantCards.forEach(card => {
    card.addEventListener('mouseenter', () => sfx.play('hover'));
    card.addEventListener('click', () => {
      sfx.play('click');
      const color = card.getAttribute('data-color');
      variantCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (forgeHammerImg) {
        forgeHammerImg.className = 'forge-hammer-img ' + color;
      }
      if (model3dViewer) {
        model3dViewer.setColor(color);
      }
      if (editor) {
        editor.updateColorInCode(color);
      }
    });
  });

  const forgeRunBtn = document.getElementById('forge-run-btn');
  if (forgeRunBtn) {
    forgeRunBtn.addEventListener('click', () => {
      sfx.play('compile');
      if (forgeHammerImg) {
        forgeHammerImg.style.transform = 'scale(1.08)';
        setTimeout(() => { forgeHammerImg.style.transform = 'scale(1)'; }, 300);
      }
    });
  }

  const forgeActionBtn = document.getElementById('btn-forge-action');
  const deployBanner = document.getElementById('forge-deploy-banner');

  if (forgeActionBtn) {
    forgeActionBtn.addEventListener('click', () => {
      sfx.play('compile');
      forgeActionBtn.disabled = true;
      forgeActionBtn.innerHTML = '<span class="bolt">⚡</span><span class="btn-text">COMPILING GATES...</span>';

      setTimeout(() => {
        sfx.play('deploy');
        forgeActionBtn.disabled = false;
        forgeActionBtn.innerHTML = '<span class="bolt">⚡</span><span class="btn-text">FORGE &amp; DEPLOY</span><span class="arrow">→</span>';
        if (deployBanner) {
          deployBanner.style.boxShadow = '0 0 40px rgba(51, 242, 102, 0.6)';
          deployBanner.style.borderColor = '#00e5ff';
          setTimeout(() => {
            deployBanner.style.boxShadow = '0 0 24px rgba(51, 242, 102, 0.25)';
            deployBanner.style.borderColor = '#33f266';
          }, 1500);
        }
      }, 800);
    });
  }

  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioLabel = document.getElementById('audio-label');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      audioBtn.classList.toggle('active', sfx.enabled);
      if (audioLabel) audioLabel.textContent = sfx.enabled ? 'SFX: ON' : 'SFX: OFF';
    });
  }

  const trailerBtn = document.getElementById('btn-watch-trailer');
  const modal = document.getElementById('trailer-modal');
  const closeBtn = document.getElementById('close-trailer-modal');
  const video = document.getElementById('trailer-video');

  if (trailerBtn && modal) {
    trailerBtn.addEventListener('click', () => {
      sfx.play('click');
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      if (video) video.play();
    });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }
  // Section 5: Pinned Scroll-Jacking Worlds Showcase
  initSanctuaryScrollJacking();

  initTacticalRadarWidget();
  initRequirementsSection();
});

// ==========================================================================
// 8. SANCTUARY PINNED SCROLL-JACKING WORLDS SHOWCASE
// ==========================================================================
function initSanctuaryScrollJacking() {
  const sanctuarySec = document.getElementById('sanctuary');
  if (!sanctuarySec) return;

  const WORLDS_DATA = [
    {
      index: "WORLD 01 / 04",
      eyebrow: "WORLD DISCOVERY // ORBITAL ARENA",
      titleHtml: `<span>HIGHER</span><span>BIGGER</span><span>CLEANER</span><span class="dim">NO LIMITS.</span>`,
      desc: "A low-orbit arena where minds and machines collide. The Sanctuary is more than a battleground - it's a test of evolution.",
      coordsTitle: "ORBITAL PLATFORM",
      coordsVal: "0.00° N   0.00° E",
      coordsSub: "LOW EARTH ORBIT // ALTITUDE: 420 KM",
      env: "ZERO-G VACUUM",
      hardpoints: "08 ACTIVE NODES",
      sync: "99.8% STABLE",
      sloganHtml: `<span>MACHINES</span><span>BUILD</span><span>FASTER.</span><span class="spacer"></span><span>HUMANS</span><span>AIM HIGHER.</span>`,
      status: "WORLD 01 OF 04 — ORBITAL PLATFORM ARENA"
    },
    {
      index: "WORLD 02 / 04",
      eyebrow: "WORLD DISCOVERY // CYBERNETIC GRID",
      titleHtml: `<span>NEON</span><span>MATRIX</span><span>GRID</span><span class="dim">DUEL COLOSSEUM.</span>`,
      desc: "Dense vertical skyscrapers interwoven with tactical hardpoints. Code the grid in real-time to alter combat sightlines.",
      coordsTitle: "SUB-LEVEL GRID 04",
      coordsVal: "34.12° N   118.24° W",
      coordsSub: "NEON CORE // ALTITUDE: 12 M",
      env: "GRID ATMOSPHERE",
      hardpoints: "12 ACTIVE NODES",
      sync: "98.4% STABLE",
      sloganHtml: `<span>REWRITE</span><span>THE CITY.</span><span class="spacer"></span><span>OVERRIDE</span><span>THE GRID.</span>`,
      status: "WORLD 02 OF 04 — CYBERNETIC CORE GRID"
    },
    {
      index: "WORLD 03 / 04",
      eyebrow: "WORLD DISCOVERY // STRATO-DOME",
      titleHtml: `<span>STRATO-DOME</span><span>MESOSPHERE</span><span>OUTLOOK</span><span class="dim">ZERO GRAVITY.</span>`,
      desc: "High-altitude combat in dynamic zero-G pockets. Adapt weapon kinetics on the fly as wind vectors and gravity fields shift.",
      coordsTitle: "MESOSPHERE APEX",
      coordsVal: "78.45° N   15.68° E",
      coordsSub: "APEX DOME // ALTITUDE: 85 KM",
      env: "SYNTHETIC AIR",
      hardpoints: "06 DYNAMIC ZONES",
      sync: "99.2% STABLE",
      sloganHtml: `<span>NO GRAVITY</span><span>LIMITS.</span><span class="spacer"></span><span>ADAPT</span><span>OR FALL.</span>`,
      status: "WORLD 03 OF 04 — STRATO-DOME MESOSPHERE"
    },
    {
      index: "WORLD 04 / 04",
      eyebrow: "WORLD DISCOVERY // VOID CITADEL",
      titleHtml: `<span>VOID</span><span>CITADEL</span><span>CORE</span><span class="dim">FINAL DUEL.</span>`,
      desc: "The ultimate arena. Unrestricted operative abilities and raw neural bandwidth. Only synchronized units claim dominance.",
      coordsTitle: "UNCHARTERED SECTOR",
      coordsVal: "99.99° N   99.99° E",
      coordsSub: "DEEP SPACE // ALTITUDE: UNBOUND",
      env: "DEEP SPACE VOID",
      hardpoints: "UNRESTRICTED",
      sync: "100.0% OVERDRIVE",
      sloganHtml: `<span>ONE TRUTH.</span><span class="spacer"></span><span>NO MERCY.</span><span>VICTORY.</span>`,
      status: "WORLD 04 OF 04 — VOID CITADEL FINAL DUEL"
    }
  ];

  const backdropLayers = document.querySelectorAll('.sanctuary-backdrop-layer');
  const indexEl = document.getElementById('sanctuary-world-index');
  const eyebrowEl = document.getElementById('sanctuary-eyebrow');
  const titleEl = document.getElementById('sanctuary-title');
  const descEl = document.getElementById('sanctuary-desc');
  const coordsTitleEl = document.getElementById('coords-title');
  const coordsValEl = document.getElementById('coords-val');
  const coordsSubEl = document.getElementById('coords-sub');
  const envEl = document.getElementById('telem-env');
  const hardpointsEl = document.getElementById('telem-hardpoints');
  const syncEl = document.getElementById('telem-sync');
  const sloganEl = document.getElementById('sanctuary-slogan');
  const statusEl = document.getElementById('sanctuary-footer-status');
  const progressFill = document.getElementById('world-progress-fill');
  const stepDots = document.querySelectorAll('.step-dot');
  const thumbItems = document.querySelectorAll('.sanctuary-thumb-item');

  let currentWorld = -1;

  function updateWorldContent(worldIdx) {
    if (currentWorld === worldIdx) return;
    currentWorld = worldIdx;

    const data = WORLDS_DATA[worldIdx];
    if (!data) return;

    // 1. Backdrop layer crossfade
    backdropLayers.forEach((layer, i) => {
      if (i === worldIdx) {
        layer.classList.add('active');
      } else {
        layer.classList.remove('active');
      }
    });

    // 2. Active Indicators
    stepDots.forEach((dot, i) => dot.classList.toggle('active', i === worldIdx));
    thumbItems.forEach((thumb, i) => thumb.classList.toggle('active', i === worldIdx));
    if (progressFill) progressFill.style.height = `${((worldIdx + 1) / 4) * 100}%`;

    // 3. Text & Stats Update
    if (indexEl) indexEl.textContent = data.index;
    if (eyebrowEl) eyebrowEl.textContent = data.eyebrow;
    if (descEl) descEl.textContent = data.desc;
    if (coordsTitleEl) coordsTitleEl.textContent = data.coordsTitle;
    if (coordsValEl) coordsValEl.textContent = data.coordsVal;
    if (coordsSubEl) coordsSubEl.textContent = data.coordsSub;
    if (envEl) envEl.textContent = data.env;
    if (hardpointsEl) hardpointsEl.textContent = data.hardpoints;
    if (syncEl) syncEl.textContent = data.sync;
    if (sloganEl) sloganEl.innerHTML = data.sloganHtml;
    if (statusEl) statusEl.textContent = data.status;

    if (titleEl) {
      titleEl.innerHTML = data.titleHtml;
      gsap.fromTo(titleEl.children, 
        { opacity: 0, y: 12 }, 
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }

  // GSAP ScrollTrigger Pinned Timeline
  const st = ScrollTrigger.create({
    trigger: sanctuarySec,
    start: 'top top',
    end: '+=300%',
    pin: true,
    pinSpacing: true,
    scrub: 0.5,
    onUpdate: (self) => {
      const progress = self.progress;
      const activeIdx = Math.min(3, Math.floor(progress * 4));
      updateWorldContent(activeIdx);
    }
  });

  // Initial update
  updateWorldContent(0);

  // Click handlers on Step Dots & Thumbnails for direct navigation
  const navigateToWorld = (worldIdx) => {
    if (window.sfx) window.sfx.play('click');
    const start = st.start;
    const end = st.end;
    const targetScroll = start + (worldIdx / 3) * (end - start);

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  stepDots.forEach((dot, i) => {
    dot.addEventListener('mouseenter', () => window.sfx && window.sfx.play('hover'));
    dot.addEventListener('click', () => navigateToWorld(i));
  });

  thumbItems.forEach((thumb, i) => {
    thumb.addEventListener('mouseenter', () => window.sfx && window.sfx.play('hover'));
    thumb.addEventListener('click', () => navigateToWorld(i));
  });
}

function initTacticalRadarWidget() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  const feedText = document.querySelector('#tactical-stream-feed .feed-text');
  const syncVal = document.getElementById('radar-sync-val');
  const latencyVal = document.getElementById('metric-latency');

  if (!modeBtns.length) return;

  const modeMessages = {
    assault: 'ASSAULT MATRIX ACTIVE // CRIT +25%',
    defensive: 'SHIELD BARRIER ACTIVE // DAMAGE REDUCTION 40%',
    overdrive: 'NEURAL OVERDRIVE ACTIVE // RECHARGE SPEED 2.5X'
  };

  const syncValues = {
    assault: '99.8%',
    defensive: '98.5%',
    overdrive: '100.0%'
  };

  const latencyValues = {
    assault: '12ms',
    defensive: '9ms',
    overdrive: '5ms'
  };

  modeBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (window.sfx) window.sfx.play('hover');
    });
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (feedText && modeMessages[mode]) {
        feedText.textContent = modeMessages[mode];
      }
      if (syncVal && syncValues[mode]) {
        syncVal.textContent = syncValues[mode];
      }
      if (latencyVal && latencyValues[mode]) {
        latencyVal.textContent = latencyValues[mode];
      }
      if (window.sfx) window.sfx.play('click');
    });
  });
}

// ==========================================================================
// 9. SYSTEM REQUIREMENTS INTERACTIVE HARDWARE PRESETS SHOWCASE
// ==========================================================================
function initRequirementsSection() {
  const reqCard = document.getElementById('specs-req-card');
  if (!reqCard) return;

  const PRESETS_DATA = [
    {
      tag: "PRESET: POTATO-PC (720P)",
      status: "TARGET: 30-45 FPS (INTEGRATED)",
      fpsNum: 40,
      gaugeWidth: "35%",
      latency: "28 ms",
      vram: "1.2 GB",
      cpu: "Intel Core i3 / AMD Ryzen 3",
      cpuSub: "4 Cores @ 2.40GHz or better",
      gpu: "Intel UHD 620 / AMD Vega 8",
      gpuSub: "DirectX 11 API / iGPU",
      ram: "8 GB DDR4",
      ramSub: "Single-Channel Playable",
      storage: "8 GB (HDD / SSD)",
      storageSub: "HDD Supported",
      os: "Windows 10 / Linux 64-bit",
      osSub: "64-bit OS Required",
      fps: "30-45 FPS @ 720p Low",
      fpsSub: "Dynamic Resolution Scaling"
    },
    {
      tag: "PRESET: MINIMUM (1080P)",
      status: "TARGET: 60 FPS STABLE",
      fpsNum: 60,
      gaugeWidth: "60%",
      latency: "12 ms",
      vram: "3.4 GB",
      cpu: "Intel Core i5-8400 / AMD Ryzen 5 2600",
      cpuSub: "6 Cores @ 2.80GHz or better",
      gpu: "GTX 1050 Ti / RX 570 (4GB)",
      gpuSub: "DirectX 12 API / Vulkan 1.3",
      ram: "16 GB DDR4",
      ramSub: "Dual-Channel Recommended",
      storage: "20 GB SSD",
      storageSub: "SSD Recommended for fast loading",
      os: "Windows 10 / Linux 64-bit",
      osSub: "Requires 64-bit architecture",
      fps: "60 FPS @ 1080p Medium",
      fpsSub: "V-Sync Supported / Low Latency"
    },
    {
      tag: "PRESET: RECOMMENDED (1440P)",
      status: "TARGET: 120 FPS HIGH",
      fpsNum: 120,
      gaugeWidth: "85%",
      latency: "6 ms",
      vram: "6.8 GB",
      cpu: "Intel Core i7-10700 / AMD Ryzen 7 5700X",
      cpuSub: "8 Cores / 16 Threads @ 3.80GHz",
      gpu: "RTX 3060 / RX 6700 XT (8GB)",
      gpuSub: "DirectX 12 Ultimate / Ray Tracing",
      ram: "16 GB - 32 GB DDR4/DDR5",
      ramSub: "High-Speed Dual Channel",
      storage: "20 GB NVMe SSD",
      storageSub: "High-Speed NVMe M.2 SSD",
      os: "Windows 11 / Linux 64-bit",
      osSub: "Optimized for Win 11 DirectStorage",
      fps: "120 FPS @ 1440p High",
      fpsSub: "Reflex Low Latency Enabled"
    },
    {
      tag: "PRESET: CYBER ULTRA (4K 144Hz)",
      status: "TARGET: 144+ FPS EXTREME",
      fpsNum: 144,
      gaugeWidth: "100%",
      latency: "3 ms",
      vram: "11.2 GB",
      cpu: "Intel Core i9-13900K / AMD Ryzen 9 7900X",
      cpuSub: "16+ Cores @ 5.0GHz+ Unlocked",
      gpu: "RTX 4080 / RX 7900 XTX (16GB)",
      gpuSub: "Path Tracing / DLSS 3.5 Frame Gen",
      ram: "32 GB DDR5 6000MHz",
      ramSub: "Ultra Low Latency RAM",
      storage: "20 GB Gen4 NVMe SSD",
      storageSub: "7000 MB/s Read Speed",
      os: "Windows 11 (64-bit)",
      osSub: "Unrestricted Cyber Pipeline",
      fps: "144+ FPS @ 4K Ultra",
      fpsSub: "Uncapped Frame Rate / Reflex Boost"
    }
  ];

  const presetTabs    = document.querySelectorAll('.req-preset-tab');
  const presetTag     = document.getElementById('req-active-preset-tag');
  const gaugeStatus   = document.getElementById('gauge-target-txt');
  const gaugeFillBar  = document.getElementById('gauge-fill-bar');
  const fpsNumEl      = document.getElementById('gauge-fps-num');
  const latencyVal    = document.getElementById('gauge-latency-val');
  const vramVal       = document.getElementById('gauge-vram-val');
  const tierSegments  = document.querySelectorAll('.tier-segment');
  const specCardItems = document.querySelectorAll('.spec-card-item');

  // Update tier power bar (light up segments 0..idx)
  function updateTierBar(idx) {
    tierSegments.forEach((seg, i) => {
      seg.classList.toggle('active', i <= idx);
    });
  }

  // Animate a spec value swap using CSS animation classes
  function swapSpecValue(valEl, wrapEl, newText, delay) {
    setTimeout(() => {
      wrapEl.classList.remove('loaded');
      wrapEl.classList.add('swapping');
      setTimeout(() => {
        valEl.textContent = newText;
        wrapEl.classList.remove('swapping');
        wrapEl.classList.add('loaded');
      }, 160);
    }, delay);
  }

  // Apply a preset: update colours, tier bar, values, gauge
  function applyPreset(idx, animate) {
    const data = PRESETS_DATA[idx];
    if (!data) return;

    // CSS colour theme via data attribute
    reqCard.setAttribute('data-active-preset', String(idx));

    updateTierBar(idx);

    if (presetTag)  presetTag.textContent  = data.tag;
    if (gaugeStatus) gaugeStatus.textContent = data.status;
    if (latencyVal)  latencyVal.textContent  = data.latency;
    if (vramVal)     vramVal.textContent     = data.vram;

    // Gauge bar width
    if (gaugeFillBar) {
      gaugeFillBar.style.width = data.gaugeWidth;
    }

    // FPS counter roll-up
    if (fpsNumEl) {
      const from = parseInt(fpsNumEl.textContent) || 60;
      gsap.to({ val: from }, {
        val: data.fpsNum,
        duration: 0.65,
        ease: 'power2.out',
        onUpdate: function () {
          fpsNumEl.textContent = Math.round(this.targets()[0].val);
        }
      });
    }

    if (!animate) return;

    // Staggered spec value swaps
    const keys = ['cpu', 'gpu', 'ram', 'storage', 'os', 'fps'];
    keys.forEach((key, i) => {
      const valEl  = document.getElementById('spec-val-' + key);
      const subEl  = document.getElementById('spec-sub-' + key);
      const wrapEl = valEl && valEl.closest('.spec-value-wrap');
      if (valEl && wrapEl) swapSpecValue(valEl, wrapEl, data[key], i * 45);
      if (subEl) setTimeout(() => { subEl.textContent = data[key + 'Sub']; }, i * 45 + 80);
    });

    // Border flash on each spec card (staggered ripple)
    specCardItems.forEach((card, i) => {
      setTimeout(() => {
        card.style.transition = 'border-color 0.3s ease';
        card.style.borderColor = 'var(--preset-color)';
        setTimeout(() => { card.style.borderColor = ''; }, 400);
      }, i * 35);
    });
  }

  // ScrollTrigger: reveal the whole card + stagger spec cards
  ScrollTrigger.create({
    trigger: reqCard,
    start: 'top 82%',
    once: true,
    onEnter: () => {
      // Card slide-up reveal
      reqCard.classList.add('is-revealed');

      // Tier bar lights up segment by segment
      tierSegments.forEach((seg, i) => {
        setTimeout(() => {
          if (i <= 1) seg.classList.add('active');
        }, 300 + i * 90);
      });

      // Spec cards stagger pop in
      specCardItems.forEach((card, i) => {
        setTimeout(() => { card.classList.add('is-visible'); }, 420 + i * 75);
      });

      // Gauge wrapper
      gsap.fromTo('.req-gauge-wrapper',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay: 0.58 }
      );

      // Preset tabs
      gsap.fromTo('.req-preset-tab',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.18 }
      );

      // Side card slides in from right
      gsap.fromTo('.req-side-card',
        { opacity: 0, x: 32 },
        { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out', delay: 0.48 }
      );
    }
  });

  // Tab click handler
  presetTabs.forEach((tab, idx) => {
    tab.addEventListener('mouseenter', () => window.sfx && window.sfx.play('hover'));
    tab.addEventListener('click', () => {
      if (window.sfx) window.sfx.play('compile');
      presetTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      applyPreset(idx, true);
    });
  });

  // Boot state: preset 1 active
  updateTierBar(1);
}

