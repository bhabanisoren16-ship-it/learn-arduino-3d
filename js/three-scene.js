// Hyper-Realistic 3D Viewport Engine for Arduino Uno R3 & Breadboard Workbench
// Color Palette & CAD Art Style exactly matching reference (media_1794627289844_4db23aac.jpg)

class Arduino3DWorkbench {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 3D Groups
    this.boardGroup = null;
    this.breadboardGroup = null;
    this.componentsGroup = null;
    this.wiresGroup = null;

    this.activeLesson = null;
    this.animationFrameId = null;

    // Component meshes for dynamic animation
    this.ledMesh = null;
    this.ledLight = null;
    this.onLed = null;
    this.lLed = null;
    this.txLed = null;
    this.rxLed = null;
    this.potKnobMesh = null;
    this.potIsDragging = false;
    this.potCurrentAngle = 0; // 0 to 1023
    this.servoArmMesh = null;
    this.motorFanMesh = null;
    this.trafficLeds = { red: null, yellow: null, green: null };
    this.buttonMesh = null;

    // Pin 3D locations dictionary for wire routing & dynamic HUD callouts
    this.pinPositions = {};
    this.calloutTargets = {};

    this.init();
  }

  init() {
    if (!this.container) return;

    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 600;

    // 1. Scene & Warm Parchment Canvas Background (Transparent to show paper canvas & circuit traces)
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // 2. Camera setup - Isometric CAD Perspective (Low FOV 32 deg matching reference)
    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1000);
    this.camera.position.set(-2.0, 27.0, 29.0);
    this.camera.lookAt(0.5, 1.0, 0);

    // 3. WebGL Renderer with High-Precision Soft Shadows & Filmic Tone Mapping
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.04;
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);
    } catch (e) {
      console.error("WebGL init failed:", e);
      return;
    }

    // 4. OrbitControls with smooth damping and gentle zoom speed
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.zoomSpeed = 0.4; // Gentle, slower, fine-grained zooming
      this.controls.maxPolarAngle = Math.PI / 2 - 0.06;
      this.controls.minDistance = 14;
      this.controls.maxDistance = 55;
      this.controls.target.set(0, 1.0, 0);
    }

    // 5. Studio Three-Point Lighting with Diffuse Penumbra Shadows
    this.setupLighting();

    // 6. Radiant Studio Environment Map (IBL for realistic specular metallic highlights)
    this.createStudioEnvironment();

    // 7. Workbench Surface Grid & Soft Contact Shadows
    this.setupWorkbenchTable();

    // 8. Groups
    this.boardGroup = new THREE.Group();
    this.breadboardGroup = new THREE.Group();
    this.componentsGroup = new THREE.Group();
    this.wiresGroup = new THREE.Group();

    this.scene.add(this.boardGroup);
    this.scene.add(this.breadboardGroup);
    this.scene.add(this.componentsGroup);
    this.scene.add(this.wiresGroup);

    // Build models matching reference
    this.buildArduinoUnoR3();
    this.buildBreadboard();

    // Setup Interactive Potentiometer Mouse Rotation
    this.setupPotentiometerInteraction();

    // Setup Keyboard Navigation
    this.setupKeyboardControls();

    // Resize listener
    window.addEventListener('resize', () => this.onWindowResize());

    // Start 60fps render loop
    this.animate();
  }

  setupLighting() {
    // 1. Balanced warm hemisphere light for ambient fill without desaturating deep colors
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0xa8967f, 0.44);
    this.scene.add(hemiLight);

    // 2. High-precision Key Sunlight casting crisp, natural shadows with soft contact penumbra
    // Positioned at top-left-back (-18, 36, -14) so light travels down-right-forward,
    // casting prominent soft shadows towards the bottom-right across breadboard and table grid (matching reference).
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.20);
    keyLight.position.set(-18, 36, -14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.radius = 2.4;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 95;
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    this.scene.add(keyLight);

    // 3. Subtle Cool Fill Light from opposite corner for rich volumetric 3D contrast
    const fillLight = new THREE.DirectionalLight(0x9fbcd8, 0.32);
    fillLight.position.set(24, 20, 24);
    this.scene.add(fillLight);

    // 4. Back Specular Rim Light to catch metallic glints on USB shell, DC jack, crystal, and header pins
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
    rimLight.position.set(-8, 22, -26);
    this.scene.add(rimLight);
  }

  createStudioEnvironment() {
    if (!this.renderer || typeof THREE.PMREMGenerator === 'undefined') return;
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const skyGeo = new THREE.SphereGeometry(100, 32, 16);
      // Neutral dark studio dome so ambient reflections provide metallic glints without washing out colors
      const skyMat = new THREE.MeshBasicMaterial({ color: 0x141822, side: THREE.BackSide });
      envScene.add(new THREE.Mesh(skyGeo, skyMat));

      // Key Warm Softbox Studio Panel
      const p1 = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshBasicMaterial({ color: 0xfff3e0, side: THREE.DoubleSide })
      );
      p1.position.set(-45, 50, 40);
      p1.lookAt(0, 0, 0);
      envScene.add(p1);

      // Cool Rim Softbox Panel
      const p2 = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.DoubleSide })
      );
      p2.position.set(45, 35, -35);
      p2.lookAt(0, 0, 0);
      envScene.add(p2);

      // Top Specular Strip Panel
      const p3 = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 25),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      p3.position.set(0, 75, 0);
      p3.rotation.x = Math.PI / 2;
      envScene.add(p3);

      const envTex = pmrem.fromScene(envScene, 0.04).texture;
      this.scene.environment = envTex;
      pmrem.dispose();
    } catch (e) {
      console.warn("Studio environment setup skipped:", e);
    }
  }

  createContactShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 248);
    grad.addColorStop(0, 'rgba(122, 85, 50, 0.40)');
    grad.addColorStop(0.35, 'rgba(122, 85, 50, 0.20)');
    grad.addColorStop(0.72, 'rgba(122, 85, 50, 0.05)');
    grad.addColorStop(1, 'rgba(122, 85, 50, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  setupWorkbenchTable() {
    // 1. Transparent Shadow Receiver Ground Plane (Matches reference app: ShadowMaterial with #7a5532 warm shadow)
    const shadowGeo = new THREE.PlaneGeometry(600, 600);
    const shadowMat = new THREE.ShadowMaterial({
      color: 0x7a5532,
      opacity: 0.32,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    shadowMesh.receiveShadow = true;
    shadowMesh.renderOrder = -1;
    this.scene.add(shadowMesh);

    // 2. Procedural Anti-Aliased Grid Plane with Smooth Radial Vignette (Matches reference app Vs() shader)
    const gridGeo = new THREE.PlaneGeometry(600, 600);
    const gridMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      extensions: { derivatives: true },
      uniforms: {
        color: { value: new THREE.Color('#d9c7ae') },
        cell: { value: 3.2 },
        center: { value: new THREE.Vector2(0, 0) },
        inner: { value: 24.0 },
        outer: { value: 65.0 },
        strength: { value: 0.90 }
      },
      vertexShader: `
        varying vec2 vPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPos = wp.xz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float cell;
        uniform vec2 center;
        uniform float inner;
        uniform float outer;
        uniform float strength;
        varying vec2 vPos;
        void main() {
          vec2 g = abs(fract(vPos / cell - 0.5) - 0.5) / fwidth(vPos / cell);
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          vec2 q = (vPos - center) / vec2(1.25, 1.0);
          float fade = 1.0 - smoothstep(inner, outer, length(q));
          float a = line * fade * strength;
          gl_FragColor = vec4(color, a);
        }
      `
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = 0.005;
    gridMesh.renderOrder = -2;
    this.scene.add(gridMesh);

    // 3. Subtle Soft Ground Contact Ambient Occlusion Under Boards
    const aoTex = this.createContactShadowTexture();
    const aoMat = new THREE.MeshBasicMaterial({
      map: aoTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    const unoAo = new THREE.Mesh(new THREE.PlaneGeometry(17.5, 23.5), aoMat);
    unoAo.rotation.x = -Math.PI / 2;
    unoAo.position.set(-9.5, 0.008, 0.6);
    this.scene.add(unoAo);

    const bbAo = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 25.5), aoMat);
    bbAo.rotation.x = -Math.PI / 2;
    bbAo.position.set(9.5, 0.008, 0.6);
    this.scene.add(bbAo);
  }

  // =========================================================================
  // HIGH-RESOLUTION PROCEDURAL SILKSCREEN CANVAS GENERATORS (2048 x 2048)
  // =========================================================================

    generateUnoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 4096;
    const ctx = canvas.getContext('2d');

    // 1. Exact Rich Italian Arduino Royal Blue Solder Mask (#3B4E85 / #42558F)
    ctx.fillStyle = '#3B4E85';
    ctx.fillRect(0, 0, 4096, 4096);

    // 2. Copper Ground Pour Hatch Grid Pattern & Route Traces
    ctx.fillStyle = '#26345D';
    for (let x = 0; x < 4096; x += 88) {
      ctx.fillRect(x, 0, 5, 4096);
    }
    for (let y = 0; y < 4096; y += 88) {
      ctx.fillRect(0, y, 4096, 5);
    }

    // Ground plane copper clearance zones
    ctx.fillStyle = '#2C3B6A';
    ctx.fillRect(1560, 2040, 960, 1800); // IC socket zone
    ctx.fillRect(140, 360, 520, 3320);   // Digital headers zone
    ctx.fillRect(3380, 1120, 560, 2600); // Power & Analog zone

    // 3. Sub-surface Routed Copper Traces (Gives genuine depth under solder mask)
    ctx.strokeStyle = '#5268A6';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Digital bus traces from IC to digital header
    for (let i = 0; i < 14; i++) {
      const startY = 2240 + i * 115;
      const endY = 880 + i * 166;
      ctx.beginPath();
      ctx.moveTo(1560, startY);
      ctx.lineTo(1100 - i * 20, startY);
      ctx.lineTo(820, endY);
      ctx.lineTo(580, endY);
      ctx.stroke();
    }

    // Analog bus traces from IC to analog header
    for (let i = 0; i < 6; i++) {
      const startY = 3200 + i * 90;
      const endY = 3010 + i * 166;
      ctx.beginPath();
      ctx.moveTo(2520, startY);
      ctx.lineTo(2950 + i * 24, startY);
      ctx.lineTo(3180, endY);
      ctx.lineTo(3480, endY);
      ctx.stroke();
    }

    // Dual 16 MHz Clock Traces to Crystal Pads
    ctx.strokeStyle = '#18477F';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(1560, 2380);
    ctx.lineTo(1520, 2260);
    ctx.lineTo(1520, 1260);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1560, 2440);
    ctx.lineTo(1580, 2260);
    ctx.lineTo(1580, 1260);
    ctx.stroke();

    // Reset line trace from tactile switch to pin 1
    ctx.beginPath();
    ctx.moveTo(560, 1360);
    ctx.lineTo(880, 1360);
    ctx.lineTo(1560, 2160);
    ctx.stroke();

    // 4. Gold-Plated Mounting Holes with Precision Annular Rings & Clearance Relief
    const mountHoles = [
      { x: 380, y: 440 },    // Top-left near USB
      { x: 3560, y: 760 },   // Top-right near DC jack
      { x: 380, y: 3760 },   // Bottom-left
      { x: 3640, y: 3360 }   // Bottom-right
    ];
    mountHoles.forEach(h => {
      // Outer Gold Annular Ring with subtle gradient
      const goldGrad = ctx.createRadialGradient(h.x, h.y, 40, h.x, h.y, 144);
      goldGrad.addColorStop(0, '#F59E0B');
      goldGrad.addColorStop(0.7, '#D97706');
      goldGrad.addColorStop(1, '#B45309');

      ctx.beginPath();
      ctx.arc(h.x, h.y, 144, 0, Math.PI * 2);
      ctx.fillStyle = goldGrad;
      ctx.fill();

      // Solder Mask Clearance Ring
      ctx.beginPath();
      ctx.arc(h.x, h.y, 108, 0, Math.PI * 2);
      ctx.fillStyle = '#854D0E';
      ctx.fill();

      // Center Plated Through-Hole (Dark cavity void)
      ctx.beginPath();
      ctx.arc(h.x, h.y, 76, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();

      // Surrounding Via Stitching Pattern (6 gold vias)
      for (let v = 0; v < 6; v++) {
        const vAngle = (v * Math.PI * 2) / 6;
        const vx = h.x + Math.cos(vAngle) * 195;
        const vy = h.y + Math.sin(vAngle) * 195;
        ctx.beginPath();
        ctx.arc(vx, vy, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vx, vy, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
      }
    });

    // 5. White Silkscreen Typography & Official Vector Graphics (#FFFFFF)
    const logoX = 2880;
    const logoY = 1950;
    const logoR = 92;

    // Official Arduino Teal Disc with Infinity Loop
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
    ctx.fillStyle = '#00878F';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // White infinity loop (- +) inside the teal disc
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(logoX - 32, logoY, 28, 0, Math.PI * 2);
    ctx.arc(logoX + 32, logoY, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('-', logoX - 32, logoY - 2);
    ctx.fillText('+', logoX + 32, logoY - 2);

    // Brand Name: ARDUINO
    ctx.font = 'bold 96px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ARDUINO', logoX, 2116);

    // Model Badge: UNO in rounded box
    ctx.font = '900 156px Inter, -apple-system, sans-serif';
    ctx.fillText('UNO', logoX, 2280);

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#FFFFFF';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(logoX - 230, 2152, 460, 152, 20);
      ctx.stroke();
    } else {
      ctx.strokeRect(logoX - 230, 2152, 460, 152);
    }

    // Origin Stamp & Hardware Architecture
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('MADE IN ITALY', logoX, 2368);
    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('ATMEGA328P', logoX, 2410);

    // 6. Digital Header Silkscreen Labels (Left Edge)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 88px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIGITAL (PWM ~)', 560, 350);

    const digPins = [
      'SCL', 'SDA', 'AREF', 'GND',
      '13', '12', '~11', '~10', '~9', '8',
      '7', '~6', '~5', '4', '~3', '2', 'TX>1', 'RX<0'
    ];
    ctx.font = 'bold 76px monospace';
    digPins.forEach((pin, idx) => {
      const y = 540 + idx * 166;
      ctx.fillText(pin, 540, y);
      ctx.fillRect(450, y - 36, 44, 18);
    });

    // 7. Power Header Silkscreen Labels (Right Edge Top)
    ctx.textAlign = 'right';
    ctx.font = 'bold 88px monospace';
    ctx.fillText('POWER', 3360, 1300);

    const pwrPins = ['IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN'];
    ctx.font = 'bold 76px monospace';
    pwrPins.forEach((pin, idx) => {
      const y = 1480 + idx * 166;
      ctx.fillText(pin, 3360, y);
      ctx.fillRect(3430, y - 36, 44, 18);
    });

    // 8. Analog Header Silkscreen Labels (Right Edge Bottom)
    ctx.font = 'bold 88px monospace';
    ctx.fillText('ANALOG IN', 3360, 2840);

    const anaPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
    ctx.font = 'bold 80px monospace';
    anaPins.forEach((pin, idx) => {
      const y = 3010 + idx * 166;
      ctx.fillText(pin, 3360, y);
      ctx.fillRect(3430, y - 36, 44, 18);
    });

    // 9. SMD Status LEDs Silkscreen Labels (L, TX, RX, ON)
    ctx.textAlign = 'left';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('L', 1280, 1780);
    ctx.fillText('TX', 1280, 1940);
    ctx.fillText('RX', 1280, 2100);
    ctx.fillText('ON', 1280, 2260);

    // 10. ATmega328P IC Silkscreen Footprint Box & Pin 1 Semicircle
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.strokeRect(1680, 2160, 720, 1600);
    ctx.beginPath();
    ctx.arc(2040, 2160, 84, 0, Math.PI);
    ctx.stroke();

    // Pin 1 Indexing Dot
    ctx.beginPath();
    ctx.arc(1760, 2250, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // 11. Footprint Outlines for USB, DC, Reset, and Crystal
    ctx.lineWidth = 12;
    ctx.strokeRect(200, 120, 960, 760);  // USB Type-B jack
    ctx.strokeRect(2880, 120, 960, 920); // DC Power Jack
    ctx.lineWidth = 10;
    ctx.strokeRect(320, 1040, 440, 440); // Reset button
    ctx.fillText('RESET', 330, 1560);

    // Crystal oval outline (aligned directly under 3D HC-49/S crystal at X=1520, Y=1126)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(1520, 1126, 130, 280, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('16.000', 1520, 1136);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.encoding = THREE.sRGBEncoding;
    if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  generateBreadboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 4096;
    const ctx = canvas.getContext('2d');

    // 1. Clean Warm Parchment ABS Plastic Base (#EBE3D2)
    ctx.fillStyle = '#EBE3D2';
    ctx.fillRect(0, 0, 4096, 4096);

    // Subtle beveled outer border outline
    ctx.strokeStyle = '#706652';
    ctx.lineWidth = 20;
    ctx.strokeRect(32, 32, 4032, 4032);

    ctx.strokeStyle = '#B8AE9A';
    ctx.lineWidth = 12;
    ctx.strokeRect(52, 52, 3992, 3992);

    // 2. Realistic 3D Recessed Center DIP Divider Trench
    ctx.fillStyle = '#706652';
    ctx.fillRect(1972, 72, 152, 3952);
    ctx.fillStyle = '#1E1A14';
    ctx.fillRect(2012, 72, 72, 3952);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2108, 72, 12, 3952);

    // 3. Power Bus Rails (Crisp 28px Stripes in Red #D64A3A and Blue #3D6FC4)
    // Left Power Bus
    ctx.fillStyle = '#D64A3A';
    ctx.fillRect(144, 120, 28, 3856); // Outer Red Line (+)
    ctx.fillStyle = '#3D6FC4';
    ctx.fillRect(490, 120, 28, 3856); // Inner Blue Line (-)

    // Right Power Bus
    ctx.fillStyle = '#3D6FC4';
    ctx.fillRect(3580, 120, 28, 3856); // Inner Blue Line (-)
    ctx.fillStyle = '#D64A3A';
    ctx.fillRect(3926, 120, 28, 3856); // Outer Red Line (+)

    // Clean Plus (+) and Minus (-) Polarity Symbols at Top, Middle & Bottom
    ctx.font = '900 136px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    [210, 1380, 2560, 3930].forEach(y => {
      ctx.fillStyle = '#D64A3A';
      ctx.fillText('+', 158, y);
      ctx.fillText('+', 3940, y);

      ctx.fillStyle = '#3D6FC4';
      ctx.fillText('−', 504, y);
      ctx.fillText('−', 3594, y);
    });

    // 4. Column Letter Headers (a b c d e | f g h i j) - Technical Slate #334155
    const colXLeft = [820, 1040, 1260, 1480, 1700];
    const colXRight = [2396, 2616, 2836, 3056, 3276];
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

    ctx.font = 'bold 88px "Inter", -apple-system, sans-serif';
    ctx.fillStyle = '#334155';

    colXLeft.forEach((x, i) => {
      ctx.fillText(colLetters[i], x, 192);
      ctx.fillText(colLetters[i], x, 3920);
    });
    colXRight.forEach((x, i) => {
      ctx.fillText(colLetters[i + 5], x, 192);
      ctx.fillText(colLetters[i + 5], x, 3920);
    });

    // 5. 30 Rows of Precision Solderless Breadboard Sockets
    for (let r = 0; r < 30; r++) {
      const y = 320 + r * 118;

      // Row Numbers on Outer Margins (Beside Col 'a' and Col 'j') - Clean Monospace #475569
      if ((r + 1) % 5 === 0 || r === 0) {
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 72px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(String(r + 1), 690, y + 24);
        ctx.textAlign = 'left';
        ctx.fillText(String(r + 1), 3410, y + 24);
      }

      // 10 Terminal Holes per Row + 4 Power Bus Holes
      const allHoles = [
        270, 430,          // Left power bus (+, -)
        ...colXLeft,       // Columns a..e
        ...colXRight,      // Columns f..j
        3666, 3826         // Right power bus (-, +)
      ];

      allHoles.forEach(hx => {
        // 1. Subtle beveled outer recess
        ctx.fillStyle = '#E1D7C4';
        ctx.fillRect(hx - 28, y - 28, 56, 56);

        // 2. Deep dark socket cavity
        ctx.fillStyle = '#14171E';
        ctx.fillRect(hx - 20, y - 20, 40, 40);

        // 3. Metallic nickel-silver phosphor bronze leaf spring contacts
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(hx - 10, y - 6, 20, 12);
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(hx - 8, y - 5, 16, 4);

        // 4. Center contact pin void
        ctx.fillStyle = '#080A0E';
        ctx.fillRect(hx - 4, y - 8, 8, 16);
      });
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.encoding = THREE.sRGBEncoding;
    if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  // =========================================================================
  // ARDUINO UNO R3 MODEL (Exact Colors & PBR Realism)
  // =========================================================================

  buildArduinoUnoR3() {
    this.boardGroup.position.set(-9.5, 0.35, 0);

    // 0. Rubber Standoff Feet Under Mounting Holes
    const footMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.85 });
    const footGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16);
    const footPositions = [
      { x: -5.7, z: -8.0 },
      { x: 5.4, z: -6.8 },
      { x: -5.7, z: 8.5 },
      { x: 5.7, z: 6.8 }
    ];
    footPositions.forEach(pos => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(pos.x, -0.175, pos.z);
      foot.castShadow = true;
      this.boardGroup.add(foot);
    });

    // 1. PCB Solid Body - Cream/Tan FR-4 Fiberglass Core Edge (#2A2824)
    const pcbBodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a2824,
      roughness: 0.8,
      metalness: 0.0
    });

    const pcbGeo = new THREE.BoxGeometry(14, 0.6, 20);
    const pcb = new THREE.Mesh(pcbGeo, pcbBodyMat);
    pcb.position.y = 0.3;
    pcb.castShadow = true;
    pcb.receiveShadow = true;

    // Dark cel-shaded edge contour outline
    const pcbEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(pcbGeo),
      new THREE.LineBasicMaterial({ color: 0x101318, transparent: true, opacity: 0.65 })
    );
    pcb.add(pcbEdges);
    this.boardGroup.add(pcb);

    // 2. High-Precision Vector Silkscreen Top Plate with Satin Solder Mask Finish
    const unoTexture = this.generateUnoTexture();
    const pcbTopMat = new THREE.MeshStandardMaterial({
      map: unoTexture,
      roughness: 0.44,
      metalness: 0.04
    });

    const silkscreenPlate = new THREE.Mesh(new THREE.PlaneGeometry(14, 20), pcbTopMat);
    silkscreenPlate.rotation.x = -Math.PI / 2;
    silkscreenPlate.position.y = 0.605;
    silkscreenPlate.receiveShadow = true;
    this.boardGroup.add(silkscreenPlate);

    // 3. USB Type-B Port - Brushed Stainless Steel with Chamfered Upper Corners, Latches & Contacts
    const usbGroup = new THREE.Group();
    usbGroup.position.set(-4.5, 1.7, -8.6);

    const usbMat = new THREE.MeshStandardMaterial({
      color: 0xd2d0c8,
      roughness: 0.18,
      metalness: 0.88
    });

    const usbShell = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 4.0), usbMat);
    usbShell.castShadow = true;
    usbShell.receiveShadow = true;

    const usbEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(usbShell.geometry),
      new THREE.LineBasicMaterial({ color: 0x1e242b, transparent: true, opacity: 0.55 })
    );
    usbShell.add(usbEdges);
    usbGroup.add(usbShell);

    // Top Chamfer Corners Detail
    const chamferMat = new THREE.MeshStandardMaterial({ color: 0xbbb8b0, roughness: 0.22, metalness: 0.82 });
    [-1.65, 1.65].forEach(cx => {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 4.02), chamferMat);
      ch.position.set(cx, 1.35, 0);
      ch.rotation.z = Math.PI / 4;
      usbGroup.add(ch);
    });

    // Top Spring Latch Detents (2 rectangular notches on top)
    const latchDetentMat = new THREE.MeshStandardMaterial({ color: 0x8a8780, roughness: 0.4, metalness: 0.6 });
    [-0.75, 0.75].forEach(lx => {
      const detent = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.85), latchDetentMat);
      detent.position.set(lx, 1.51, -0.6);
      usbGroup.add(detent);
    });

    // Dark cavity interior (#111317)
    const cavityMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.95 });
    const cavity = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 0.5), cavityMat);
    cavity.position.set(0, 0, -2.01);
    usbGroup.add(cavity);

    // White nylon tongue inside
    const tongueMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 1.8), tongueMat);
    tongue.position.set(0, -0.25, -1.2);
    usbGroup.add(tongue);

    // 4 Gold Spring Contact Pins on tongue
    const goldContactMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.15 });
    [-0.6, -0.2, 0.2, 0.6].forEach(px => {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.2), goldContactMat);
      pin.position.set(px, -0.06, -1.2);
      usbGroup.add(pin);
    });

    this.boardGroup.add(usbGroup);

    // 4. DC Power Barrel Jack - Deep Textured Black (#121418) with Center Gold Pin
    const dcGroup = new THREE.Group();
    dcGroup.position.set(4.5, 1.6, -8.4);

    const dcMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.8 });
    const dcBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 4.4), dcMat);
    dcBody.castShadow = true;

    const dcEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(dcBody.geometry),
      new THREE.LineBasicMaterial({ color: 0x07080a, transparent: true, opacity: 0.65 })
    );
    dcBody.add(dcEdges);
    dcGroup.add(dcBody);

    const barrelCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.6 })
    );
    barrelCollar.rotation.x = Math.PI / 2;
    barrelCollar.position.set(0, 0, -2.21);
    dcGroup.add(barrelCollar);

    const barrelHole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.52, 24),
      new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.95 })
    );
    barrelHole.rotation.x = Math.PI / 2;
    barrelHole.position.set(0, 0, -2.22);
    dcGroup.add(barrelHole);

    // Center Gold Pin
    const pinCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 })
    );
    pinCenter.rotation.x = Math.PI / 2;
    pinCenter.position.set(0, 0, -1.6);
    dcGroup.add(pinCenter);

    this.boardGroup.add(dcGroup);

    // 5. ATmega328P DIP-28 IC in Dual-Wipe Socket
    const icGroup = new THREE.Group();
    icGroup.position.set(0.5, 0.6, 3.0);

    const socket = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.45, 9.4),
      new THREE.MeshStandardMaterial({ color: 0x0e1013, roughness: 0.9 })
    );
    socket.position.y = 0.22;
    icGroup.add(socket);

    const icMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.72 });
    const ic = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 9.0), icMat);
    ic.position.y = 0.65;
    ic.castShadow = true;
    icGroup.add(ic);

    const notch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16, 1, false, 0, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x0b0d10 })
    );
    notch.position.set(0, 1.03, -4.3);
    icGroup.add(notch);

    // Pin 1 Circular Dot Indent
    const dotIndent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12),
      new THREE.MeshBasicMaterial({ color: 0x0b0d10 })
    );
    dotIndent.position.set(-0.8, 1.03, -4.0);
    icGroup.add(dotIndent);

    // Laser-etched text label on top of IC
    const icLabelCanvas = document.createElement('canvas');
    icLabelCanvas.width = 256;
    icLabelCanvas.height = 1024;
    const ictx = icLabelCanvas.getContext('2d');
    ictx.clearRect(0, 0, 256, 1024);
    ictx.save();
    ictx.translate(128, 512);
    ictx.rotate(-Math.PI / 2);
    ictx.fillStyle = '#E2E8F0';
    ictx.font = 'bold 64px monospace';
    ictx.textAlign = 'center';
    ictx.fillText('ATMEGA328P-PU', 0, 4);
    ictx.font = 'bold 38px monospace';
    ictx.fillStyle = '#94A3B8';
    ictx.fillText('ATMEL  2248', 0, 52);
    ictx.restore();

    const icLabelTex = new THREE.CanvasTexture(icLabelCanvas);
    const icLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 7.2),
      new THREE.MeshStandardMaterial({
        map: icLabelTex,
        transparent: true,
        depthWrite: false,
        roughness: 0.65,
        metalness: 0.05
      })
    );
    icLabelMesh.rotation.x = -Math.PI / 2;
    icLabelMesh.position.set(0, 1.035, 0);
    icGroup.add(icLabelMesh);

    // Silver dual-wipe pins
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xa0a5af, metalness: 0.7, roughness: 0.25 });
    for (let i = -4.0; i <= 4.0; i += 0.62) {
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.22), pinMat);
      leg1.position.set(-1.05, 0.35, i);
      icGroup.add(leg1);

      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.22), pinMat);
      leg2.position.set(1.05, 0.35, i);
      icGroup.add(leg2);
    }
    this.boardGroup.add(icGroup);

    // 6. 16 MHz Silver Metal Canister Crystal (HC-49/S) - Polished Nickel Can
    const oscGroup = new THREE.Group();
    oscGroup.position.set(-1.8, 0.95, -4.5);

    // Dark neoprene insulating spacer underneath
    const spacer = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.15, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.9 })
    );
    spacer.position.y = -0.3;
    oscGroup.add(spacer);

    const oscMat = new THREE.MeshStandardMaterial({ color: 0xdadfe8, metalness: 0.88, roughness: 0.16 });
    const oscBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 2.0), oscMat);
    oscBody.castShadow = true;
    oscGroup.add(oscBody);

    const oscEnd1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.7, 16), oscMat);
    oscEnd1.position.z = -1.0;
    oscGroup.add(oscEnd1);

    const oscEnd2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.7, 16), oscMat);
    oscEnd2.position.z = 1.0;
    oscGroup.add(oscEnd2);

    this.boardGroup.add(oscGroup);

    // 7. Dual Aluminum Capacitors - Authentic Dark Navy Sleeve, Spun Top & Embossed Cross Score Vent '+'
    const buildCapacitor = (cx, cz) => {
      const capGrp = new THREE.Group();
      capGrp.position.set(cx, 1.4, cz);

      // Dark vinyl shrink-wrap cylinder sleeve
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.65 });
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.55, 32), sleeveMat);
      sleeve.castShadow = true;
      capGrp.add(sleeve);

      // Negative polarity vertical stripe along one side
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xdde2ea, roughness: 0.4 });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.56, 0.08), stripeMat);
      stripe.position.set(0.78, 0, 0);
      capGrp.add(stripe);

      // Spun aluminum top cap disc
      const alumMat = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 0.85, roughness: 0.22 });
      const topDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.08, 32), alumMat);
      topDisc.position.y = 0.8;
      topDisc.castShadow = true;
      capGrp.add(topDisc);

      // Embossed cross score relief vent '+' on top
      const ventMat = new THREE.MeshStandardMaterial({ color: 0x9499a3, metalness: 0.6, roughness: 0.4 });
      const vent1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.2), ventMat);
      vent1.position.y = 0.845;
      capGrp.add(vent1);
      const vent2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.08), ventMat);
      vent2.position.y = 0.845;
      capGrp.add(vent2);

      return capGrp;
    };

    this.boardGroup.add(buildCapacitor(2.0, -4.8));
    this.boardGroup.add(buildCapacitor(2.0, -2.5));

    // 8. 5V Voltage Regulator (DPAK)
    const vreg = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 1.6), new THREE.MeshStandardMaterial({ color: 0x1e2025, roughness: 0.7 }));
    vreg.position.set(4.5, 0.88, -4.5);
    this.boardGroup.add(vreg);

    const vregTab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.6), new THREE.MeshStandardMaterial({ color: 0xceccc4, metalness: 0.3 }));
    vregTab.position.set(4.5, 0.98, -5.4);
    this.boardGroup.add(vregTab);

    // 9. Reset Tactile Pushbutton - Deep Crimson Red Actuator (#A81C1C)
    const btnBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.4), new THREE.MeshStandardMaterial({ color: 0xd5d2ca, roughness: 0.5 }));
    btnBase.position.set(-5.2, 0.85, -4.5);
    const btnCap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xa81c1c, roughness: 0.4 }));
    btnCap.position.set(-5.2, 1.35, -4.5);
    btnCap.name = "ArduinoResetButton";
    this.resetButtonMesh = btnCap;
    this.boardGroup.add(btnBase);
    this.boardGroup.add(btnCap);

    // 10. ATmega16U2 USB SMD Chip
    const u2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), new THREE.MeshStandardMaterial({ color: 0x181a1d }));
    u2.position.set(-1.8, 0.78, -7.5);
    this.boardGroup.add(u2);

    // 11. ICSP Gold Pin Headers
    this.buildICSPHeader(6.0, 3.0);
    this.buildICSPHeader(-1.8, -9.2);

    // 12. SMD Status LEDs (ON, L, TX, RX)
    const ledMat = (col, emitCol) => new THREE.MeshStandardMaterial({
      color: col,
      emissive: emitCol,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    this.onLed = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.28), ledMat(0x22c55e, 0x16a34a));
    this.onLed.position.set(-2.8, 0.75, 1.2);
    this.boardGroup.add(this.onLed);

    this.lLed = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.28), ledMat(0xfbbf24, 0xd97706));
    this.lLed.position.set(-2.8, 0.75, -1.2);
    this.boardGroup.add(this.lLed);

    this.txLed = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.28), ledMat(0x60a5fa, 0x2563eb));
    this.txLed.position.set(-2.8, 0.75, -0.4);
    this.boardGroup.add(this.txLed);

    this.rxLed = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.28), ledMat(0x60a5fa, 0x2563eb));
    this.rxLed.position.set(-2.8, 0.75, 0.4);
    this.boardGroup.add(this.rxLed);

    // 13. Deep Charcoal Pin Headers (#1E2024)
    this.buildHeaderStrip(-6.2, 8.5, 10, "Digital_High", ["D13", "D12", "D11", "D10", "D9", "D8", "GND_DIG", "AREF", "SDA", "SCL"]);
    this.buildHeaderStrip(-6.2, -1.2, 8, "Digital_Low", ["D7", "D6", "D5", "D4", "D3", "D2", "D1", "D0"]);
    this.buildHeaderStrip(6.2, -2.5, 8, "Power", ["VIN", "GND2", "GND1", "5V", "3.3V", "RESET_PIN", "IOREF", "NC"]);
    this.buildHeaderStrip(6.2, 4.5, 6, "Analog", ["A0", "A1", "A2", "A3", "A4", "A5"]);

    this.calloutTargets["PIN_PWM"] = this.pinPositions["Uno.D9"];
    this.calloutTargets["PIN_A0"] = this.pinPositions["Uno.A0"];
  }

