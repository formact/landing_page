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

function initHeroParallaxAndHeader(lenis) {
  const heroTitle = document.getElementById('hero-title');
  const siteHeader = document.getElementById('site-header');

  // Parallax fade for Hero Title inside Hero Section (never floats fixed across site)
  if (heroTitle) {
    heroTitle.style.position = 'relative';
    heroTitle.style.transform = 'none';
    heroTitle.style.top = 'auto';
    heroTitle.style.left = 'auto';
    heroTitle.style.zIndex = '10';

    gsap.to(heroTitle, {
      y: -40,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: '25% top',
        end: '85% top',
        scrub: true
      }
    });
  }

  // Smooth Header Navigation state & active section tracker
  if (siteHeader) {
    const updateHeaderState = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY < 60) {
        siteHeader.classList.add('at-top');
      } else {
        siteHeader.classList.remove('at-top');
      }
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    // Active navigation link highlight on scroll
    const sections = ['hero', 'duality', 'roles', 'forge', 'sanctuary', 'specs'];
    const navLinks = document.querySelectorAll('.nav-link');
    sections.forEach(id => {
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActiveNav(id),
        onEnterBack: () => setActiveNav(id)
      });
    });

    function setActiveNav(id) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const match = href === '#' + id || (id === 'hero' && href === '#hero');
        link.classList.toggle('active', match);
      });
    }
  }

  // Smooth Lenis Scroll for all internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (window.sfx) window.sfx.play('hover');
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function initSmoothScrollAndGSAP() {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.6,
    infinite: false,
  });

  window.lenis = lenis;

  lenis.on('scroll', () => {
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  initHeroParallaxAndHeader(lenis);
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
  const sanctuaryItems = document.querySelectorAll('.sanctuary-card, .sanctuary-thumb-item, .world-card-item');
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
      name: "ORBITAL PLATFORM",
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
      name: "CYBER GRID",
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
      name: "STRATO-DOME",
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
      name: "VOID CITADEL",
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
  const worldNameEl = document.getElementById('sanctuary-world-name');
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
  const thumbItems = document.querySelectorAll('.sanctuary-thumb-item, .world-card-item');

  let currentWorld = -1;
  const portalGate = document.getElementById('sanctuary-portal-gate');
  const portalCoordsDisplay = document.getElementById('portal-coords-display');

  function updateWorldContent(worldIdx) {
    if (currentWorld === worldIdx) return;
    const prevWorld = currentWorld;
    currentWorld = worldIdx;

    const data = WORLDS_DATA[worldIdx];
    if (!data) return;

    // Trigger Portal Effect Gateway Warp
    if (portalGate) {
      portalGate.classList.remove('warping');
      void portalGate.offsetWidth; // Force reflow to retrigger animation
      portalGate.classList.add('warping');
      setTimeout(() => portalGate.classList.remove('warping'), 1000);
    }

    if (portalCoordsDisplay) {
      portalCoordsDisplay.textContent = data.coordsTitle + ' • ' + data.coordsSub;
    }

    // Portal Zoom & Reveal for Backdrop Layers (Slider Revolution Portal Effect)
    backdropLayers.forEach((layer, i) => {
      if (i === worldIdx) {
        layer.style.zIndex = '3';
        layer.classList.add('active');

        // Circular Portal Reveal Zoom from Center
        gsap.fromTo(layer, 
          { 
            clipPath: 'circle(0% at 50% 50%)',
            scale: 1.42,
            filter: 'brightness(1.6) contrast(1.15)',
            opacity: 1
          },
          { 
            clipPath: 'circle(150% at 50% 50%)',
            scale: 1.0,
            filter: 'brightness(1.0) contrast(1.0)',
            duration: 1.05,
            ease: 'power3.out',
            onComplete: () => {
              layer.style.clipPath = '';
            }
          }
        );
      } else if (i === prevWorld) {
        layer.style.zIndex = '2';
        gsap.to(layer, {
          scale: 0.9,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.85,
          ease: 'power2.inOut',
          onComplete: () => {
            layer.classList.remove('active');
            layer.style.zIndex = '1';
            layer.style.filter = '';
            layer.style.scale = '1';
          }
        });
      } else {
        layer.style.zIndex = '1';
        layer.classList.remove('active');
        layer.style.opacity = '0';
      }
    });

    // Audio SFX on portal warp
    if (prevWorld !== -1 && window.sfx) {
      window.sfx.play('compile');
    }

    // Active Indicators
    stepDots.forEach((dot, i) => dot.classList.toggle('active', i === worldIdx));
    thumbItems.forEach((thumb, i) => thumb.classList.toggle('active', i === worldIdx));
    if (progressFill) progressFill.style.height = `${((worldIdx + 1) / 4) * 100}%`;

    // Text & Stats Update with Stagger HUD reveal
    if (indexEl) indexEl.textContent = data.index;
    if (worldNameEl) worldNameEl.textContent = data.name;
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
        { opacity: 0, y: 14, filter: 'blur(4px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.06, ease: 'power2.out' }
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

    if (window.lenis) {
      window.lenis.scrollTo(targetScroll, { duration: 1.1 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
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
// 9. SYSTEM REQUIREMENTS MATRIX & RIG BENCHMARK (Matching section6.png)
// ==========================================================================
function initRequirementsSection() {
  const reqCard = document.getElementById('specs-req-card');
  if (!reqCard) return;

  const tierPills     = document.querySelectorAll('.tier-pill');
  const matrixHeaders = document.querySelectorAll('.specs-matrix-table th[data-col]');
  const btnRigScanner = document.getElementById('btn-rig-scanner');
  const rigScanBanner = document.getElementById('rig-scan-banner');
  const scanTitle     = document.getElementById('scan-rig-title');
  const scanDetail    = document.getElementById('scan-rig-detail');
  const scanBadge     = document.getElementById('scan-rig-badge');
  const sideCard      = document.getElementById('req-side-card');

  // Insert interactive laser table scan line
  const tableWrapper = document.querySelector('.req-table-wrapper');
  let tableScanLine = document.querySelector('.table-scan-line');
  if (tableWrapper && !tableScanLine) {
    tableScanLine = document.createElement('div');
    tableScanLine.className = 'table-scan-line';
    tableWrapper.appendChild(tableScanLine);
  }

  // Focus a specific hardware tier column ('all', 'potato', 'min', 'rec')
  function setFocusedColumn(colName, playAudio = false) {
    if (playAudio && window.sfx) window.sfx.play('hover');
    reqCard.setAttribute('data-focused-col', colName);

    tierPills.forEach(pill => {
      const match = pill.getAttribute('data-col') === colName;
      pill.classList.toggle('active', match);
      pill.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  // Tier pill click & hover handlers
  tierPills.forEach(pill => {
    const col = pill.getAttribute('data-col');
    pill.addEventListener('click', () => setFocusedColumn(col, true));
    pill.addEventListener('mouseenter', () => {
      if (window.sfx) window.sfx.play('hover');
    });
  });

  // Clicking table headers directly also focuses that column
  matrixHeaders.forEach(th => {
    const col = th.getAttribute('data-col');
    if (!col) return;
    th.addEventListener('click', () => setFocusedColumn(col, true));
  });

  // Real Hardware Detection via WebGL Debug Renderer Info
  function detectHardware() {
    let gpu = 'DirectX 12 / Vulkan Compatible GPU';
    let isHighEnd = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          const raw = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
          if (raw) {
            // Clean up verbose driver strings
            gpu = raw.replace(/ANGLE \((.*?), (.*?), (.*?)\)/, '$2')
                     .replace(/vs_\d+_\d+ ps_\d+_\d+/, '')
                     .trim();
            if (/RTX|GTX|Radeon RX|Apple M|Radeon Pro/i.test(gpu)) {
              isHighEnd = true;
            }
          }
        }
      }
    } catch (e) {
      // Fallback to default
    }

    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Cores` : '6+ Cores';
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB+ Detected` : '16 GB Dual-Channel';

    return { gpu, cores, ram, isHighEnd };
  }

  // Interactive Rig Scanner Click
  let isScanning = false;
  if (btnRigScanner) {
    btnRigScanner.addEventListener('click', () => {
      if (isScanning) return;
      isScanning = true;

      if (window.sfx) window.sfx.play('compile');

      // Expand scanner output banner
      if (rigScanBanner) rigScanBanner.classList.add('active');
      if (tableScanLine) tableScanLine.classList.add('scanning');

      if (scanTitle) scanTitle.textContent = 'SCANNING HARDWARE ARCHITECTURE...';
      if (scanDetail) scanDetail.textContent = 'Probing WebGL graphics pipeline, shader cores, and system memory...';
      if (scanBadge) {
        scanBadge.textContent = 'BENCHMARKING';
        scanBadge.style.color = '#00e5ff';
        scanBadge.style.borderColor = '#00e5ff';
      }

      // Step 1: Laser sweep across table
      setTimeout(() => {
        const info = detectHardware();

        if (scanTitle) scanTitle.textContent = `HARDWARE VERIFIED: ${info.gpu}`;
        if (scanDetail) scanDetail.textContent = `${info.cores} • ${info.ram} • Architecture optimal for high-refresh cyber warfare.`;
        if (scanBadge) {
          scanBadge.textContent = info.isHighEnd ? 'RECOMMENDED SPEC' : 'MINIMUM 1080P SPEC';
          scanBadge.style.color = info.isHighEnd ? '#34d399' : '#00e5ff';
          scanBadge.style.borderColor = info.isHighEnd ? '#34d399' : '#00e5ff';
        }

        // Highlight matching tier column
        setFocusedColumn(info.isHighEnd ? 'rec' : 'min', false);

        if (tableScanLine) tableScanLine.classList.remove('scanning');
        isScanning = false;
      }, 1400);
    });
  }

  // Subtle 3D Perspective Tilt on Operative Helmet Card
  if (sideCard) {
    sideCard.addEventListener('mousemove', (e) => {
      const rect = sideCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      sideCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    sideCard.addEventListener('mouseleave', () => {
      sideCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      sideCard.style.transition = 'transform 0.5s ease';
    });

    sideCard.addEventListener('mouseenter', () => {
      sideCard.style.transition = 'none';
    });
  }

  // GSAP ScrollTrigger Animation for Requirements Card and Table Rows
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    ScrollTrigger.create({
      trigger: reqCard,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        // Table rows cascade reveal
        gsap.fromTo('.specs-matrix-table tbody tr',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' }
        );

        // Right side card slide-in
        if (sideCard) {
          gsap.fromTo(sideCard,
            { opacity: 0, x: 28 },
            { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out', delay: 0.25 }
          );
        }

        // Community cards stagger reveal
        gsap.fromTo('.comm-item-btn',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out', delay: 0.4 }
        );
      }
    });

    // Footer Creator Showcase Scroll Reveal ("Created By iuXoa")
    const creatorShowcase = document.getElementById('footer-creator-showcase');
    if (creatorShowcase) {
      ScrollTrigger.create({
        trigger: creatorShowcase,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo(creatorShowcase,
            { opacity: 0, scale: 0.95, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power3.out' }
          );
          gsap.fromTo('.creator-high-title',
            { letterSpacing: '0.25em', filter: 'blur(8px)' },
            { letterSpacing: '0.12em', filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }
          );
        }
      });
    }
  }

  // Default focus: Minimum tier (1080P) matching section6.png
  setFocusedColumn('min', false);
}

