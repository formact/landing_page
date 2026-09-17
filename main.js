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
// 4. THREE.JS 3D GLTF VIEWPORT FOR WEAPON ARSENAL (Axe, Gun, Shield, Cannon)
// ==========================================================================
export const WEAPON_CONFIGS = {
  axe: {
    id: 'axe',
    name: 'Arc Maul (Axe)',
    type: 'axe_melee',
    file: 'model.glb',
    targetSize: 2.35,
    rotation: [0.2, -Math.PI / 4, 0.35],
    color: 0x00e5ff,
    colorName: 'cyan',
    stats: { damage: 85, range: 3.2, cooldown: 1.4, weight: 12.0 }
  },
  gun: {
    id: 'gun',
    name: 'Phase Carbine (Gun)',
    type: 'plasma_rifle',
    file: 'gun.glb',
    targetSize: 2.5,
    rotation: [0.08, -Math.PI / 2.6, 0.05],
    color: 0xff7043,
    colorName: 'orange',
    stats: { damage: 72, range: 45.0, cooldown: 0.4, weight: 4.5 }
  },
  shield: {
    id: 'shield',
    name: 'Aegis Bulwark (Shield)',
    type: 'kinetic_barrier',
    file: 'shield.glb',
    targetSize: 2.3,
    rotation: [0.05, -Math.PI / 5, 0.1],
    color: 0x5cd9ff,
    colorName: 'frost',
    stats: { damage: 40, range: 2.0, cooldown: 2.2, weight: 18.5 }
  },
  cannon: {
    id: 'cannon',
    name: 'Nova Cannon (Cannon)',
    type: 'heavy_artillery',
    file: 'canon.glb',
    targetSize: 2.55,
    rotation: [0.15, -Math.PI / 3.2, 0.08],
    color: 0x33f266,
    colorName: 'green',
    stats: { damage: 98, range: 60.0, cooldown: 3.5, weight: 24.0 }
  }
};

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

  let scene, camera, renderer, controls, modelWrapper;
  let keyLight, accentLight, pointLight;
  let currentWeaponId = 'axe';
  const modelCache = {};

  try {
    scene = new THREE.Scene();

    const getDimensions = () => {
      const w = viewport.clientWidth || 400;
      const h = viewport.clientHeight || 350;
      return { w, h };
    };

    const { w: width, h: height } = getDimensions();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.8);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableZoom = true;
    controls.minDistance = 1.2;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Neutral studio key light for crisp, natural highlights
    keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    // Soft fill light to illuminate shadowed areas naturally
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.3);
    fillLight.position.set(-5, 2, -4);
    scene.add(fillLight);

    // Back / rim light to accentuate metallic edges and silhouettes
    accentLight = new THREE.DirectionalLight(0xffffff, 1.5);
    accentLight.position.set(0, 5, -5);
    scene.add(accentLight);

    // Subtle bottom bounce light for realistic ground reflection
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.6);
    bounceLight.position.set(0, -5, 3);
    scene.add(bounceLight);

    const resizeRenderer = () => {
      const { w, h } = getDimensions();
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        resizeRenderer();
      });
      ro.observe(viewport);
    }
    window.addEventListener('resize', resizeRenderer);

    const loader = new GLTFLoader();

    function setWeapon(weaponId) {
      const config = WEAPON_CONFIGS[weaponId] || WEAPON_CONFIGS.axe;
      currentWeaponId = weaponId;

      if (modelWrapper) {
        scene.remove(modelWrapper);
        modelWrapper = null;
      }

      const mountModel = (sourceModel) => {
        const cloned = sourceModel.clone(true);
        cloned.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(cloned);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        cloned.position.set(-center.x, -center.y, -center.z);

        modelWrapper = new THREE.Group();
        modelWrapper.add(cloned);

        const scale = (config.targetSize || 2.4) / maxDim;
        modelWrapper.scale.set(scale, scale, scale);
        modelWrapper.position.set(0, 0, 0);

        const rot = config.rotation || [0.2, -Math.PI / 4, 0.35];
        modelWrapper.rotation.set(rot[0], rot[1], rot[2]);

        // Preserve all authentic textures, normal maps, roughness & metallic materials from the GLB
        cloned.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.needsUpdate = true;
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
          }
        });

        scene.add(modelWrapper);

        controls.target.set(0, 0, 0);
        controls.update();

        camera.position.set(0, 0.2, 3.8);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        if (loaderEl) {
          loaderEl.style.opacity = '0';
          setTimeout(() => { loaderEl.style.display = 'none'; }, 300);
        }
        if (fallbackImg) {
          fallbackImg.style.opacity = '0';
          fallbackImg.style.display = 'none';
        }
      };

      if (modelCache[weaponId]) {
        mountModel(modelCache[weaponId]);
      } else {
        if (loaderEl) {
          loaderEl.style.display = 'flex';
          loaderEl.style.opacity = '1';
          const txt = loaderEl.querySelector('.loader-text');
          if (txt) txt.textContent = `LOADING ${weaponId.toUpperCase()}...`;
        }

        loader.load(
          config.file,
          (gltf) => {
            modelCache[weaponId] = gltf.scene;
            mountModel(gltf.scene);
            preloadOtherModels();
          },
          (xhr) => {
            if (xhr.lengthComputable && loaderEl) {
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              const txt = loaderEl.querySelector('.loader-text');
              if (txt) txt.textContent = `LOADING ${weaponId.toUpperCase()} (${percent}%)`;
            }
          },
          (err) => {
            console.warn(`Failed to load ${config.file}:`, err);
            if (loaderEl) loaderEl.style.display = 'none';
            if (fallbackImg) {
              fallbackImg.style.opacity = '1';
              fallbackImg.style.display = 'block';
            }
          }
        );
      }
    }

    let preloadingStarted = false;
    function preloadOtherModels() {
      if (preloadingStarted) return;
      preloadingStarted = true;
      Object.keys(WEAPON_CONFIGS).forEach(key => {
        if (!modelCache[key]) {
          loader.load(
            WEAPON_CONFIGS[key].file,
            (gltf) => {
              modelCache[key] = gltf.scene;
            },
            undefined,
            (err) => console.warn(`Preload error for ${key}:`, err)
          );
        }
      });
    }

    // Initial load: Axe
    setWeapon('axe');

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      if (modelWrapper) {
        modelWrapper.position.y = Math.sin(Date.now() * 0.0015) * 0.06;
      }
      renderer.render(scene, camera);
    }
    animate();

    return {
      setWeapon,
      setColor: () => {
        // Preserves authentic PBR textures without artificial color tinting
      },
      getCurrentWeapon: () => currentWeaponId
    };
  } catch (e) {
    console.warn('Three.js failed:', e);
    if (fallbackImg) {
      fallbackImg.style.opacity = '1';
      fallbackImg.style.display = 'block';
    }
    if (loaderEl) loaderEl.style.display = 'none';
    return null;
  }
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
    updateWeaponInCode: (weaponKey) => {
      const cfg = WEAPON_CONFIGS[weaponKey];
      if (!cfg) return;
      forgeFiles.weapon = `// FORMACT WEAPON CONFIGURATION
// Calibrate weapon parameters in real-time

const weapon = {
  name: "${cfg.name}",
  type: "${cfg.type}",
  damage: ${cfg.stats.damage},       // base damage
  range: ${cfg.stats.range.toFixed(1)},       // meters
  cooldown: ${cfg.stats.cooldown.toFixed(1)},    // seconds
  weight: ${cfg.stats.weight.toFixed(1)},     // kg
  element: "${weaponKey === 'gun' ? 'plasma' : weaponKey === 'shield' ? 'kinetic_barrier' : weaponKey === 'cannon' ? 'explosive' : 'energy'}",
  color: "${cfg.colorName}",
  special: {
    overclock: true,
    empBurst: ${weaponKey === 'shield' ? 'true' : 'false'}
  }
};

// Advanced telemetry calibration
weapon.trailIntensity = 0.85;
weapon.glow = true;
weapon.particles = "${weaponKey === 'gun' ? 'plasma_tracer' : weaponKey === 'shield' ? 'hex_field' : weaponKey === 'cannon' ? 'shockwave' : 'arc'}";`;

      if (activeFile === 'weapon') {
        textarea.value = forgeFiles.weapon;
        updateEditor();
      }
    },
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

  const weaponCards = document.querySelectorAll('.variant-item-card[data-weapon]');
  const forgeHammerImg = document.getElementById('forge-hammer-img');

  const numD = document.getElementById('forge-num-damage');
  const numR = document.getElementById('forge-num-range');
  const numC = document.getElementById('forge-num-cooldown');
  const numW = document.getElementById('forge-num-weight');

  const barD = document.getElementById('forge-bar-damage');
  const barR = document.getElementById('forge-bar-range');
  const barC = document.getElementById('forge-bar-cooldown');
  const barW = document.getElementById('forge-bar-weight');

  function updateStatsDisplay(stats) {
    if (stats.damage !== undefined && numD) {
      gsap.to(numD, { innerText: stats.damage, roundProps: 'innerText', duration: 0.45 });
      if (barD) gsap.to(barD, { width: Math.min(stats.damage, 100) + '%', duration: 0.45 });
    }
    if (stats.range !== undefined && numR) {
      numR.textContent = stats.range.toFixed(1);
      if (barR) gsap.to(barR, { width: Math.min((stats.range / 60) * 100, 100) + '%', duration: 0.45 });
    }
    if (stats.cooldown !== undefined && numC) {
      numC.textContent = stats.cooldown.toFixed(1);
      if (barC) gsap.to(barC, { width: Math.min((stats.cooldown / 4) * 100, 100) + '%', duration: 0.45 });
    }
    if (stats.weight !== undefined && numW) {
      numW.textContent = stats.weight.toFixed(1);
      if (barW) gsap.to(barW, { width: Math.min((stats.weight / 30) * 100, 100) + '%', duration: 0.45 });
    }
  }

  const editor = setupInteractiveForgeEditor(
    (color, updateCode = true) => {
      if (model3dViewer) {
        model3dViewer.setColor(color);
      }
    },
    (stats) => {
      updateStatsDisplay(stats);
    }
  );

  weaponCards.forEach(card => {
    card.addEventListener('mouseenter', () => sfx.play('hover'));
    card.addEventListener('click', () => {
      sfx.play('click');
      const weaponKey = card.getAttribute('data-weapon');
      weaponCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (model3dViewer) {
        model3dViewer.setWeapon(weaponKey);
      }
      if (editor) {
        editor.updateWeaponInCode(weaponKey);
      }
      const cfg = WEAPON_CONFIGS[weaponKey];
      if (cfg && cfg.stats) {
        updateStatsDisplay(cfg.stats);
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
  const track = document.getElementById('sanctuary-horizontal-track');
  if (!sanctuarySec || !track) return;

  const panels = gsap.utils.toArray('.world-slide-card');
  if (!panels.length) return;

  const progressFill = document.getElementById('sanctuary-scroll-fill');
  const indexEl = document.getElementById('sanctuary-world-index');
  const worldNameEl = document.getElementById('sanctuary-world-name');
  const coordsEl = document.getElementById('sanctuary-hud-coords');
  const sideNavItems = document.querySelectorAll('.side-nav-item');
  const cardItems = document.querySelectorAll('.world-card-item');

  const worldMeta = [
    {
      index: "WORLD 01 / 04",
      name: "ORBITAL PLATFORM",
      coords: "LOW EARTH ORBIT // ALT: 420 KM"
    },
    {
      index: "WORLD 02 / 04",
      name: "CYBER GRID",
      coords: "NEON CORE GRID // ALT: 12 M"
    },
    {
      index: "WORLD 03 / 04",
      name: "STRATO-DOME",
      coords: "MESOSPHERE APEX // ALT: 85 KM"
    },
    {
      index: "WORLD 04 / 04",
      name: "VOID CITADEL",
      coords: "DEEP SPACE VOID // ALT: UNBOUND"
    }
  ];

  let currentActive = 0;

  function updateActiveWorld(idx) {
    if (idx === currentActive && panels[idx] && panels[idx].classList.contains('active')) return;
    currentActive = idx;

    panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === idx);
    });

    sideNavItems.forEach((item, i) => {
      item.classList.toggle('active', i === idx);
    });

    cardItems.forEach((card, i) => {
      card.classList.toggle('active', i === idx);
    });

    const data = worldMeta[idx];
    if (data) {
      if (indexEl) indexEl.textContent = data.index;
      if (worldNameEl) worldNameEl.textContent = data.name;
      if (coordsEl) coordsEl.textContent = data.coords;
    }
  }

  // Calculate horizontal travel distance
  const getScrollDistance = () => track.scrollWidth - window.innerWidth;

  // Ultra-smooth pinned GSAP scrub timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sanctuarySec,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.45, // Silky smooth response synchronized with Lenis
      invalidateOnRefresh: true,
      anticipatePin: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (progressFill) {
          const pct = Math.min(100, Math.max(25, 25 + progress * 75));
          progressFill.style.width = `${pct}%`;
        }

        const activeIdx = Math.min(panels.length - 1, Math.round(progress * (panels.length - 1)));
        updateActiveWorld(activeIdx);
      }
    }
  });

  // Slide track horizontally
  tl.to(track, {
    x: () => -getScrollDistance(),
    ease: 'none'
  });

  // Parallax on card background images
  panels.forEach((panel) => {
    const bg = panel.querySelector('.world-card-bg');
    if (bg) {
      tl.to(bg, {
        xPercent: 8,
        ease: 'none'
      }, 0);
    }
  });

  // Initial state setup
  updateActiveWorld(0);
  if (progressFill) progressFill.style.width = '25%';

  // Smooth scroll handler for both side nav and bottom thumbnail cards
  const scrollToWorld = (idx) => {
    if (window.sfx) window.sfx.play('click');
    const st = tl.scrollTrigger;
    if (!st) return;

    const targetScroll = st.start + (idx / (panels.length - 1)) * (st.end - st.start);
    if (window.lenis) {
      window.lenis.scrollTo(targetScroll, { duration: 1.0 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  sideNavItems.forEach((item, i) => {
    item.addEventListener('mouseenter', () => window.sfx && window.sfx.play('hover'));
    item.addEventListener('click', () => scrollToWorld(i));
  });

  cardItems.forEach((card, i) => {
    card.addEventListener('mouseenter', () => window.sfx && window.sfx.play('hover'));
    card.addEventListener('click', () => scrollToWorld(i));
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

    // Footer Minimal Showcase Scroll Reveal ("AFTER 3 AM STUDIOS.")
    const creatorShowcase = document.getElementById('footer-creator-showcase');
    if (creatorShowcase) {
      ScrollTrigger.create({
        trigger: creatorShowcase,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.fromTo(creatorShowcase,
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
          );
          gsap.fromTo('.showcase-giant-text',
            { opacity: 0, scale: 0.96, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.15 }
          );
          gsap.fromTo('.floating-back-to-top',
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.35 }
          );
        }
      });
    }

    // Back to Top smooth scroll handlers
    const scrollToTopAction = (e) => {
      if (e) e.preventDefault();
      if (window.sfx) window.sfx.play('click');
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.3 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const footerBackToTopBtn = document.getElementById('footer-back-to-top-btn');
    if (footerBackToTopBtn) {
      footerBackToTopBtn.addEventListener('click', scrollToTopAction);
    }

    const floatingBackToTopBtn = document.getElementById('floating-back-to-top-btn');
    if (floatingBackToTopBtn) {
      floatingBackToTopBtn.addEventListener('click', scrollToTopAction);
    }

    // Auto-fit Giant Showcase Typography to container width
    const fitGiantShowcaseText = () => {
      const textEl = document.querySelector('.showcase-giant-text');
      const wrapEl = document.querySelector('.showcase-giant-wrap');
      if (!textEl || !wrapEl) return;

      const availableWidth = wrapEl.clientWidth;
      if (availableWidth <= 0) return;

      // On narrow mobile devices (< 540px), let CSS handle multi-line sizing
      if (window.innerWidth <= 540) {
        textEl.style.fontSize = '';
        return;
      }

      // Safe target width: 88% of container width for breathing room on both sides
      const targetWidth = availableWidth * 0.88;

      // Set temporary fixed test size to measure actual glyph metrics
      textEl.style.fontSize = '100px';
      const naturalWidth = textEl.scrollWidth;
      if (naturalWidth <= 0) return;

      const calculatedSize = Math.floor((targetWidth / naturalWidth) * 100);
      // Safe clamp between 24px and 125px
      const finalSize = Math.max(24, Math.min(125, calculatedSize));
      textEl.style.fontSize = `${finalSize}px`;
    };

    fitGiantShowcaseText();
    window.addEventListener('resize', fitGiantShowcaseText, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitGiantShowcaseText);
    }
  }

  // Default focus: Minimum tier (1080P) matching section6.png
  setFocusedColumn('min', false);
}