buildICSPHeader(x, z) {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.7, roughness: 0.3 });
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), goldMat);
        pin.position.set(x + (c - 0.5) * 0.5, 0.9, z + (r - 1) * 0.5);
        this.boardGroup.add(pin);
      }
    }
  }

  buildHeaderStrip(x, zStart, count, label, pinNames) {
    const headerMat = new THREE.MeshStandardMaterial({ color: 0x1e222d, roughness: 0.5 });
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x080a10, roughness: 0.95 });
    const springMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.8, roughness: 0.25 });

    const step = 0.85;
    for (let i = 0; i < count; i++) {
      const z = zStart - i * step;

      const socket = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.4, 0.8), headerMat);
      socket.position.set(x, 1.3, z);
      socket.castShadow = true;
      socket.receiveShadow = true;
      this.boardGroup.add(socket);

      const hole = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.45), holeMat);
      hole.position.set(x, 2.01, z);
      this.boardGroup.add(hole);

      const spring = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.25), springMat);
      spring.position.set(x, 1.95, z);
      this.boardGroup.add(spring);

      const pName = pinNames[i] || `${label}_${i}`;
      const pos = new THREE.Vector3(
        this.boardGroup.position.x + x,
        this.boardGroup.position.y + 1.85,
        this.boardGroup.position.z + z
      );
      this.pinPositions[`Uno.${pName}`] = pos;

      // Register Uno header pin aliases
      if (pName === 'GND1' || pName === 'GND2' || pName === 'GND_DIG') {
        if (!this.pinPositions['Uno.GND']) this.pinPositions['Uno.GND'] = pos;
      }
      if (pName === 'D9') {
        this.pinPositions['Uno.~9'] = pos;
        this.pinPositions['Uno.~D9'] = pos;
      }
      if (pName === 'D10') this.pinPositions['Uno.~10'] = pos;
      if (pName === 'D11') this.pinPositions['Uno.~11'] = pos;
      if (pName === 'D6') this.pinPositions['Uno.~6'] = pos;
      if (pName === 'D5') this.pinPositions['Uno.~5'] = pos;
      if (pName === 'D3') this.pinPositions['Uno.~3'] = pos;
    }
  }

  // =========================================================================
  // SOLDERLESS BREADBOARD MODEL (#DDD7C8 side edge & #F7F5EE top)
  // =========================================================================

    getBreadboardHole(row, col = 'e') {
    const colXMap = {
      'plus_left': 270, 'minus_left': 430,
      'a': 820, 'b': 1040, 'c': 1260, 'd': 1480, 'e': 1700,
      'f': 2396, 'g': 2616, 'h': 2836, 'i': 3056, 'j': 3276,
      'minus_right': 3666, 'plus_right': 3826
    };
    const bbX = this.breadboardGroup ? this.breadboardGroup.position.x : 9.5;
    const bbY = (this.breadboardGroup ? this.breadboardGroup.position.y : 0.35) + 0.812;
    const bbZ = this.breadboardGroup ? this.breadboardGroup.position.z : 0;

    const texX = colXMap[col] || 1700;
    const clampedRow = Math.max(1, Math.min(30, row));
    const texY = 320 + (clampedRow - 1) * 118;

    const localX = ((texX / 4096) - 0.5) * 14.6;
    const localZ = ((texY / 4096) - 0.5) * 21.6;

    return new THREE.Vector3(bbX + localX, bbY, bbZ + localZ);
  }

buildBreadboard() {
    this.breadboardGroup.position.set(9.5, 0.35, 0);

    // 0. Foam Adhesive Base Backing Layer Underneath
    const foamMat = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.9 });
    const foam = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.35, 22.0), foamMat);
    foam.position.y = -0.175;
    foam.castShadow = true;
    this.breadboardGroup.add(foam);

    // 1. Lower ABS Base with darker warm grey side edge (#C8C0AE)
    const bbSideMat = new THREE.MeshStandardMaterial({
      color: 0xc8c0ae,
      roughness: 0.5
    });

    const bbGeo = new THREE.BoxGeometry(15.2, 0.65, 22.2);
    const bb = new THREE.Mesh(bbGeo, bbSideMat);
    bb.position.y = 0.325;
    bb.castShadow = true;
    bb.receiveShadow = true;

    // Dark CAD edge contour outline
    const bbEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(bbGeo),
      new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.65 })
    );
    bb.add(bbEdges);
    this.breadboardGroup.add(bb);

    // 2. Upper Chamfer / Bevel Tier (#DDD6C6)
    const chamferMat = new THREE.MeshStandardMaterial({ color: 0xddd6c6, roughness: 0.45 });
    const chamferGeo = new THREE.BoxGeometry(14.8, 0.16, 21.8);
    const chamferMesh = new THREE.Mesh(chamferGeo, chamferMat);
    chamferMesh.position.y = 0.73;
    chamferMesh.castShadow = true;

    const chamferEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(chamferGeo),
      new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 })
    );
    chamferMesh.add(chamferEdges);
    this.breadboardGroup.add(chamferMesh);

    // 3. High-Contrast Vector Silkscreen Top Plate
    const bbTexture = this.generateBreadboardTexture();
    const bbTopMat = new THREE.MeshStandardMaterial({
      map: bbTexture,
      roughness: 0.68,
      metalness: 0.0
    });

    const silkscreenPlate = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 21.6), bbTopMat);
    silkscreenPlate.rotation.x = -Math.PI / 2;
    silkscreenPlate.position.y = 0.812;
    silkscreenPlate.receiveShadow = true;
    this.breadboardGroup.add(silkscreenPlate);

    // Dark perimeter outline for the top plate - creates a distinct frame
    const plateOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(14.6, 0.02, 21.6)),
      new THREE.LineBasicMaterial({ color: 0x554d3e, transparent: true, opacity: 0.65 })
    );
    plateOutline.position.y = 0.815;
    this.breadboardGroup.add(plateOutline);

    // 4. Interlocking Dovetail Side Tabs
    const tabMat = new THREE.MeshStandardMaterial({ color: 0xc8c0ae, roughness: 0.5 });
    [-6, 0, 6].forEach(tz => {
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 1.6), tabMat);
      tab.position.set(7.9, 0.35, tz);
      this.breadboardGroup.add(tab);
    });

    // Register Breadboard Terminal Anchor Coordinates with exact physical socket holes
    // Lesson 4: Potentiometer + 220Ω Resistor + Red LED + Bridge
    this.pinPositions["Breadboard.Pot_Leg1"] = this.getBreadboardHole(9, 'a');
    this.pinPositions["Breadboard.Pot_Leg2"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.Pot_Leg3"] = this.getBreadboardHole(11, 'a');
    this.pinPositions["Breadboard.Resistor1"] = this.getBreadboardHole(15, 'a');
    this.pinPositions["Breadboard.Resistor2"] = this.getBreadboardHole(19, 'b');
    this.pinPositions["Breadboard.LED_Anode"] = this.getBreadboardHole(19, 'c');
    this.pinPositions["Breadboard.LED_Cathode"] = this.getBreadboardHole(20, 'c');
    this.pinPositions["Breadboard.Bridge_GND"] = this.getBreadboardHole(11, 'b');
    this.pinPositions["Breadboard.Bridge_Cathode"] = this.getBreadboardHole(20, 'e');

    // Lesson 2 & 3: Discrete LED & Button
    this.pinPositions["Breadboard.Btn_Leg1"] = this.getBreadboardHole(8, 'a');
    this.pinPositions["Breadboard.Btn_Leg2"] = this.getBreadboardHole(14, 'a');

    // Lesson 5: RGB LED (Row 16.5, col 'd') + 3x 220Ω Resistors
    this.pinPositions["Breadboard.RGB_ResRed"] = this.getBreadboardHole(11, 'a');
    this.pinPositions["Breadboard.RGB_Red"] = this.getBreadboardHole(11, 'a');
    this.pinPositions["Breadboard.RGB_GND"] = this.getBreadboardHole(16, 'a');
    this.pinPositions["Breadboard.RGB_ResGreen"] = this.getBreadboardHole(21, 'a');
    this.pinPositions["Breadboard.RGB_Green"] = this.getBreadboardHole(21, 'a');
    this.pinPositions["Breadboard.RGB_ResBlue"] = this.getBreadboardHole(22, 'a');
    this.pinPositions["Breadboard.RGB_Blue"] = this.getBreadboardHole(22, 'a');

    // Lesson 6 & 15: LDR / FSR Photo-Sensors
    this.pinPositions["Breadboard.LDR_Leg1"] = this.getBreadboardHole(9, 'a');
    this.pinPositions["Breadboard.LDR_Leg2"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.Res10k_Leg1"] = this.getBreadboardHole(10, 'b');
    this.pinPositions["Breadboard.Res10k_Leg2"] = this.getBreadboardHole(15, 'a');
    this.pinPositions["Breadboard.FSR_Leg1"] = this.getBreadboardHole(9, 'a');
    this.pinPositions["Breadboard.FSR_Leg2"] = this.getBreadboardHole(10, 'a');

    // Lesson 7 & 16: HC-SR04 Ultrasonic Sonar
    this.pinPositions["Breadboard.Sonar_VCC"] = this.getBreadboardHole(8, 'b');
    this.pinPositions["Breadboard.Sonar_TRIG"] = this.getBreadboardHole(10, 'b');
    this.pinPositions["Breadboard.Sonar_ECHO"] = this.getBreadboardHole(12, 'b');
    this.pinPositions["Breadboard.Sonar_GND"] = this.getBreadboardHole(14, 'b');

    // Lesson 8 & 9: Buzzer & Piano
    this.pinPositions["Breadboard.Buzzer_Pos"] = this.getBreadboardHole(5, 'c');
    this.pinPositions["Breadboard.Buzzer_Neg"] = this.getBreadboardHole(8, 'c');
    this.pinPositions["Breadboard.Key1"] = this.getBreadboardHole(12, 'a');

    // Lesson 10: DC Motor Driver
    this.pinPositions["Breadboard.Res1k_Leg1"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.Res1k_Leg2"] = this.getBreadboardHole(12, 'a');
    this.pinPositions["Breadboard.TIP120_Base"] = this.getBreadboardHole(12, 'b');
    this.pinPositions["Breadboard.TIP120_Collector"] = this.getBreadboardHole(13, 'b');
    this.pinPositions["Breadboard.TIP120_Emitter"] = this.getBreadboardHole(14, 'b');
    this.pinPositions["Breadboard.Motor_Neg"] = this.getBreadboardHole(18, 'c');

    // Lesson 11: TMP36 Analog Temperature Sensor
    this.pinPositions["Breadboard.TMP36_VCC"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.TMP36_Vout"] = this.getBreadboardHole(11, 'a');
    this.pinPositions["Breadboard.TMP36_GND"] = this.getBreadboardHole(12, 'a');

    // Lesson 12: Micro Servo Motor
    this.pinPositions["Breadboard.Servo_VCC"] = this.getBreadboardHole(10, 'b');
    this.pinPositions["Breadboard.Servo_Signal"] = this.getBreadboardHole(12, 'b');
    this.pinPositions["Breadboard.Servo_GND"] = this.getBreadboardHole(14, 'b');

    // Lesson 13: ULN2003 Stepper
    this.pinPositions["Breadboard.ULN_IN1"] = this.getBreadboardHole(8, 'a');
    this.pinPositions["Breadboard.ULN_IN2"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.ULN_VCC"] = this.getBreadboardHole(12, 'a');
    this.pinPositions["Breadboard.ULN_GND"] = this.getBreadboardHole(14, 'a');

    // Lesson 14: Smart Plant Moisture & I2C OLED
    this.pinPositions["Breadboard.Soil_VCC"] = this.getBreadboardHole(8, 'a');
    this.pinPositions["Breadboard.Soil_AOUT"] = this.getBreadboardHole(10, 'a');
    this.pinPositions["Breadboard.Soil_GND"] = this.getBreadboardHole(12, 'a');
    this.pinPositions["Breadboard.OLED_SDA"] = this.getBreadboardHole(16, 'a');
    this.pinPositions["Breadboard.OLED_SCL"] = this.getBreadboardHole(18, 'a');

    // Lesson 16: Traffic & Rails
    this.pinPositions["Breadboard.Traffic_Red"] = this.getBreadboardHole(12, 'b');
    this.pinPositions["Breadboard.Traffic_Yellow"] = this.getBreadboardHole(15, 'b');
    this.pinPositions["Breadboard.Traffic_Green"] = this.getBreadboardHole(18, 'b');
    this.pinPositions["Breadboard.VCC_Rail"] = this.getBreadboardHole(1, 'plus_left');
    this.pinPositions["Breadboard.GND_Rail"] = this.getBreadboardHole(1, 'minus_left');
  }

  // =========================================================================
  // LESSON SWITCHER & DYNAMIC HARDWARE BOM
  // =========================================================================

  loadLessonComponents(lesson) {
    this.activeLesson = lesson;

    while (this.componentsGroup.children.length > 0) {
      this.componentsGroup.remove(this.componentsGroup.children[0]);
    }
    this.clearWires();

    const lessonId = parseInt(lesson.id, 10);
    const isKnob = (lessonId === 4 || lesson.hash === '#knob' || lesson.slug === 'turn-a-knob' || (lesson.title && lesson.title.toLowerCase().includes('knob')));

    if (isKnob) {
      // Spotlight #knob: Knurled Potentiometer + 220Ω Dumbbell Resistor + 5mm Optical Red LED
      this.build3DPotentiometer(this.getBreadboardHole(10, 'e'));
      this.build3DResistor(this.getBreadboardHole(15, 'b'), this.getBreadboardHole(19, 'b'), "220");
      this.build3DLED(this.getBreadboardHole(19, 'c'), this.getBreadboardHole(20, 'c'), 0xe8392e);

      const potHole = this.getBreadboardHole(10, 'e');
      this.calloutTargets["POT"] = new THREE.Vector3(9.0, potHole.y + 3.2, potHole.z);
      const ledHole = this.getBreadboardHole(19.5, 'c');
      this.calloutTargets["LED"] = new THREE.Vector3(ledHole.x, ledHole.y + 3.2, ledHole.z);
    } else if (lessonId === 2) {
      // Lesson 2: 220Ω Dumbbell Resistor (rows 10-14, col b) + 5mm Optical Red LED (rows 14-15, col c)
      this.build3DResistor(this.getBreadboardHole(10, 'b'), this.getBreadboardHole(14, 'b'), "220");
      this.build3DLED(this.getBreadboardHole(14, 'c'), this.getBreadboardHole(15, 'c'), 0xe8392e);
      const resHole = this.getBreadboardHole(12, 'b');
      this.calloutTargets["RES"] = new THREE.Vector3(resHole.x, resHole.y + 1.8, resHole.z);
      const ledHole = this.getBreadboardHole(14.5, 'c');
      this.calloutTargets["LED"] = new THREE.Vector3(ledHole.x, ledHole.y + 3.2, ledHole.z);
    } else if (lessonId === 3) {
      this.build3DPushButton(this.getBreadboardHole(9, 'c'));
      this.build3DLED(this.getBreadboardHole(18, 'd'), this.getBreadboardHole(20, 'd'), 0x156d35);
    } else if (lessonId === 5) {
      // Lesson 5: 5mm Milky RGB LED + 3x 220Ω Dumbbell Resistors
      const rgbCenter = this.getBreadboardHole(16.5, 'd');
      this.build3DRGBLED(rgbCenter);
      this.build3DResistor(this.getBreadboardHole(11, 'b'), this.getBreadboardHole(15, 'b'), "220");
      this.build3DResistor(this.getBreadboardHole(17, 'b'), this.getBreadboardHole(21, 'b'), "220");
      this.build3DResistor(this.getBreadboardHole(18, 'c'), this.getBreadboardHole(22, 'c'), "220");

      this.calloutTargets["RGB"] = new THREE.Vector3(rgbCenter.x, rgbCenter.y + 3.2, rgbCenter.z);
      const resGreen = this.getBreadboardHole(19, 'b');
      this.calloutTargets["RGB_RESISTORS"] = new THREE.Vector3(resGreen.x, resGreen.y + 1.8, resGreen.z);
    } else if (lessonId === 6) {
      // Lesson 6: LDR Light Sensor + 10kΩ Resistor + Night Light LED + 220Ω Resistor
      this.build3DLDR(this.getBreadboardHole(12, 'c'));
      this.build3DResistor(this.getBreadboardHole(12, 'b'), this.getBreadboardHole(16, 'b'), "10k");
      this.build3DLED(this.getBreadboardHole(18, 'c'), this.getBreadboardHole(19, 'c'), 0xf59e0b);
      this.build3DResistor(this.getBreadboardHole(15, 'b'), this.getBreadboardHole(18, 'b'), "220");
      this.calloutTargets["LDR"] = new THREE.Vector3(this.getBreadboardHole(12, 'c').x, this.getBreadboardHole(12, 'c').y + 2.5, this.getBreadboardHole(12, 'c').z);
      this.calloutTargets["LED"] = new THREE.Vector3(this.getBreadboardHole(18.5, 'c').x, this.getBreadboardHole(18.5, 'c').y + 2.8, this.getBreadboardHole(18.5, 'c').z);
    } else if (lessonId === 7 || lessonId === 16) {
      this.build3DUltrasonic(this.getBreadboardHole(11, 'c'));
      const sonarHole = this.getBreadboardHole(11, 'c');
      this.calloutTargets["SONAR"] = new THREE.Vector3(sonarHole.x, sonarHole.y + 2.5, sonarHole.z);
      if (lessonId === 16) {
        this.build3DTrafficLight(this.getBreadboardHole(15, 'c'));
        this.build3DBuzzer(this.getBreadboardHole(6, 'c'));
      }
    } else if (lessonId === 8 || lessonId === 9) {
      this.build3DBuzzer(this.getBreadboardHole(7, 'c'));
    } else if (lessonId === 10) {
      this.build3DDCMotor(this.getBreadboardHole(15, 'c'));
    } else if (lessonId === 11) {
      this.build3DTMP36(this.getBreadboardHole(11, 'c'));
    } else if (lessonId === 12) {
      this.build3DSG90Servo(this.getBreadboardHole(12, 'c'));
    } else {
      this.build3DResistor(this.getBreadboardHole(15, 'c'), this.getBreadboardHole(18, 'c'), "220");
      this.build3DLED(this.getBreadboardHole(18, 'd'), this.getBreadboardHole(20, 'd'), 0xcc1111);
    }

    this.renderWires(lesson.requiredNetlist);
    this.updateCalloutBadges();
  }

  // =========================================================================
  // HARDWARE COMPONENTS (Exact Colors from Reference Image)
  // =========================================================================

  build3DPotentiometer(anchor) {
    const potGroup = new THREE.Group();
    const h10 = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(10, 'e'));
    const h9 = this.getBreadboardHole(9, 'e');
    const h11 = this.getBreadboardHole(11, 'e');

    // Breadboard column 'e' is at x = 8.26, column 'f' is at x = 9.94.
    // Center the potentiometer base at x = 9.0 (covering cols e & f), y = h10.y, z = h10.z
    const posX = 9.0;
    potGroup.position.set(posX, h10.y, h10.z);
    potGroup.name = "PotentiometerGroup";

    // 1. Vibrant Slate/Technical Blue Base (#3B62B3)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3b62b3,
      roughness: 0.48,
      metalness: 0.05
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 2.5), baseMat);
    base.position.y = 0.8;
    base.castShadow = true;
    base.receiveShadow = true;

    const baseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(base.geometry),
      new THREE.LineBasicMaterial({ color: 0x1f3b73, transparent: true, opacity: 0.65 })
    );
    base.add(baseEdges);
    potGroup.add(base);

    // 2. Threaded Collar / Bushing (#D9D6CF)
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xd9d6cf,
      roughness: 0.32,
      metalness: 0.65
    });
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.32, 32), collarMat);
    collar.position.y = 1.76;
    collar.castShadow = true;
    potGroup.add(collar);

    // 3. Charcoal Fluted Dial Knob (#2C3242) with 24 segments and flatShading: true
    this.potKnobMesh = new THREE.Group();
    this.potKnobMesh.position.y = 1.95;
    this.potKnobMesh.name = "PotKnobMesh";

    const knobMat = new THREE.MeshStandardMaterial({
      color: 0x2c3242,
      roughness: 0.45,
      metalness: 0.08,
      flatShading: true
    });
    // Cylindrical knob with 24 segments and flatShading creates the knurled/fluted dial look!
    const knobCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.48, 1.65, 24), knobMat);
    knobCyl.position.y = 0.825;
    knobCyl.castShadow = true;
    knobCyl.receiveShadow = true;
    this.potKnobMesh.add(knobCyl);

    // Knob Cap disc on top (#353B4D)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x353b4d, roughness: 0.4 });
    const knobCap = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.42, 0.22, 32), capMat);
    knobCap.position.y = 1.70;
    knobCap.castShadow = true;
    this.potKnobMesh.add(knobCap);

    // Pure White / Ivory High-Contrast Radial Pointer Line on Top Surface (#F4EFE3)
    const pointerMat = new THREE.MeshStandardMaterial({
      color: 0xf4efe3,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.15
    });
    // Pointer line extending along z from center to front edge
    const pointer = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 1.05), pointerMat);
    pointer.position.set(0, 1.82, 0.52);
    this.potKnobMesh.add(pointer);

    potGroup.add(this.potKnobMesh);

    // 4. Three Solder Terminal Pins inserting directly into rows 9, 10, 11 (col 'e')
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xd4d0c8, metalness: 0.85, roughness: 0.2 });
    const lugZ = [h9.z - h10.z, 0, h11.z - h10.z];
    const lugX = h10.x - posX; // ~ -0.74 to reach column 'e'

    lugZ.forEach(lz => {
      // Horizontal lead from body to column 'e'
      const leadH = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(lugX) + 0.12, 0.14, 0.28), pinMat);
      leadH.position.set(lugX * 0.5, 0.35, lz);
      potGroup.add(leadH);

      // Vertical pin dropping into breadboard hole
      const leadV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.28), pinMat);
      leadV.position.set(lugX, 0.0, lz);
      leadV.castShadow = true;
      potGroup.add(leadV);
    });

    this.componentsGroup.add(potGroup);
  }

  build3DResistor(p1, p2, type = "220") {
    const resGroup = new THREE.Group();
    const pos1 = (p1 && p1.isVector3) ? p1 : (p1 && p1.x !== undefined ? p1 : this.getBreadboardHole(15, 'c'));
    const pos2 = (p2 && p2.isVector3) ? p2 : (p2 && p2.x !== undefined ? p2 : this.getBreadboardHole(18, 'c'));

    const midX = (pos1.x + pos2.x) * 0.5;
    const midZ = (pos1.z + pos2.z) * 0.5;
    // Elevate resistor body cleanly above breadboard so it is never hidden by wires or shadows
    const bodyY = Math.max(pos1.y, pos2.y) + 1.35;

    resGroup.position.set(midX, bodyY, midZ);

    const dx = pos2.x - pos1.x;
    const dz = pos2.z - pos1.z;
    const spanDist = Math.hypot(dx, dz) || 1.8;
    const angleY = Math.atan2(dx, dz);

    resGroup.rotation.y = angleY;

    // 1. Ceramic Dumbbell Body - Warm Ivory Satin Finish (#EEDEC6)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeedec6, roughness: 0.35 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 2.1, 28), bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    resGroup.add(body);

    const endGeo = new THREE.SphereGeometry(0.62, 24, 18);
    const end1 = new THREE.Mesh(endGeo, bodyMat);
    end1.position.z = -1.05;
    end1.castShadow = true;
    resGroup.add(end1);

    const end2 = new THREE.Mesh(endGeo, bodyMat);
    end2.position.z = 1.05;
    end2.castShadow = true;
    resGroup.add(end2);

    // 2. Bold, High-Contrast Color Bands: Red (#D92525), Red (#D92525), Brown (#4A2205), Gold (#E5B022)
    const bandMatRed = new THREE.MeshStandardMaterial({ color: 0xd92525, roughness: 0.18 });
    const bandMatBrown = new THREE.MeshStandardMaterial({ color: 0x4a2205, roughness: 0.18 });
    const bandMatGold = new THREE.MeshStandardMaterial({ color: 0xe5b022, roughness: 0.12, metalness: 0.92 });

    const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.28, 28), bandMatRed);
    band1.rotation.x = Math.PI / 2;
    band1.position.z = -0.65;
    band1.castShadow = true;
    resGroup.add(band1);

    const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.28, 28), bandMatRed);
    band2.rotation.x = Math.PI / 2;
    band2.position.z = -0.22;
    band2.castShadow = true;
    resGroup.add(band2);

    const band3 = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.28, 28), bandMatBrown);
    band3.rotation.x = Math.PI / 2;
    band3.position.z = 0.20;
    band3.castShadow = true;
    resGroup.add(band3);

    const band4 = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.28, 28), bandMatGold);
    band4.rotation.x = Math.PI / 2;
    band4.position.z = 0.65;
    band4.castShadow = true;
    resGroup.add(band4);

    // 3. Polished Silver Tinned Wire Leads bending 90° down into pos1 and pos2
    const leadMat = new THREE.MeshStandardMaterial({ color: 0xdde3eb, metalness: 0.9, roughness: 0.15 });
    const halfSpan = spanDist * 0.5;

    const path1 = new THREE.CurvePath();
    path1.add(new THREE.LineCurve3(new THREE.Vector3(0, 0, -1.05), new THREE.Vector3(0, 0, -halfSpan)));
    path1.add(new THREE.LineCurve3(new THREE.Vector3(0, 0, -halfSpan), new THREE.Vector3(0, -1.45, -halfSpan)));
    const lead1Mesh = new THREE.Mesh(new THREE.TubeGeometry(path1, 16, 0.09, 8, false), leadMat);
    lead1Mesh.castShadow = true;
    resGroup.add(lead1Mesh);

    const path2 = new THREE.CurvePath();
    path2.add(new THREE.LineCurve3(new THREE.Vector3(0, 0, 1.05), new THREE.Vector3(0, 0, halfSpan)));
    path2.add(new THREE.LineCurve3(new THREE.Vector3(0, 0, halfSpan), new THREE.Vector3(0, -1.45, halfSpan)));
    const lead2Mesh = new THREE.Mesh(new THREE.TubeGeometry(path2, 16, 0.09, 8, false), leadMat);
    lead2Mesh.castShadow = true;
    resGroup.add(lead2Mesh);

    this.componentsGroup.add(resGroup);
  }

  build3DLED(p1, p2, colorHex = 0xe8392e) {
    const ledGroup = new THREE.Group();
    const pos1 = (p1 && p1.isVector3) ? p1 : (p1 && p1.x !== undefined ? p1 : this.getBreadboardHole(18, 'd'));
    const pos2 = (p2 && p2.isVector3) ? p2 : (p2 && p2.x !== undefined ? p2 : this.getBreadboardHole(20, 'd'));

    const midX = (pos1.x + pos2.x) * 0.5;
    const midZ = (pos1.z + pos2.z) * 0.5;
    const bodyY = Math.max(pos1.y, pos2.y);

    ledGroup.position.set(midX, bodyY, midZ);

    // 1. Seamless Optical Epoxy Lens Profile via LatheGeometry (Matching Dilum Sanjaya's Vc Model)
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.98, 0),
      new THREE.Vector2(0.98, 0.35),
      new THREE.Vector2(0.85, 0.35),
      new THREE.Vector2(0.85, 1.85)
    ];
    for (let i = 1; i <= 16; i++) {
      const theta = (i / 16) * (Math.PI / 2);
      points.push(new THREE.Vector2(Math.cos(theta) * 0.85, 1.85 + Math.sin(theta) * 0.85));
    }
    const domeGeo = new THREE.LatheGeometry(points, 36);

    const domeMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.20,
      roughness: 0.16,
      metalness: 0.02,
      transparent: true,
      opacity: 0.92
    });

    this.ledMesh = new THREE.Mesh(domeGeo, domeMat);
    this.ledMesh.position.y = 1.35;
    this.ledMesh.castShadow = true;
    this.ledMesh.receiveShadow = true;
    ledGroup.add(this.ledMesh);

    // Internal Silver Lead Frame (Post & Reflective Anvil with Gold Chip Die)
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xdde3eb, metalness: 0.9, roughness: 0.15 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), cupMat);
    post.position.set(-0.16, 2.2, 0);
    ledGroup.add(post);

    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.16), cupMat);
    anvil.position.set(0.16, 2.35, 0);
    ledGroup.add(anvil);

    // Golden LED semiconductor die bonded in the anvil cup
    const dieMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 });
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), dieMat);
    die.position.set(0.16, 2.45, 0.04);
    ledGroup.add(die);

    // Dynamic Point Light for interactive illumination
    this.ledLight = new THREE.PointLight(colorHex, 0, 18);
    this.ledLight.position.set(0, 3.2, 0);
    ledGroup.add(this.ledLight);

    // Polished Silver Leads extending into breadboard holes
    const leadMat = new THREE.MeshStandardMaterial({ color: 0xd2cfc8, metalness: 0.85, roughness: 0.25 });
    const relZ1 = pos1.z - midZ;
    const relZ2 = pos2.z - midZ;

    const lead1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), leadMat);
    lead1.position.set(0, 0.72, relZ1);
    lead1.castShadow = true;
    ledGroup.add(lead1);

    const lead2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), leadMat);
    lead2.position.set(0, 0.72, relZ2);
    lead2.castShadow = true;
    ledGroup.add(lead2);

    this.componentsGroup.add(ledGroup);
  }

  build3DPushButton(anchor) {
    const btnGroup = new THREE.Group();
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(9, 'c'));
    btnGroup.position.set(pos.x, pos.y, pos.z);

    // Black Omron tactile switch base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.65 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 3.2), baseMat);
    base.position.y = 0.55;
    base.castShadow = true;
    base.receiveShadow = true;
    btnGroup.add(base);

    // Metallic chrome top retaining plate with circular aperture
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.18 });
    const plate = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 3.1), plateMat);
    plate.position.y = 1.15;
    btnGroup.add(plate);

    // Vibrant tactile red cylindrical button actuator
    const plungerMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.28 });
    this.buttonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.85, 24), plungerMat);
    this.buttonMesh.position.y = 1.5;
    this.buttonMesh.castShadow = true;
    btnGroup.add(this.buttonMesh);

    // 4 silver bent pins going into breadboard
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    [[-1.3, -1.3], [-1.3, 1.3], [1.3, -1.3], [1.3, 1.3]].forEach(([px, pz]) => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), pinMat);
      pin.position.set(px, 0.1, pz);
      btnGroup.add(pin);
    });

    this.componentsGroup.add(btnGroup);
  }

  build3DRGBLED(anchor) {
    // 4-lead common-cathode 5mm RGB LED
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(16.5, 'd'));
    const rgbGroup = new THREE.Group();
    rgbGroup.position.set(pos.x, pos.y, pos.z);
    rgbGroup.name = "RGBLEDGroup";

    // 1. Milky diffused epoxy lens with deep internal luminous color blending
    this.rgbLensMat = new THREE.MeshStandardMaterial({
      color: 0xf4f0e8,
      emissive: 0xd946ef, // Vibrant default neon magenta/purple
      emissiveIntensity: 0.75,
      roughness: 0.22,
      metalness: 0.02,
      transparent: true,
      opacity: 0.94
    });

    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.7, 28), this.rgbLensMat);
    dome.position.y = 2.45;
    dome.castShadow = true;
    dome.receiveShadow = true;
    rgbGroup.add(dome);

    const top = new THREE.Mesh(new THREE.SphereGeometry(0.85, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), this.rgbLensMat);
    top.position.y = 3.30;
    top.castShadow = true;
    rgbGroup.add(top);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.24, 28), this.rgbLensMat);
    rim.position.y = 1.50;
    rim.castShadow = true;
    rgbGroup.add(rim);

    // Subtle dark perimeter outline for crisp CAD silhouette
    const outlineMat = new THREE.LineBasicMaterial({ color: 0x4a1d96, transparent: true, opacity: 0.55 });
    const domeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(dome.geometry), outlineMat);
    dome.add(domeEdges);

    // 2. Real Volumetric PointLight casting colored light onto breadboard surface
    this.rgbPointLight = new THREE.PointLight(0xd946ef, 1.8, 10, 1.5);
    this.rgbPointLight.position.set(0, 2.6, 0);
    rgbGroup.add(this.rgbPointLight);

    // 3. Four Solder Lead Pins (Red, GND Common Cathode, Green, Blue)
    // Row 15 (-0.933 z), Row 16 (-0.311 z), Row 17 (+0.311 z), Row 18 (+0.933 z)
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    const leadZOffsets = [-0.933, -0.311, 0.311, 0.933];

    leadZOffsets.forEach((lz, idx) => {
      // Longest lead is Cathode (idx === 1)
      const pinLength = (idx === 1) ? 1.6 : 1.4;
      const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, pinLength, 10), pinMat);
      lead.position.set(0, pinLength * 0.5, lz);
      lead.castShadow = true;
      rgbGroup.add(lead);
    });

    this.componentsGroup.add(rgbGroup);
  }

  updateRGBColor(r, g, b) {
    if (!this.rgbLensMat) return;
    const normR = Math.max(0, Math.min(255, r)) / 255;
    const normG = Math.max(0, Math.min(255, g)) / 255;
    const normB = Math.max(0, Math.min(255, b)) / 255;
    const lum = Math.max(normR, normG, normB);
    const col = new THREE.Color(normR, normG, normB);

    this.rgbLensMat.emissive.copy(col);
    this.rgbLensMat.emissiveIntensity = lum > 0 ? 0.45 + lum * 0.55 : 0.05;
    if (this.rgbPointLight) {
      this.rgbPointLight.color.copy(col);
      this.rgbPointLight.intensity = lum * 2.2;
    }
  }

  build3DUltrasonic(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(11, 'c'));
    const sonarGroup = new THREE.Group();
    sonarGroup.position.set(pos.x, pos.y, pos.z);

    // Authentic HC-SR04 Deep Cobalt Blue PCB
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0c4573, roughness: 0.35 });
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.8, 0.4), pcbMat);
    pcb.position.y = 2.2;
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    sonarGroup.add(pcb);

    // Brushed aluminum transducer barrels (Transmitter "T" and Receiver "R")
    const cylMat = new THREE.MeshStandardMaterial({ color: 0xe2e0db, metalness: 0.82, roughness: 0.18 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.9 });
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.8 });

    [-2.0, 2.0].forEach(ox => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.8, 28), cylMat);
      t.rotation.x = Math.PI / 2;
      t.position.set(ox, 2.2, 1.0);
      t.castShadow = true;
      t.receiveShadow = true;
      sonarGroup.add(t);

      const screen = new THREE.Mesh(new THREE.CylinderGeometry(0.90, 0.90, 0.06, 24), screenMat);
      screen.rotation.x = Math.PI / 2;
      screen.position.set(ox, 2.2, 1.92);
      sonarGroup.add(screen);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.08, 12, 28), ringMat);
      rim.position.set(ox, 2.2, 1.93);
      sonarGroup.add(rim);
    });

    // 10MHz crystal oscillator can between barrels
    const xtalMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    const xtal = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 16), xtalMat);
    xtal.position.set(0, 2.6, 0.35);
    sonarGroup.add(xtal);

    // 4 silver right-angle header pins inserting into breadboard
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const pz = (i - 1.5) * 0.7;
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), pinMat);
      pin.position.set(0, 0.5, pz);
      sonarGroup.add(pin);
    }

    this.componentsGroup.add(sonarGroup);
  }

  build3DBuzzer(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(7, 'c'));
    const bGroup = new THREE.Group();
    bGroup.position.set(pos.x, pos.y, pos.z);

    // High-contrast matte black piezo cylinder
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.7 });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.6, 32), cylMat);
    cyl.position.y = 1.1;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    bGroup.add(cyl);

    // Top sound acoustic port hole
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0x050608 })
    );
    hole.position.y = 1.92;
    bGroup.add(hole);

    // White printed "+" polarity indicator
    const plusMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plusH = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.12), plusMat);
    plusH.position.set(0.9, 1.92, 0.5);
    bGroup.add(plusH);
    const plusV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.5), plusMat);
    plusV.position.set(0.9, 1.92, 0.5);
    bGroup.add(plusV);

    // Silver terminal pins
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    [-0.6, 0.6].forEach(pz => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), pinMat);
      pin.position.set(0, 0.2, pz);
      bGroup.add(pin);
    });

    this.componentsGroup.add(bGroup);
  }

  build3DDCMotor(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(15, 'c'));
    const mGroup = new THREE.Group();
    mGroup.position.set(pos.x, pos.y, pos.z);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xd5d2ca, roughness: 0.5 })
    );
    body.position.y = 1.6;
    body.castShadow = true;
    mGroup.add(body);

    this.motorFanMesh = new THREE.Group();
    this.motorFanMesh.position.y = 3.4;

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    );
    this.motorFanMesh.add(shaft);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.35 });
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 2.6), bladeMat);
      blade.rotation.y = (i * Math.PI * 2) / 3;
      blade.position.y = 0.4;
      blade.castShadow = true;
      this.motorFanMesh.add(blade);
    }

    mGroup.add(this.motorFanMesh);
    this.componentsGroup.add(mGroup);
  }

  build3DTMP36(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(11, 'c'));
    const tGroup = new THREE.Group();
    tGroup.position.set(pos.x, pos.y, pos.z);

    // TO-92 flat-front / half-cylinder back package
    const pkgMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.65 });
    const halfCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 1.6, 20, 1, false, 0, Math.PI),
      pkgMat
    );
    halfCyl.position.y = 1.6;
    halfCyl.castShadow = true;
    tGroup.add(halfCyl);

    const flatFace = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 0.08), pkgMat);
    flatFace.position.set(0, 1.6, 0);
    tGroup.add(flatFace);

    // 3 silver leads
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });
    [-0.45, 0, 0.45].forEach(ox => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), pinMat);
      pin.position.set(ox, 0.5, 0);
      tGroup.add(pin);
    });

    this.componentsGroup.add(tGroup);
  }

  build3DSG90Servo(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(12, 'c'));
    const sGroup = new THREE.Group();
    sGroup.position.set(pos.x, pos.y, pos.z);

    // TowerPro blue translucent casing
    const caseMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 1.6), caseMat);
    body.position.y = 1.8;
    body.castShadow = true;
    sGroup.add(body);

    // Mounting tabs with brass eyelets
    const tabGeo = new THREE.BoxGeometry(0.6, 0.2, 1.6);
    [-1.7, 1.7].forEach(tx => {
      const tab = new THREE.Mesh(tabGeo, caseMat);
      tab.position.set(tx, 2.4, 0);
      sGroup.add(tab);
      const eyelet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
      eyelet.position.set(tx, 2.4, 0);
      sGroup.add(eyelet);
    });

    // Output spline and white nylon double horn
    this.servoArmMesh = new THREE.Group();
    this.servoArmMesh.position.set(0, 3.5, 0);

    const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const hornCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 16), hornMat);
    this.servoArmMesh.add(hornCenter);

    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 3.2), hornMat);
    horn.position.y = 0.1;
    this.servoArmMesh.add(horn);

    sGroup.add(this.servoArmMesh);
    this.componentsGroup.add(sGroup);
  }

  build3DTrafficLight(anchor) {
    const pos = (anchor && anchor.isVector3) ? anchor : (anchor && anchor.x !== undefined ? anchor : this.getBreadboardHole(15, 'c'));
    const tlGroup = new THREE.Group();
    tlGroup.position.set(pos.x, pos.y, pos.z);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.75 });
    const pole = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5.8, 1.4), poleMat);
    pole.position.y = 2.9;
    pole.castShadow = true;
    tlGroup.add(pole);

    // Visor hoods over each light
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.7 });
    [4.5, 2.9, 1.3].forEach(hy => {
      const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, 16, 1, true, 0, Math.PI), hoodMat);
      hood.rotation.z = Math.PI / 2;
      hood.position.set(0, hy + 0.25, 0.85);
      tlGroup.add(hood);
    });

    const rMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0xd32f2f, emissiveIntensity: 0.3, roughness: 0.2 });
    const yMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.3, roughness: 0.2 });
    const gMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.3, roughness: 0.2 });

    this.trafficLeds = this.trafficLeds || {};
    this.trafficLeds.red = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), rMat);
    this.trafficLeds.red.position.set(0, 4.5, 0.72);
    tlGroup.add(this.trafficLeds.red);

    this.trafficLeds.yellow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), yMat);
    this.trafficLeds.yellow.position.set(0, 2.9, 0.72);
    tlGroup.add(this.trafficLeds.yellow);

    this.trafficLeds.green = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), gMat);
    this.trafficLeds.green.position.set(0, 1.3, 0.72);
    tlGroup.add(this.trafficLeds.green);

    this.componentsGroup.add(tlGroup);
  }

  // =========================================================================
  // DUPONT JUMPER WIRES WITH MATCHING COLORED BOOTS & BLACK COLLARS
  // =========================================================================

  renderWires(netlist) {
    this.clearWires();
    if (!netlist || !Array.isArray(netlist)) return;
    this.wireCurves = [];

    // Exact Saturated Rich Wire Colors from Reference Image
    const wireColorMap = {
      yellow: 0xf0b53a,
      amber: 0xf0a53a,
      green: 0x3fae6a,
      red: 0xd64a3a,
      black: 0x24272f,
      navy: 0x2f3547,
      blue: 0x3d6fc4,
      white: 0xf8fafc,
      orange: 0xf0a53a
    };

    netlist.forEach((conn, index) => {
      // In breadboard circuits, adjacent connected leads share the tie point row directly
      if ((conn.from.includes('Resistor2') && conn.to.includes('LED_Anode')) ||
          (conn.from.includes('LED_Anode') && conn.to.includes('Resistor2'))) {
        return;
      }

      const pFrom = this.resolvePinPosition(conn.from);
      const pTo = this.resolvePinPosition(conn.to);

      if (pFrom && pTo) {
        let colHex = wireColorMap[conn.color.toLowerCase()] || 0x1d4ed8;
        // Lesson-specific authentic color palettes matching reference manual & screenshots
        if (this.activeLesson && (this.activeLesson.id === 5 || this.activeLesson.slug === 'mix-colours' || (this.activeLesson.hash && this.activeLesson.hash.includes('rgb')))) {
          if (conn.from.includes('D9') || conn.to.includes('D9')) colHex = 0xee7f62; // Coral / Red for Red channel
          else if (conn.from.includes('D10') || conn.to.includes('D10')) colHex = 0x3fae6a; // Vibrant Emerald Green for Green channel
          else if (conn.from.includes('D11') || conn.to.includes('D11')) colHex = 0x3d6fc4; // Rich Royal Blue for Blue channel
          else if (conn.from.includes('GND') || conn.to.includes('GND')) colHex = 0x24272f; // Deep Navy for GND
        } else if (this.activeLesson && (this.activeLesson.id === 4 || this.activeLesson.slug === 'turn-a-knob' || (this.activeLesson.hash && this.activeLesson.hash.includes('knob')))) {
          if (conn.from.includes('D9') || conn.to.includes('D9')) colHex = 0xf0a53a; // Radiant Golden Amber for PWM
          if (conn.to.includes('A0') || conn.from.includes('A0')) colHex = 0x3fae6a; // Vibrant Rich Green for Wiper
          if (conn.from.includes('5V') || conn.to.includes('5V')) colHex = 0xd64a3a; // Vibrant Rich Red for 5V
          if (conn.from.includes('GND') || conn.to.includes('GND')) colHex = 0x24272f; // Navy/Charcoal for GND
          if (conn.isBridge || conn.from.includes('Bridge') || conn.to.includes('Bridge')) colHex = 0x24272f; // Navy Ground Bridge
        } else if (this.activeLesson && (this.activeLesson.id === 2 || this.activeLesson.slug === 'blink-an-led' || (this.activeLesson.hash && this.activeLesson.hash.includes('blink')))) {
          if (conn.from.includes('D13') || conn.to.includes('D13')) colHex = 0xf0a53a; // Radiant Amber/Orange
          if (conn.from.includes('GND') || conn.to.includes('GND')) colHex = 0x24272f; // Deep Navy
        }
        this.createCurved3DWire(pFrom, pTo, colHex, index, conn);
      }
    });

    if (this.flowActive) {
      this.rebuildFlowParticles();
    }
  }

  clearWires() {
    this.wireCurves = [];
    if (this.flowParticlesGroup) {
      while (this.flowParticlesGroup.children.length > 0) {
        this.flowParticlesGroup.remove(this.flowParticlesGroup.children[0]);
      }
    }
    while (this.wiresGroup.children.length > 0) {
      const child = this.wiresGroup.children[0];
      if (child.geometry && typeof child.geometry.dispose === 'function') child.geometry.dispose();
      if (child.children && child.children.length > 0) {
        child.children.forEach(c => {
          if (c.geometry && typeof c.geometry.dispose === 'function') c.geometry.dispose();
        });
      }
      this.wiresGroup.remove(child);
    }
  }

  resolvePinPosition(pinName) {
    if (!pinName) return this.getBreadboardHole(15, 'a');
    const clean = pinName.trim();

    // Lesson-specific pin overrides for realistic procedural layout
    if (this.activeLesson && (this.activeLesson.id === 2 || this.activeLesson.slug === 'blink-an-led' || (this.activeLesson.hash && this.activeLesson.hash.includes('blink')))) {
      if (clean.includes('Resistor1') || clean.includes('Res_In')) return this.getBreadboardHole(10, 'a');
      if (clean.includes('Resistor2') || clean.includes('Res_Out')) return this.getBreadboardHole(14, 'b');
      if (clean.includes('LED_Anode')) return this.getBreadboardHole(14, 'c');
      if (clean.includes('LED_Cathode')) return this.getBreadboardHole(15, 'a');
    }

    if (this.pinPositions[clean]) {
      return this.pinPositions[clean].clone();
    }
    if (clean === "Uno.GND" || clean === "GND" || clean === "Uno.GND1") {
      return (this.pinPositions["Uno.GND1"] || this.pinPositions["Uno.GND2"] || this.pinPositions["Uno.GND_DIG"]).clone();
    }
    if (clean === "Uno.D9" || clean === "Uno.~9" || clean === "Uno.~D9" || clean === "D9" || clean === "~9" || clean === "~D9") {
      return this.pinPositions["Uno.D9"].clone();
    }
    if (clean === "Uno.5V" || clean === "5V") {
      return this.pinPositions["Uno.5V"].clone();
    }
    if (clean === "Uno.A0" || clean === "A0") {
      return this.pinPositions["Uno.A0"].clone();
    }
    if (clean === "Uno.D13" || clean === "D13") {
      return this.pinPositions["Uno.D13"].clone();
    }
    if (clean === "Uno.D2" || clean === "D2") {
      return this.pinPositions["Uno.D2"].clone();
    }
    if (clean === "Uno.D8" || clean === "D8") {
      return this.pinPositions["Uno.D8"].clone();
    }
    if (clean === "Uno.D10" || clean === "Uno.~10" || clean === "D10") {
      return this.pinPositions["Uno.D10"].clone();
    }
    if (clean === "Uno.D11" || clean === "Uno.~11" || clean === "D11") {
      return this.pinPositions["Uno.D11"].clone();
    }

    for (const key of Object.keys(this.pinPositions)) {
      if (key.endsWith(clean) || key.includes(clean)) {
        return this.pinPositions[key].clone();
      }
    }

    if (clean.toLowerCase().includes('pot')) return this.getBreadboardHole(10, 'a');
    if (clean.toLowerCase().includes('res')) return this.getBreadboardHole(15, 'a');
    if (clean.toLowerCase().includes('led')) return this.getBreadboardHole(18, 'c');
    if (clean.toLowerCase().includes('btn')) return this.getBreadboardHole(8, 'a');

    return this.getBreadboardHole(15, 'a');
  }

  createCurved3DWire(p1, p2, colorHex, wireIndex = 0, conn = null) {
    const dist = p1.distanceTo(p2);
    // Skip zero-distance internal row connections
    if (dist < 0.6) return;

    const isBridge = !!(conn && (conn.isBridge || (conn.from && conn.from.includes('Bridge')) || (conn.to && conn.to.includes('Bridge'))));

    if (isBridge) {
      // Sleek low-profile jumper bridge wire on the breadboard
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.6 });
      const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.32, 12);

      const p1Mesh = new THREE.Mesh(tipGeo, pinMat);
      p1Mesh.position.copy(p1);
      p1Mesh.position.y += 0.14;
      this.wiresGroup.add(p1Mesh);

      const p2Mesh = new THREE.Mesh(tipGeo, pinMat);
      p2Mesh.position.copy(p2);
      p2Mesh.position.y += 0.14;
      this.wiresGroup.add(p2Mesh);

      const startPoint = p1.clone();
      startPoint.y += 0.28;
      const endPoint = p2.clone();
      endPoint.y += 0.28;

      const pTakeoff = startPoint.clone();
      pTakeoff.y += 0.22;
      const pLanding = endPoint.clone();
      pLanding.y += 0.22;

      const apexY = Math.max(startPoint.y, endPoint.y) + 0.45;
      const pMid = new THREE.Vector3(
        (startPoint.x + endPoint.x) * 0.5 + 0.30,
        apexY,
        (startPoint.z + endPoint.z) * 0.5
      );

      const curve = new THREE.CatmullRomCurve3([startPoint, pTakeoff, pMid, pLanding, endPoint], false, 'centripetal', 0.5);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.16, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.24,
        metalness: 0.04
      });

      const wireMesh = new THREE.Mesh(tubeGeo, tubeMat);
      wireMesh.castShadow = true;
      wireMesh.receiveShadow = true;
      wireMesh.userData = { wireIndex, conn, curve };
      this.wiresGroup.add(wireMesh);

      if (!this.wireCurves) this.wireCurves = [];
      this.wireCurves.push({ curve, colorHex });
      return;
    }

    // 1. Authentic DuPont Connector Housing (Compact sleek black body with color-coded strain-relief collar)
    const bootGeo = new THREE.BoxGeometry(0.38, 0.85, 0.38);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.50 });
    const collarMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45 });
    const collarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.28, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.85, roughness: 0.2 });

    // Boot at Endpoint 1
    const b1Group = new THREE.Group();
    b1Group.position.copy(p1);
    b1Group.position.y += 0.38;

    const b1Mesh = new THREE.Mesh(bootGeo, bootMat);
    b1Mesh.castShadow = true;
    b1Mesh.receiveShadow = true;
    b1Group.add(b1Mesh);

    const latch1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.06), metalMat);
    latch1.position.set(0, 0, 0.16);
    b1Group.add(latch1);

    const collar1 = new THREE.Mesh(collarGeo, collarMat);
    collar1.position.set(0, 0.46, 0);
    collar1.castShadow = true;
    b1Group.add(collar1);

    this.wiresGroup.add(b1Group);

    // Boot at Endpoint 2
    const b2Group = new THREE.Group();
    b2Group.position.copy(p2);
    b2Group.position.y += 0.38;

    const b2Mesh = new THREE.Mesh(bootGeo, bootMat);
    b2Mesh.castShadow = true;
    b2Mesh.receiveShadow = true;
    b2Group.add(b2Mesh);

    const latch2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.06), metalMat);
    latch2.position.set(0, 0, 0.16);
    b2Group.add(latch2);

    const collar2 = new THREE.Mesh(collarGeo, collarMat);
    collar2.position.set(0, 0.46, 0);
    collar2.castShadow = true;
    b2Group.add(collar2);

    this.wiresGroup.add(b2Group);

    // Gold Pin Tips into socket
    const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.8 });
    const pinTipGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);

    const tip1 = new THREE.Mesh(pinTipGeo, goldPinMat);
    tip1.position.copy(p1);
    this.wiresGroup.add(tip1);

    const tip2 = new THREE.Mesh(pinTipGeo, goldPinMat);
    tip2.position.copy(p2);
    this.wiresGroup.add(tip2);

    // 2. Realistic Sleek 24-AWG Jumper Wire Spline with Natural Arch & Lateral Separation
    const startPoint = p1.clone();
    startPoint.y += 0.88;

    const endPoint = p2.clone();
    endPoint.y += 0.88;

    const dirX = endPoint.x - startPoint.x;
    const dirZ = endPoint.z - startPoint.z;
    const perpX = -dirZ / (dist || 1);
    const perpZ = dirX / (dist || 1);

    let apexY, bowAmount;

    if (this.activeLesson && (this.activeLesson.id === 2 || this.activeLesson.slug === 'blink-an-led' || (this.activeLesson.hash && this.activeLesson.hash.includes('blink')))) {
      if (conn && (conn.from.includes('D13') || conn.to.includes('D13'))) {
        apexY = Math.max(startPoint.y, endPoint.y) + 2.8;
        bowAmount = -0.42;
      } else if (conn && (conn.from.includes('GND') || conn.to.includes('GND'))) {
        apexY = Math.max(startPoint.y, endPoint.y) + 3.1;
        bowAmount = 0.48;
      }
    } else if (conn && (conn.from.includes('A0') || conn.to.includes('A0'))) {
      // Tallest arch for analog wiper wire
      apexY = Math.max(startPoint.y, endPoint.y) + 3.8;
      bowAmount = -0.65;
    } else if (conn && (conn.from.includes('5V') || conn.to.includes('5V'))) {
      // High arch for 5V power wire
      apexY = Math.max(startPoint.y, endPoint.y) + 3.1;
      bowAmount = 0.75;
    } else if (conn && (conn.from.includes('D9') || conn.to.includes('D9'))) {
      // Clean sweeping arch from digital pin 9
      apexY = Math.max(startPoint.y, endPoint.y) + 3.0;
      bowAmount = -0.35;
    } else if (conn && (conn.from.includes('GND') || conn.to.includes('GND'))) {
      // Low smooth arch for ground wire
      apexY = Math.max(startPoint.y, endPoint.y) + 2.3;
      bowAmount = 0.25;
    } else {
      apexY = Math.max(startPoint.y, endPoint.y) + Math.min(dist * 0.16 + 0.6, 2.5) + (wireIndex % 3) * 0.22;
      const bowSign = (wireIndex % 2 === 0) ? 1 : -1;
      bowAmount = Math.min(dist * 0.08, 0.85) * bowSign;
    }

    const pTakeoff = startPoint.clone();
    pTakeoff.y += 0.85;

    const pMid = new THREE.Vector3(
      (startPoint.x + endPoint.x) * 0.5 + perpX * bowAmount,
      apexY,
      (startPoint.z + endPoint.z) * 0.5 + perpZ * bowAmount
    );

    const pLanding = endPoint.clone();
    pLanding.y += 0.85;

    const curve = new THREE.CatmullRomCurve3(
      [startPoint, pTakeoff, pMid, pLanding, endPoint],
      false,
      'centripetal',
      0.5
    );

    // Authentic wire radius: 0.22 (sleek, realistic, never obscures components)
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.22, 16, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.24,
      metalness: 0.04
    });

    const wireMesh = new THREE.Mesh(tubeGeo, tubeMat);
    wireMesh.castShadow = true;
    wireMesh.receiveShadow = true;
    wireMesh.userData = { wireIndex, conn, curve };
    this.wiresGroup.add(wireMesh);

    if (!this.wireCurves) this.wireCurves = [];
    this.wireCurves.push({ curve, colorHex });
  }

  updateCalloutBadges() {
    if (!this.camera || !this.renderer) return;

    // If 2D Schematic mode is active, hide callout badges to prevent text collisions
    const schematic = document.getElementById('schematic-container');
    const is2D = schematic && schematic.style.display === 'flex';
    const legacyOverlay = document.querySelector('.pin-callout-overlay');
    if (is2D) {
      if (legacyOverlay) legacyOverlay.style.display = 'none';
      return;
    }

    const canvasRect = this.renderer.domElement.getBoundingClientRect();
    const width = canvasRect.width;
    const height = canvasRect.height;
    if (width === 0 || height === 0) return;

    const projectToScreen = (v3) => {
      if (!v3) return null;
      const v = v3.clone().project(this.camera);
      return {
        x: (v.x * 0.5 + 0.5) * width,
        y: (-(v.y * 0.5) + 0.5) * height,
        visible: v.z < 1.0
      };
    };

    let svgLinesHtml = '';
    const addSvgLine = (fromX, fromY, toX, toY) => {
      svgLinesHtml += `
        <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="#334155" stroke-width="1.2" stroke-linecap="round" />
        <circle cx="${toX}" cy="${toY}" r="3.5" fill="#00E5FF" stroke="#1E293B" stroke-width="1" />
      `;
    };

    // Update PIN ~9 (PWM) - Clamped bounds & positioned below wire trajectory
    const posPwm = projectToScreen(this.pinPositions["Uno.D9"]);
    const badgePwm = document.getElementById('badge-pin-pwm');
    if (badgePwm && posPwm && posPwm.visible) {
      const badgeX = Math.max(12, Math.min(width - 150, posPwm.x + 36));
      const badgeY = Math.max(16, Math.min(height - 35, posPwm.y + 14));
      badgePwm.style.transform = `translate(${badgeX}px, ${badgeY}px)`;
      badgePwm.style.display = 'flex';
      addSvgLine(badgeX, badgeY + 12, posPwm.x, posPwm.y);
    }

    // Update PIN A0 - Clamped bounds
    const posA0 = projectToScreen(this.pinPositions["Uno.A0"]);
    const badgeA0 = document.getElementById('badge-pin-a0');
    if (badgeA0 && posA0 && posA0.visible) {
      const badgeX = Math.max(12, Math.min(width - 130, posA0.x + 36));
      const badgeY = Math.max(16, Math.min(height - 35, posA0.y + 12));
      badgeA0.style.transform = `translate(${badgeX}px, ${badgeY}px)`;
      badgeA0.style.display = 'flex';
      addSvgLine(badgeX, badgeY + 12, posA0.x, posA0.y);
    }

    // Update POTENTIOMETER tag - Clamped at top edge so it never clips off-screen
    const posPot = projectToScreen(this.calloutTargets["POT"] || this.pinPositions["Breadboard.Pot_Leg2"]);
    const tagPot = document.getElementById('tag-pot');
    if (tagPot && posPot && posPot.visible) {
      const badgeX = Math.max(12, Math.min(width - 165, posPot.x + 48));
      const badgeY = Math.max(18, Math.min(height - 35, posPot.y - 14));
      tagPot.style.transform = `translate(${badgeX}px, ${badgeY}px)`;
      tagPot.style.display = 'flex';
      addSvgLine(badgeX, badgeY + 12, posPot.x, posPot.y);
    }

    // Update LED tag - Clamped bounds
    const posLed = projectToScreen(this.calloutTargets["LED"] || this.pinPositions["Breadboard.LED_Anode"]);
    const tagLed = document.getElementById('tag-led');
    if (tagLed && posLed && posLed.visible) {
      const badgeX = Math.max(12, Math.min(width - 120, posLed.x + 36));
      const badgeY = Math.max(18, Math.min(height - 35, posLed.y - 12));
      tagLed.style.transform = `translate(${badgeX}px, ${badgeY}px)`;
      tagLed.style.display = 'flex';
      addSvgLine(badgeX, badgeY + 12, posLed.x, posLed.y);
    }

    const svg = document.getElementById('callout-lines-svg');
    if (svg) {
      svg.innerHTML = svgLinesHtml;
    }
  }

  // =========================================================================
  // INTERACTIVE 3D HARDWARE BUTTONS & POTENTIOMETER
  // =========================================================================

  pressResetButton() {
    if (!this.resetButtonMesh) return;
    this.resetButtonMesh.position.y = 1.15;
    setTimeout(() => {
      if (this.resetButtonMesh) this.resetButtonMesh.position.y = 1.35;
    }, 180);
  }

  pressPushButton(isPressed) {
    if (!this.buttonMesh) return;
    this.buttonMesh.position.y = isPressed ? 0.85 : 1.1;
  }

  setupPotentiometerInteraction() {
    const dom = this.renderer.domElement;

    const onPointerDown = (clientX, clientY) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 1. Check Potentiometer Knob
      if (this.potKnobMesh) {
        const intersects = this.raycaster.intersectObjects(this.potKnobMesh.children, true);
        if (intersects.length > 0) {
          this.potIsDragging = true;
          if (this.controls) this.controls.enabled = false;

          const knobWorldPos = new THREE.Vector3();
          this.potKnobMesh.getWorldPosition(knobWorldPos);
          const screenPos = knobWorldPos.clone().project(this.camera);
          const screenX = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
          const screenY = (-(screenPos.y * 0.5) + 0.5) * rect.height + rect.top;

          this.potKnobCenter = { x: screenX, y: screenY };
          this.potPrevAngle = Math.atan2(clientY - screenY, clientX - screenX);
          return true;
        }
      }
      return false;
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.potIsDragging || !this.potKnobCenter) return;
      const currAngle = Math.atan2(clientY - this.potKnobCenter.y, clientX - this.potKnobCenter.x);
      const deltaAngle = Math.atan2(Math.sin(currAngle - this.potPrevAngle), Math.cos(currAngle - this.potPrevAngle));
      this.potPrevAngle = currAngle;

      const sweepRad = (270 * Math.PI) / 180;
      const scale = 1023 / sweepRad;
      this.potCurrentAngle = Math.max(0, Math.min(1023, this.potCurrentAngle + deltaAngle * scale));
      this.updatePotKnob(this.potCurrentAngle);
      this.updateLedState(Math.floor(this.potCurrentAngle / 4));

      const potSlider = document.getElementById('main-sensor-range') || document.getElementById('telemetry-pot-slider');
      if (potSlider) {
        potSlider.value = Math.round(this.potCurrentAngle);
        potSlider.dispatchEvent(new Event('input'));
      }
    };

    const onPointerUp = () => {
      if (this.potIsDragging) {
        this.potIsDragging = false;
        if (this.controls) this.controls.enabled = true;
      }
      if (this.buttonIsPressed) {
        this.buttonIsPressed = false;
        this.pressPushButton(false);
        if (typeof this.onPushButtonUp === 'function') this.onPushButtonUp();
      }
    };

    dom.addEventListener('mousedown', (e) => {
      if (onPointerDown(e.clientX, e.clientY)) return;

      // 2. Check 3D Arduino Uno Reset Button
      if (this.resetButtonMesh) {
        const hitReset = this.raycaster.intersectObject(this.resetButtonMesh, false);
        if (hitReset.length > 0) {
          this.pressResetButton();
          if (typeof this.onResetClick === 'function') this.onResetClick();
          return;
        }
      }

      // 3. Check 3D Breadboard Push Button (Lesson 3)
      if (this.buttonMesh) {
        const hitBtn = this.raycaster.intersectObject(this.buttonMesh, false);
        if (hitBtn.length > 0) {
          this.buttonIsPressed = true;
          this.pressPushButton(true);
          if (typeof this.onPushButtonDown === 'function') this.onPushButtonDown();
          return;
        }
      }

      // 4. Check Wire Cutter Tool (Snip 3D Wire)
      if (window.appCircuitBuilder && window.appCircuitBuilder.activeTool === 'cutter') {
        const hitWire = this.raycaster.intersectObjects(this.wiresGroup.children, true);
        if (hitWire.length > 0) {
          let root = hitWire[0].object;
          while (root && root.parent && root.parent !== this.wiresGroup) {
            root = root.parent;
          }
          if (root && root.userData && root.userData.conn) {
            window.appCircuitBuilder.removeWire(root.userData.conn.id);
            if (window.audioSynth) window.audioSynth.triggerTone(320, 0.06);
            return;
          } else if (window.appCircuitBuilder.userWires.length > 0) {
            const w = window.appCircuitBuilder.userWires[0];
            window.appCircuitBuilder.removeWire(w.id);
            if (window.audioSynth) window.audioSynth.triggerTone(320, 0.06);
            return;
          }
        }
      }

      // 5. Check Wire Connect Tool (Pick terminal pin in 3D)
      if (window.appCircuitBuilder && window.appCircuitBuilder.activeTool === 'wire') {
        const hits = this.raycaster.intersectObjects([this.boardGroup, this.breadboardGroup], true);
        if (hits.length > 0) {
          const hitPoint = hits[0].point;
          let closestPin = null;
          let minDist = 3.2;
          for (const [pinName, pos] of Object.entries(this.pinPositions)) {
            const d = hitPoint.distanceTo(pos);
            if (d < minDist) {
              minDist = d;
              closestPin = pinName;
            }
          }
          if (closestPin) {
            window.appCircuitBuilder.handlePinClick(closestPin);
            if (window.audioSynth) window.audioSynth.triggerTone(659.25, 0.05);
            return;
          }
        }
      }
    });

    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        if (onPointerDown(e.touches[0].clientX, e.touches[0].clientY)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.potIsDragging && e.touches && e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', onPointerUp);
  }

  // =========================================================================
  // REAL-TIME HARDWARE STATE TELEMETRY HOOKS
  // =========================================================================

  updateLedState(dutyCycle = 0, colorHex = null) {
    if (this.ledMesh && this.ledLight) {
      const norm = Math.max(0, Math.min(1, dutyCycle / 255));
      this.ledMesh.material.emissiveIntensity = 0.05 + norm * 3.6;
      this.ledLight.intensity = norm * 4.5;
      if (colorHex) {
        this.ledMesh.material.color.setHex(colorHex);
        this.ledMesh.material.emissive.setHex(colorHex);
        this.ledLight.color.setHex(colorHex);
      }
    }
  }

  updateUnoBuiltinLed(state) {
    if (this.lLed) {
      this.lLed.material.emissiveIntensity = state ? 2.5 : 0.2;
    }
  }

  flashTxRx() {
    if (this.txLed) {
      this.txLed.material.emissiveIntensity = 2.2;
      setTimeout(() => {
        if (this.txLed) this.txLed.material.emissiveIntensity = 0.2;
      }, 40);
    }
  }

  updatePotKnob(rawAngle0to1023) {
    this.potCurrentAngle = Math.max(0, Math.min(1023, rawAngle0to1023));
    if (this.potKnobMesh) {
      // 270 degree sweep: -135° (0) to +135° (1023) matching reference app
      const angleDeg = (this.potCurrentAngle / 1023) * 270 - 135;
      this.potKnobMesh.rotation.y = -angleDeg * (Math.PI / 180);
    }
  }

  updateServoAngle(angleDeg) {
    if (this.servoArmMesh) {
      this.servoArmMesh.rotation.y = (angleDeg * Math.PI) / 180;
    }
  }

  setButtonPressed(pressed) {
    if (this.buttonMesh) {
      this.buttonMesh.position.y = pressed ? 0.8 : 1.1;
    }
  }

  updateTrafficLight(state) {
    if (!this.trafficLeds.red) return;
    this.trafficLeds.red.material.emissiveIntensity = (state === 'red') ? 2.5 : 0.1;
    this.trafficLeds.yellow.material.emissiveIntensity = (state === 'yellow') ? 2.5 : 0.1;
    this.trafficLeds.green.material.emissiveIntensity = (state === 'green') ? 2.5 : 0.1;
  }

  // =========================================================================
  // CAMERA HUD CONTROLS & KEYBOARD SHORTCUTS
  // =========================================================================

  resetCamera() {
    if (this.controls) {
      this.controls.reset();
      this.camera.position.set(-2.0, 27.0, 29.0);
      this.controls.target.set(0.5, 1.0, 0);
      this.controls.update();
    }
  }

  rotateCamera(deltaAngle) {
    if (!this.camera || !this.controls) return;
    const target = this.controls.target;
    const offset = this.camera.position.clone().sub(target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaAngle);
    this.camera.position.copy(target).add(offset);
    this.camera.lookAt(target);
    this.controls.update();
  }

  zoomCamera(factor) {
    if (!this.camera) return;
    // Apply a gentler factor for smooth, controlled incremental zooming
    const softenedFactor = 1.0 + (factor - 1.0) * 0.45;
    this.camera.position.multiplyScalar(softenedFactor);
    const len = this.camera.position.length();
    if (len < 12) this.camera.position.setLength(12);
    if (len > 80) this.camera.position.setLength(80);
    if (this.controls) this.controls.update();
  }

  setFlowActive(active) {
    this.flowActive = !!active;
    if (!this.flowParticlesGroup) {
      this.flowParticlesGroup = new THREE.Group();
      this.scene.add(this.flowParticlesGroup);
    }
    this.flowParticlesGroup.visible = this.flowActive;
    if (this.flowActive) {
      this.rebuildFlowParticles();
    }
  }

  rebuildFlowParticles() {
    if (!this.flowParticlesGroup) return;
    while (this.flowParticlesGroup.children.length > 0) {
      const child = this.flowParticlesGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.flowParticlesGroup.remove(child);
    }
    if (!this.wireCurves || this.wireCurves.length === 0) return;

    const particleGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    this.flowParticles = [];
    this.wireCurves.forEach((wc, cIdx) => {
      // 3 glowing pulses along each wire
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(particleGeo, particleMat.clone());
        mesh.material.color.setHex(0x38bdf8);
        this.flowParticlesGroup.add(mesh);
        this.flowParticles.push({
          mesh,
          curve: wc.curve,
          offset: i / 3,
          speed: 0.32 + (cIdx % 3) * 0.06
        });
      }
    });
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const panSpeed = 1.2;
      const rotSpeed = 0.05;

      switch (e.key.toLowerCase()) {
        case 'w':
          this.camera.position.z -= panSpeed;
          if (this.controls) this.controls.target.z -= panSpeed;
          break;
        case 's':
          this.camera.position.z += panSpeed;
          if (this.controls) this.controls.target.z += panSpeed;
          break;
        case 'a':
          this.camera.position.x -= panSpeed;
          if (this.controls) this.controls.target.x -= panSpeed;
          break;
        case 'd':
          this.camera.position.x += panSpeed;
          if (this.controls) this.controls.target.x += panSpeed;
          break;
        case 'q':
          this.rotateCamera(rotSpeed * 2);
          break;
        case 'e':
          this.rotateCamera(-rotSpeed * 2);
          break;
      }
    });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.updateCalloutBadges();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    if (this.motorFanMesh) {
      this.motorFanMesh.rotation.y += 0.35;
    }

    // Animated Electric Current Flow Pulses
    if (this.flowActive && this.flowParticles && this.flowParticles.length > 0) {
      const now = performance.now() * 0.001;
      this.flowParticles.forEach(p => {
        const t = (now * p.speed + p.offset) % 1.0;
        const pt = p.curve.getPointAt(t);
        p.mesh.position.copy(pt);
      });
    }

    this.updateCalloutBadges();
    if (typeof window.update3DCallouts === 'function') {
      window.update3DCallouts();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.Arduino3DWorkbench = Arduino3DWorkbench;
