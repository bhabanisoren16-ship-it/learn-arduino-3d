// Learn Arduino — Pixel-Accurate Reference Controller
// Fully aligned with Dilum Sanjaya's learn-arduino-red design system

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Workbench
  const workbench = new Arduino3DWorkbench('viewport3d');
  window.appWorkbench = workbench;

  // 2. Initialize 2D Schematic
  const schematicView = new SchematicView('schematic-container');
  window.appSchematic = schematicView;

  // 3. Initialize Circuit Builder & Studio Hand Tools
  const circuitBuilder = new CircuitBuilder(workbench);
  window.appCircuitBuilder = circuitBuilder;

  // 4. Initialize Virtual Arduino Simulator
  const serialOutputElem = document.getElementById('serial-log');
  const simulator = new ArduinoSimulator(workbench, (text) => {
    if (!serialOutputElem) return;
    const div = document.createElement('div');
    div.textContent = text;
    serialOutputElem.appendChild(div);
    serialOutputElem.scrollTop = serialOutputElem.scrollHeight;
  });
  window.appSimulator = simulator;

  // 5. Active Lesson State (Defaults to Lesson 4: #knob)
  let currentLesson = getLessonByHash(window.location.hash || '#knob') || LESSONS_DATA[3];
  let activeTab = 'overview';
  let isSimActive = false;

  // =========================================================================
  // BACKGROUND PCB CIRCUIT TRACES (Exact math from reference)
  // =========================================================================

  function renderBackgroundTraces() {
    const svg = document.getElementById('traces');
    if (!svg) return;

    const ne = 1672, re = 941;
    const w = window.innerWidth, h = window.innerHeight;
    const r = w - ne, i = h - re;

    const ie = [
      { a: 'tl', p: [[90,410],[90,104],[99,95],[624,95],[655,63],[736,63],[771,28],[884,28],[912,0]] },
      { a: 'tl', p: [[627,88],[737,88]], end: 'circle' },
      { a: 'tl', p: [[750,82],[785,47],[893,47],[940,0]] },
      { a: 'tl', p: [[108,151],[108,118],[116,110],[540,110],[552,98]] },
      { a: 'tl', p: [[60,0],[60,40],[76,56]] },
      { a: 'tl', p: [[90,410],[113,433],[113,455]], end: 'circle' },
      { a: 'tl', p: [[100,405],[100,395]], start: 'circle' },
      { a: 'tl', p: [[136,300],[136,525],[96,565],[96,610],[72,634]] },
      { a: 'tl', p: [[112,382],[124,394],[124,402]], start: 'circle' },
      { a: 'tl', p: [[108,492],[108,520],[81,547],[81,600],[72,609]] },
      { a: 'tl', p: [[118,585],[118,545],[150,513],[150,470]], end: 'circle' },
      { a: 'bl', p: [[0,735],[64,671],[64,610],[72,602]] },
      { a: 'bl', p: [[0,780],[30,750],[30,700],[45,685]] },
      { a: 'bl', p: [[0,868],[72,796]] },
      { a: 'bl', p: [[106,735],[143,760],[226,760],[266,800],[1424,800]] },
      { a: 'bl', p: [[1436,800],[1536,800],[1596,860],[1672,860]], start: 'circle' },
      { a: 'bl', p: [[200,760],[218,742],[218,720]], end: 'circle' },
      { a: 'br', p: [[1590,924],[1622,892],[1672,892]], start: 'circle' },
      { a: 'br', p: [[1636,880],[1636,870],[1652,854],[1672,854]], start: 'circle' },
      { a: 'br', p: [[1592,830],[1556,830],[1536,850],[1536,941]] },
      { a: 'br', p: [[1500,941],[1500,912],[1520,892]] },
      { a: 'br', p: [[1652,941],[1652,924],[1640,912]], end: 'circle' },
      { a: 'tr', p: [[1068,81],[1086,81],[1138,19],[1150,19]], start: 'circle' },
      { a: 'tr', p: [[1620,74],[1640,94],[1640,104],[1660,124],[1660,262]], end: 'circle' },
      { a: 'tr', p: [[1650,64],[1672,86]] },
      { a: 'tr', p: [[1590,104],[1600,114],[1600,160]] },
      { a: 'tr', p: [[1636,84],[1636,92],[1652,108],[1652,112]] },
      { a: 'tr', p: [[1595,104],[1595,108],[1580,108],[1582,104]] },
      { a: 'tr', p: [[1672,300],[1666,306],[1666,470]] },
      { a: 'br', p: [[1652,520],[1652,790],[1630,812]] }
    ];

    const ae = [
      { a: 'tl', s: [[925,37,11,0.95],[1056,22,9,0.45],[1068,28,7,0.35],[1076,22,14,0.75],[1063,36,13,0.6],[1083,36,8,0.5]] },
      { a: 'tr', s: [[1612,22,13,0.6],[1628,20,15,0.8],[1645,22,10,0.5],[1614,36,9,0.45],[1630,37,12,0.7],[1622,49,10,0.55],[1640,52,9,0.75],[1631,64,8,0.85]] },
      { a: 'tl', s: [[214,350,8,0.45],[100,678,11,0.6],[87,694,8,0.4],[98,712,8,0.45]] },
      { a: 'bl', s: [[243,760,9,0.5],[36,815,11,0.6],[27,830,9,0.5],[44,830,8,0.45],[22,844,8,0.4],[16,912,9,0.5]] },
      { a: 'br', s: [[1625,808,12,0.6],[1640,818,13,0.8],[1626,824,10,0.55],[1652,812,9,0.5],[1645,832,9,0.7],[1510,919,8,0.6]] }
    ];

    const transformPt = (anchor, x, y) => [
      anchor.includes('r') ? x + r : x,
      anchor.includes('b') ? y + i : y
    ];

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    let innerHtml = '<g>';

    for (let trace of ie) {
      let pts = trace.p.map(([px, py]) => transformPt(trace.a, px, py));
      if (pts.length > 1) {
        innerHtml += `<path d="M${pts.map(p => p.join(' ')).join(' L')}" />`;
      }
      if (trace.start === 'circle') {
        innerHtml += `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5.5" />`;
      }
      if (trace.end === 'circle') {
        let last = pts[pts.length - 1];
        innerHtml += `<circle cx="${last[0]}" cy="${last[1]}" r="5.5" />`;
      }
    }
    innerHtml += '</g><g>';

    for (let padGroup of ae) {
      for (let [px, py, size, op] of padGroup.s) {
        let [x, y] = transformPt(padGroup.a, px, py);
        innerHtml += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="1" opacity="${op}" class="pix" />`;
      }
    }
    innerHtml += '</g>';
    svg.innerHTML = innerHtml;
  }

  window.addEventListener('resize', renderBackgroundTraces);
  renderBackgroundTraces();

  // =========================================================================
  // VECTOR SVG ICONS REPOSITORY (Exact from reference)
  // =========================================================================

  const ICONS_SVG = {
    knob: `<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="11"/><path d="M20 22l-5.5-7"/><path d="M6.5 32.5a16 16 0 0 1 0-21M33.5 11.5a16 16 0 0 1 0 21"/></svg>`,
    wave: `<svg viewBox="0 0 44 40"><path d="M2.5 23h6l4.5-11 6.5 19 6-25 5.5 21 3.5-7.5 2.5 3.5h5"/></svg>`,
    pwm: `<svg viewBox="0 0 44 40"><path d="M2.5 29h5V11h6v18h4V11h10v18h4V11h10"/></svg>`,
    led: `<svg viewBox="0 0 40 40"><path d="M13.5 23v-8.5a6.5 6.5 0 0 1 13 0V23"/><path d="M10.5 23h19"/><path d="M16.5 23v13M23.5 23v9"/><path d="M20 2.5v3.2M7.5 7.5l2.3 2.3M32.5 7.5l-2.3 2.3"/></svg>`,
    resistor: `<svg viewBox="0 0 44 40"><path d="M2 20h8M34 20h8"/><rect x="10" y="13.5" width="24" height="13" rx="5.5"/><path d="M16.5 13.8v12.4M21.5 13.8v12.4M28 13.8v12.4"/></svg>`,
    chip: `<svg viewBox="0 0 40 40"><rect x="9.5" y="9.5" width="21" height="21" rx="2"/><rect x="14" y="14" width="12" height="12" rx="1" class="fill"/><path d="M14.5 4v5.5M20 4v5.5M25.5 4v5.5M14.5 30.5V36M20 30.5V36M25.5 30.5V36M4 14.5h5.5M4 20h5.5M4 25.5h5.5M30.5 14.5H36M30.5 20H36M30.5 25.5H36"/></svg>`,
    bulb: `<svg viewBox="0 0 40 40"><path d="M20 9.5a8 8 0 0 0-4.8 14.4c.8.6 1.3 1.6 1.3 2.6v1h7v-1c0-1 .5-2 1.3-2.6A8 8 0 0 0 20 9.5zM16.8 31h6.4M17.8 34h4.4"/><path d="M20 2.5v3M8.8 7l2 2M31.2 7l-2 2M4.5 17.5h3M32.5 17.5h3"/></svg>`
  };

  function getIcon(name) {
    return ICONS_SVG[name] || ICONS_SVG.chip;
  }

  // =========================================================================
  // CLOCK & HEADER PROGRESS
  // =========================================================================

  function updateClock() {
    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const dateEl = document.getElementById('clock-date');
    const timeEl = document.getElementById('clock-time');
    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // =========================================================================
  // DYNAMIC RIGHT INFO-CARD TABS (Overview, Pinout, Example, Specs)
  // =========================================================================

  const infoContent = document.getElementById('info-content');
  const infoTabs = document.querySelectorAll('.inspector-tab-btn');

  function renderInfoTab(lesson, tab) {
    if (!infoContent) return;

    if (tab === 'pinout') {
      const pinRows = (lesson.pinout || []).map(p => {
        const pin = p.pin || p[0];
        const conn = p.function || p[1];
        const desc = p.signal || p[2];
        const col = p.color || p[3] || '#3fae6a';
        return `
          <tr>
            <td><span class="wire-dot" style="--c:${col};"></span><code>${pin}</code></td>
            <td>${conn}</td>
            <td>${desc}</td>
          </tr>
        `;
      }).join('');

      infoContent.innerHTML = `
        <h2>Pinout</h2>
        <p class="sub">${lesson.id === 1 ? 'How the Uno’s headers are grouped.' : 'How this circuit is wired.'}</p>
        <table class="pin-table">
          <thead>
            <tr><th>Pin</th><th>Connects to</th><th>What it does</th></tr>
          </thead>
          <tbody>${pinRows}</tbody>
        </table>
      `;
    } else if (tab === 'example') {
      const steps = (lesson.example || [
        `<code>analogRead(POT)</code> measures the wiper voltage: 0 V is 0, 5 V is 1023.`,
        `PWM only goes up to 255, so <code>value / 4</code> scales the reading to fit.`,
        `<code>analogWrite(LED, …)</code> pulses pin 9 so fast the LED looks dimmed.`,
        `Open the serial monitor (press Run) to watch the numbers as you turn.`
      ]).map(s => `<li>${s}</li>`).join('');

      infoContent.innerHTML = `
        <h2>How the code works</h2>
        <ol class="steps">${steps}</ol>
      `;
    } else if (tab === 'specs') {
      const specsList = (lesson.specs || [
        ['Potentiometer', '10 kΩ linear, 270° travel'],
        ['ADC', '10-bit, 0–1023'],
        ['Resolution', '≈ 4.9 mV per step'],
        ['PWM', '8-bit, 0–255 at ~490 Hz'],
        ['Read time', '≈ 100 µs per <code>analogRead()</code>']
      ]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

      infoContent.innerHTML = `
        <h2>Specifications</h2>
        <dl class="spec-grid">${specsList}</dl>
      `;
    } else {
      // Overview Tab (default)
      const heading = lesson.heading || lesson.title.replace(/^[0-9]+\.\s*/, '');
      const lede = lesson.lede || (lesson.overview && lesson.overview.concept) || '';
      const features = (lesson.features || [
        ['knob', 'Drag around the knob to turn it'],
        ['wave', '<code>analogRead()</code> gives 0–1023'],
        ['pwm', '<code>analogWrite()</code> dims the LED, 0–255']
      ]).map(([icon, text]) => `
        <li>
          <span class="feature-icon">${getIcon(icon)}</span>
          <span>${text}</span>
        </li>
      `).join('');

      infoContent.innerHTML = `
        <h2>${heading}</h2>
        <p class="lede">${lede}</p>
        <ul class="features">${features}</ul>
      `;
    }
  }

  function setTab(tabName) {
    activeTab = tabName;
    infoTabs.forEach(btn => {
      const isActive = btn.dataset.tab === `tab-${tabName}` || btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', isActive);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    renderInfoTab(currentLesson, activeTab);
  }

  infoTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab.replace(/^tab-/, '');
      setTab(tabKey);
    });
  });

  // =========================================================================
  // CARD EXPANSION LOGIC (.info-card and .code-card mutual toggles)
  // =========================================================================

  const infoCard = document.getElementById('info-card');
  const codeCard = document.getElementById('code-card');
  const btnExpandInfo = document.getElementById('btn-expand-info');
  const btnExpandCode = document.getElementById('btn-expand-code');

  btnExpandInfo?.addEventListener('click', () => {
    const isExpanded = infoCard.classList.toggle('is-expanded');
    if (isExpanded) {
      codeCard.classList.remove('is-expanded');
    }
    btnExpandInfo.setAttribute('title', isExpanded ? 'Collapse panel' : 'Expand panel');
    window.dispatchEvent(new Event('resize'));
  });

  btnExpandCode?.addEventListener('click', () => {
    const isExpanded = codeCard.classList.toggle('is-expanded');
    if (isExpanded) {
      infoCard.classList.remove('is-expanded');
    }
    btnExpandCode.setAttribute('title', isExpanded ? 'Collapse code' : 'Expand code');
    window.dispatchEvent(new Event('resize'));
  });

  // =========================================================================
  // CODE EDITOR & SYNTAX LINE NUMBERS
  // =========================================================================

  const editor = document.getElementById('code-editor');
  const lineNumbers = document.getElementById('code-line-numbers');

  function updateLineNumbers() {
    if (!editor || !lineNumbers) return;
    const lines = editor.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
  }

  if (editor) {
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', () => {
      if (lineNumbers) lineNumbers.scrollTop = editor.scrollTop;
    });
  }

  // Copy Code Button
  const btnCopy = document.getElementById('btn-copy-code');
  btnCopy?.addEventListener('click', () => {
    if (!editor) return;
    navigator.clipboard.writeText(editor.value);
    btnCopy.classList.add('is-done');
    setTimeout(() => btnCopy.classList.remove('is-done'), 1500);
  });

  // Reset Code Button
  const btnReset = document.getElementById('btn-reset-code');
  btnReset?.addEventListener('click', () => {
    if (!editor) return;
    editor.value = currentLesson.code;
    updateLineNumbers();
    if (window.audioSynth) window.audioSynth.triggerTone(659, 0.06);
  });

  // Export .ino Button
  const btnExport = document.getElementById('btn-export-code');
  btnExport?.addEventListener('click', () => {
    const code = editor ? editor.value : currentLesson.code;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLesson.slug || 'arduino_sketch'}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // =========================================================================
  // SERIAL MONITOR CONSOLE & RUN/STOP SKETCH
  // =========================================================================

  const consoleDrawer = document.getElementById('console-drawer');
  const btnRun = document.getElementById('btn-verify-run');
  const consoleStatusText = document.getElementById('console-status-text');
  const btnCloseConsole = document.getElementById('btn-close-console');
  const btnClearSerial = document.getElementById('btn-clear-serial');
  const serialInput = document.getElementById('serial-input');
  const btnSerialSend = document.getElementById('btn-serial-send');

  let telemetryInterval = null;

  function startSimulation() {
    isSimActive = true;
    codeCard.setAttribute('data-state', 'running');
    consoleDrawer.classList.add('is-open');
    if (consoleStatusText) consoleStatusText.textContent = 'Running (9600 baud)';

    const code = editor ? editor.value : currentLesson.code;
    simulator.runSketch(code, currentLesson);

    // If Lesson 4 (#knob), start high-fidelity serial output stream matching guide: "knob = X brightness = Y"
    if (currentLesson.id === 4) {
      if (telemetryInterval) clearInterval(telemetryInterval);
      telemetryInterval = setInterval(() => {
        if (!isSimActive) return;
        const raw = parseInt(mainRange.value, 10);
        const bright = Math.floor(raw / 4);
        const div = document.createElement('div');
        div.textContent = `knob = ${raw} brightness = ${bright}`;
        serialOutputElem.appendChild(div);
        serialOutputElem.scrollTop = serialOutputElem.scrollHeight;
        if (serialOutputElem.children.length > 50) {
          serialOutputElem.removeChild(serialOutputElem.firstChild);
        }
      }, 250);
    }
  }

  function stopSimulation() {
    isSimActive = false;
    codeCard.setAttribute('data-state', 'idle');
    if (consoleStatusText) consoleStatusText.textContent = 'Stopped';
    if (telemetryInterval) {
      clearInterval(telemetryInterval);
      telemetryInterval = null;
    }
    simulator.stopSketch();
  }

  btnRun?.addEventListener('click', () => {
    if (!isSimActive) startSimulation();
    else stopSimulation();
  });

  btnCloseConsole?.addEventListener('click', () => {
    stopSimulation();
    consoleDrawer.classList.remove('is-open');
  });

  btnClearSerial?.addEventListener('click', () => {
    if (serialOutputElem) serialOutputElem.innerHTML = '';
  });

  function sendSerialCmd() {
    if (!serialInput) return;
    const cmd = serialInput.value.trim();
    if (!cmd) return;
    const div = document.createElement('div');
    div.style.color = 'var(--navy)';
    div.style.fontWeight = '700';
    div.textContent = `> ${cmd}`;
    serialOutputElem.appendChild(div);

    if (!isNaN(parseInt(cmd, 10))) {
      const val = Math.max(0, Math.min(1023, parseInt(cmd, 10)));
      mainRange.value = val;
      mainRange.dispatchEvent(new Event('input'));
    }
    serialInput.value = '';
    serialOutputElem.scrollTop = serialOutputElem.scrollHeight;
  }

  btnSerialSend?.addEventListener('click', sendSerialCmd);
  serialInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendSerialCmd();
    }
  });

  // =========================================================================
  // INTERACTIVE SENSOR SLIDER & POTENTIOMETER SYNC
  // =========================================================================

  const mainRange = document.getElementById('main-sensor-range');
  const mainValue = document.getElementById('sensor-slider-value');
  const mainLabel = document.getElementById('sensor-slider-label');
  const mainPushBtn = document.getElementById('main-push-btn');

  function updateSensorUI(lesson) {
    if (!mainRange || !mainValue) return;

    if (lesson.id === 4) {
      mainLabel.textContent = 'Potentiometer (A0)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 0;
      mainRange.max = 1023;
      mainRange.value = 512;
      mainValue.textContent = '512 ADC';
      simulator.sensorInputs.knob_raw = 512;
      simulator.analogInputs.A0 = 512;
      workbench.updatePotKnob(512);
      workbench.updateLedState(Math.floor(512 / 4));
    } else if (lesson.id === 3) {
      mainLabel.textContent = 'Push Button (D2)';
      mainRange.style.display = 'none';
      if (mainPushBtn) mainPushBtn.style.display = 'block';
      mainValue.textContent = 'RELEASED (HIGH)';
      simulator.sensorInputs.button_state = 0;
    } else if (lesson.id === 2) {
      mainLabel.textContent = 'Blink Delay (ms)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 100;
      mainRange.max = 2000;
      mainRange.value = 1000;
      mainValue.textContent = '1000 ms';
      simulator.sensorInputs.blink_rate = 1000;
    } else if (lesson.id === 6) {
      mainLabel.textContent = 'Photoresistor (A0)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 0;
      mainRange.max = 1023;
      mainRange.value = 750;
      mainValue.textContent = '750 ADC (Light)';
      simulator.sensorInputs.light_lux = 750;
      simulator.analogInputs.A0 = 750;
    } else if (lesson.id === 7) {
      mainLabel.textContent = 'Sonar Distance (cm)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 2;
      mainRange.max = 400;
      mainRange.value = 25;
      mainValue.textContent = '25 cm';
      simulator.sensorInputs.obstacle_dist = 25;
    } else if (lesson.id === 8) {
      mainLabel.textContent = 'Tone Frequency (Hz)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 100;
      mainRange.max = 2000;
      mainRange.value = 440;
      mainValue.textContent = '440 Hz (A4)';
      simulator.sensorInputs.tone_freq = 440;
    } else if (lesson.id === 11) {
      mainLabel.textContent = 'Temperature Sensor (A0)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = -40;
      mainRange.max = 125;
      mainRange.value = 24;
      mainValue.textContent = '24.0 °C';
      simulator.sensorInputs.temperature_c = 24;
      simulator.analogInputs.A0 = Math.round((24 * 10 + 500) * 1023 / 5000);
    } else if (lesson.id === 12) {
      mainLabel.textContent = 'Servo Target Angle';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 0;
      mainRange.max = 180;
      mainRange.value = 90;
      mainValue.textContent = '90°';
      simulator.sensorInputs.servo_angle = 90;
      workbench.updateServoAngle(90);
    } else {
      mainLabel.textContent = 'Sensor Input (A0)';
      mainRange.style.display = 'block';
      if (mainPushBtn) mainPushBtn.style.display = 'none';
      mainRange.min = 0;
      mainRange.max = 1023;
      mainRange.value = 512;
      mainValue.textContent = '512 ADC';
      simulator.sensorInputs.knob_raw = 512;
      simulator.analogInputs.A0 = 512;
    }
  }

  mainRange?.addEventListener('input', () => {
    const raw = parseInt(mainRange.value, 10);
    if (currentLesson.id === 4) {
      if (mainValue) mainValue.textContent = `${raw} ADC`;
      simulator.sensorInputs.knob_raw = raw;
      simulator.analogInputs.A0 = raw;
      workbench.updatePotKnob(raw);
      workbench.updateLedState(Math.floor(raw / 4));
    } else if (currentLesson.id === 2) {
      if (mainValue) mainValue.textContent = `${raw} ms`;
      simulator.sensorInputs.blink_rate = raw;
    } else if (currentLesson.id === 6) {
      if (mainValue) mainValue.textContent = `${raw} ADC`;
      simulator.sensorInputs.light_lux = raw;
      simulator.analogInputs.A0 = raw;
    } else if (currentLesson.id === 7) {
      if (mainValue) mainValue.textContent = `${raw} cm`;
      simulator.sensorInputs.obstacle_dist = raw;
    } else if (currentLesson.id === 8) {
      if (mainValue) mainValue.textContent = `${raw} Hz`;
      simulator.sensorInputs.tone_freq = raw;
    } else if (currentLesson.id === 11) {
      if (mainValue) mainValue.textContent = `${raw} °C`;
      simulator.sensorInputs.temperature_c = raw;
      simulator.analogInputs.A0 = Math.round((raw * 10 + 500) * 1023 / 5000);
    } else if (currentLesson.id === 12) {
      if (mainValue) mainValue.textContent = `${raw}°`;
      simulator.sensorInputs.servo_angle = raw;
      workbench.updateServoAngle(raw);
    } else {
      if (mainValue) mainValue.textContent = `${raw} ADC`;
      simulator.sensorInputs.knob_raw = raw;
      simulator.analogInputs.A0 = raw;
    }
  });

  // Tactile Push Button Event Listeners (UI & 3D Synchronization)
  function setBtnPressed(pressed) {
    if (simulator) simulator.sensorInputs.button_state = pressed ? 1 : 0;
    workbench?.pressPushButton(pressed);
    if (pressed) {
      mainPushBtn?.classList.add('active');
      if (mainValue) mainValue.textContent = 'PRESSED (LOW - 0V)';
      window.audioSynth?.triggerClick();
    } else {
      mainPushBtn?.classList.remove('active');
      if (mainValue) mainValue.textContent = 'RELEASED (HIGH - 5V)';
      window.audioSynth?.triggerClick();
    }
  }

  mainPushBtn?.addEventListener('mousedown', () => setBtnPressed(true));
  mainPushBtn?.addEventListener('mouseup', () => setBtnPressed(false));
  mainPushBtn?.addEventListener('mouseleave', () => setBtnPressed(false));
  mainPushBtn?.addEventListener('touchstart', (e) => { e.preventDefault(); setBtnPressed(true); });
  mainPushBtn?.addEventListener('touchend', (e) => { e.preventDefault(); setBtnPressed(false); });

  // 3D Scene Hardware Interaction Callbacks
  workbench.onPushButtonDown = () => setBtnPressed(true);
  workbench.onPushButtonUp = () => setBtnPressed(false);
  workbench.onResetClick = () => {
    if (window.audioSynth) window.audioSynth.triggerTone(440, 0.08);
    stopSimulation();
    if (serialOutputElem) {
      const div = document.createElement('div');
      div.style.color = '#dc2626';
      div.style.fontWeight = '700';
      div.textContent = '[SYSTEM]: Hardware Reset button pressed. Restarting sketch...';
      serialOutputElem.appendChild(div);
      serialOutputElem.scrollTop = serialOutputElem.scrollHeight;
    }
    setTimeout(() => startSimulation(), 350);
  };

  // =========================================================================
  // 3D RICH CALLOUT CARDS & LEADER LINES
  // =========================================================================

  const calloutsContainer = document.getElementById('callouts');
  const leadersSvg = document.getElementById('leaders');

  function update3DCallouts() {
    if (!calloutsContainer || !leadersSvg || !workbench.camera || !workbench.renderer) return;

    // Skip if 2D schematic is visible
    const schematic = document.getElementById('schematic-container');
    if (schematic && schematic.style.display === 'flex') {
      calloutsContainer.innerHTML = '';
      leadersSvg.innerHTML = '';
      return;
    }

    const rect = workbench.renderer.domElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    leadersSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const projectToScreen = (v3) => {
      if (!v3) return null;
      const v = v3.clone().project(workbench.camera);
      return {
        x: (v.x * 0.5 + 0.5) * w,
        y: (-(v.y * 0.5) + 0.5) * h,
        visible: v.z < 1.0
      };
    };

    let calloutDefs = [];

    if (currentLesson.id === 4) {
      calloutDefs = [
        {
          id: 'pot',
          icon: 'knob',
          title: 'POTENTIOMETER',
          body: 'Drag around the knob to turn it.',
          target: workbench.calloutTargets["POT"] || workbench.pinPositions["Breadboard.Pot_Leg2"],
          offsetX: 75,
          offsetY: -75
        },
        {
          id: 'led',
          icon: 'led',
          title: 'LED',
          body: 'Brightness follows the knob.',
          target: workbench.calloutTargets["LED"] || workbench.pinPositions["Breadboard.LED_Anode"],
          offsetX: 85,
          offsetY: -15
        },
        {
          id: 'a0',
          icon: 'wave',
          title: 'PIN A0',
          body: 'Reads the knob as a number, 0–1023.',
          target: workbench.pinPositions["Uno.A0"],
          offsetX: -190,
          offsetY: 35
        },
        {
          id: 'd9',
          icon: 'pwm',
          title: 'PIN ~9 (PWM)',
          body: 'Controls the LED with fast pulses.',
          target: workbench.pinPositions["Uno.D9"],
          offsetX: -195,
          offsetY: -45
        }
      ];
    } else if (currentLesson.id === 1) {
      calloutDefs = [
        {
          id: 'mcu',
          icon: 'chip',
          title: 'ATMEGA328P',
          body: '8-bit AVR microcontroller running at 16 MHz.',
          target: workbench.calloutTargets["MCU"] || new THREE.Vector3(-8.8, 1.2, -0.6),
          offsetX: 60,
          offsetY: -70
        },
        {
          id: 'd13',
          icon: 'led',
          title: 'PIN 13 (L LED)',
          body: 'Built-in SMD LED driven directly by pin 13.',
          target: workbench.pinPositions["Uno.D13"],
          offsetX: -240,
          offsetY: -40
        },
        {
          id: 'usb',
          icon: 'pwm',
          title: 'USB TYPE-B',
          body: 'Supplies 5V regulated power & USB serial telemetry.',
          target: new THREE.Vector3(-12.8, 1.4, -6.0),
          offsetX: -240,
          offsetY: -90
        }
      ];
    } else if (currentLesson.id === 2) {
      calloutDefs = [
        {
          id: 'd13',
          icon: 'pwm',
          title: 'PIN 13',
          body: 'Outputs HIGH (5V) and LOW (0V) pulses.',
          target: workbench.pinPositions["Uno.D13"],
          offsetX: -240,
          offsetY: -40
        },
        {
          id: 'resistor',
          icon: 'resistor',
          title: '220 Ω RESISTOR',
          body: 'Current limiter drops 3.0V at 13.6 mA.',
          target: workbench.calloutTargets["RES"] || workbench.pinPositions["Breadboard.Resistor1"],
          offsetX: 70,
          offsetY: -70
        },
        {
          id: 'led',
          icon: 'led',
          title: 'LED',
          body: 'Discrete 5mm LED diode emits light when pin 13 is HIGH.',
          target: workbench.calloutTargets["LED"] || workbench.pinPositions["Breadboard.LED_Anode"],
          offsetX: 85,
          offsetY: 10
        }
      ];
    } else if (currentLesson.id === 3) {
      calloutDefs = [
        {
          id: 'btn',
          icon: 'chip',
          title: 'TACTILE BUTTON',
          body: 'Press and hold to pull pin D2 to Ground.',
          target: workbench.calloutTargets["BTN"] || workbench.pinPositions["Breadboard.Button_Pin1"],
          offsetX: 80,
          offsetY: -70
        },
        {
          id: 'd2',
          icon: 'wave',
          title: 'PIN 2',
          body: 'Reads HIGH when open, LOW when pressed (INPUT_PULLUP).',
          target: workbench.pinPositions["Uno.D2"],
          offsetX: -240,
          offsetY: 20
        },
        {
          id: 'led',
          icon: 'led',
          title: 'LED',
          body: 'Illuminates when ATmega detects button pressed.',
          target: workbench.calloutTargets["LED"] || workbench.pinPositions["Breadboard.LED_Anode"],
          offsetX: 80,
          offsetY: 20
        }
      ];
    } else if (currentLesson.id === 7) {
      calloutDefs = [
        {
          id: 'sonar',
          icon: 'wave',
          title: 'HC-SR04 SENSOR',
          body: 'Emits 40 kHz ultrasonic pings and measures echo time.',
          target: workbench.calloutTargets["SONAR"] || workbench.getBreadboardHole(11, 'c'),
          offsetX: 85,
          offsetY: -75
        },
        {
          id: 'trig',
          icon: 'pwm',
          title: 'PIN 9 (TRIG)',
          body: '10 µs pulse triggers the acoustic ping.',
          target: workbench.pinPositions["Uno.D9"],
          offsetX: -260,
          offsetY: 30
        },
        {
          id: 'echo',
          icon: 'wave',
          title: 'PIN 10 (ECHO)',
          body: 'pulseIn() times sound round-trip (58 µs/cm).',
          target: workbench.pinPositions["Uno.D10"] || workbench.pinPositions["Uno.D9"],
          offsetX: -190,
          offsetY: 85
        }
      ];
    } else {
      calloutDefs = [
        {
          id: 'part',
          icon: 'chip',
          title: currentLesson.title.replace(/^[0-9]+\.\s*/, '').toUpperCase(),
          body: currentLesson.subtitle || 'Active sensor module connected to Arduino.',
          target: workbench.calloutTargets["LED"] || workbench.calloutTargets["POT"] || workbench.getBreadboardHole(15, 'c'),
          offsetX: 80,
          offsetY: -60
        },
        {
          id: 'a0',
          icon: 'wave',
          title: 'SIGNAL PIN',
          body: 'Reads sensor telemetry voltage.',
          target: workbench.pinPositions["Uno.A0"] || workbench.pinPositions["Uno.D9"],
          offsetX: -240,
          offsetY: 20
        }
      ];
    }

    let cardsHtml = '';
    let linesHtml = '';
    const placedCards = [];

    for (let c of calloutDefs) {
      const pos = projectToScreen(c.target);
      if (!pos || !pos.visible) continue;

      const cardW = 240;
      const cardH = 68;
      let cardX = Math.max(16, Math.min(w - cardW - 20, pos.x + c.offsetX));
      let cardY = Math.max(16, Math.min(h - cardH - 64, pos.y + c.offsetY));

      // Intelligent collision avoidance between adjacent cards
      for (const placed of placedCards) {
        const overlapX = Math.abs(cardX - placed.x) < (cardW + 14);
        const overlapY = Math.abs(cardY - placed.y) < (cardH + 10);
        if (overlapX && overlapY) {
          if (c.offsetX >= 0) {
            cardY = placed.y + cardH + 12;
          } else {
            cardX = placed.x + cardW + 14;
          }
        }
      }
      cardX = Math.max(16, Math.min(w - cardW - 20, cardX));
      cardY = Math.max(16, Math.min(h - cardH - 64, cardY));
      placedCards.push({ id: c.id, x: cardX, y: cardY });

      cardsHtml += `
        <div class="callout" data-callout-id="${c.id}" style="left:${cardX}px; top:${cardY}px;">
          <div class="callout-icon">${getIcon(c.icon)}</div>
          <div class="callout-text">
            <h3>${c.title}</h3>
            <p>${c.body}</p>
          </div>
        </div>
      `;

      // Connect anchor neatly to nearest card edge
      let anchorX, anchorY;
      if (pos.x > cardX + cardW) {
        anchorX = cardX + cardW;
        anchorY = cardY + cardH / 2;
      } else if (pos.x < cardX) {
        anchorX = cardX;
        anchorY = cardY + cardH / 2;
      } else if (pos.y < cardY) {
        anchorX = cardX + cardW / 2;
        anchorY = cardY;
      } else {
        anchorX = cardX + cardW / 2;
        anchorY = cardY + cardH;
      }

      linesHtml += `
        <line x1="${anchorX}" y1="${anchorY}" x2="${pos.x}" y2="${pos.y}" />
        <circle cx="${pos.x}" cy="${pos.y}" r="4" class="dot" />
      `;
    }

    const existingCards = calloutsContainer.querySelectorAll('.callout');
    const existingIds = Array.from(existingCards).map(el => el.getAttribute('data-callout-id')).join(',');
    const newIds = placedCards.map(p => p.id).join(',');

    if (existingIds === newIds && existingCards.length === placedCards.length) {
      placedCards.forEach((p, idx) => {
        existingCards[idx].style.left = `${p.x}px`;
        existingCards[idx].style.top = `${p.y}px`;
      });
    } else {
      calloutsContainer.innerHTML = cardsHtml;
    }
    leadersSvg.innerHTML = linesHtml;
  }

  window.update3DCallouts = update3DCallouts;

  // Update callouts on camera orbit/pan/zoom
  if (workbench.controls) {
    workbench.controls.addEventListener('change', update3DCallouts);
  }
  window.addEventListener('resize', update3DCallouts);

  // =========================================================================
  // FLOATING VIEWBAR CONTROLS
  // =========================================================================

  document.getElementById('hud-rot-left')?.addEventListener('click', () => {
    if (workbench) {
      workbench.rotateCamera(0.2);
      update3DCallouts();
    }
  });

  document.getElementById('hud-rot-right')?.addEventListener('click', () => {
    if (workbench) {
      workbench.rotateCamera(-0.2);
      update3DCallouts();
    }
  });

  document.getElementById('hud-zoom-in')?.addEventListener('click', () => {
    if (workbench) {
      workbench.zoomCamera(0.9);
      update3DCallouts();
    }
  });

  document.getElementById('hud-zoom-out')?.addEventListener('click', () => {
    if (workbench) {
      workbench.zoomCamera(1.1);
      update3DCallouts();
    }
  });

  document.getElementById('hud-fit-all')?.addEventListener('click', () => {
    if (workbench) {
      workbench.resetCamera();
      setTimeout(update3DCallouts, 150);
    }
  });

  // Current Flow Animation Toggle
  const btnFlow = document.getElementById('btn-view-flow');
  let flowActive = false;
  btnFlow?.addEventListener('click', () => {
    flowActive = !flowActive;
    btnFlow.classList.toggle('active', flowActive);
    workbench.setFlowActive(flowActive);
    if (window.audioSynth) window.audioSynth.triggerTone(784, 0.05);
  });

  // 2D Schematic vs 3D View Toggle
  const btnSchematic = document.getElementById('btn-view-2d');
  const view3d = document.getElementById('viewport3d');
  const schematicContainer = document.getElementById('schematic-container');

  btnSchematic?.addEventListener('click', () => {
    const is2d = btnSchematic.classList.toggle('active');
    if (is2d) {
      view3d.style.display = 'none';
      schematicContainer.style.display = 'flex';
      schematicView.render(currentLesson);
    } else {
      view3d.style.display = 'block';
      schematicContainer.style.display = 'none';
    }
    update3DCallouts();
  });

  document.getElementById('btn-view-3d')?.addEventListener('click', () => {
    if (btnSchematic && btnSchematic.classList.contains('active')) {
      btnSchematic.click();
    }
  });

  // Minimap Fit View
  document.getElementById('btn-minimap')?.addEventListener('click', () => {
    if (workbench) workbench.resetCamera();
    setTimeout(update3DCallouts, 150);
  });

  // =========================================================================
  // LOAD LESSON DISPATCHER
  // =========================================================================

  function loadLesson(lesson) {
    currentLesson = lesson;
    window.location.hash = lesson.hash;

    // Header Progress
    const progCount = document.getElementById('lesson-progress-count');
    const progFill = document.getElementById('lesson-progress-fill');
    if (progCount) progCount.textContent = `${lesson.id}/16`;
    if (progFill) progFill.style.width = `${(lesson.id / 16) * 100}%`;

    // Render Active Info Tab
    renderInfoTab(lesson, activeTab);

    // Code Editor
    if (editor) {
      editor.value = lesson.code;
      updateLineNumbers();
    }

    // Update Live Sensor Slider
    updateSensorUI(lesson);

    // 3D Scene & Schematic
    workbench.loadLessonComponents(lesson);
    schematicView.render(lesson);
    circuitBuilder.setLesson(lesson);

    // Bottom Carousel Highlight
    renderBottomCarousel();

    // Reset simulator state
    stopSimulation();
    if (serialOutputElem) serialOutputElem.innerHTML = 'Ready: Select a lesson or click Play to run.\n';

    // Update 3D Callout Badges
    setTimeout(update3DCallouts, 200);
  }

  // =========================================================================
  // BOTTOM HORIZONTAL LESSONS CAROUSEL
  // =========================================================================

  function renderBottomCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    track.innerHTML = LESSONS_DATA.map((l) => {
      const isActive = (l.id === currentLesson.id);
      const title = l.cardTitle || `${l.id}. ${l.title.replace(/^[0-9]+\.\s*/, '')}`;
      return `
        <li class="lesson-card-pill ${isActive ? 'active' : ''}" data-lesson-id="${l.id}">
          <span class="card-pill-num">${l.id}</span>
          <span class="card-pill-title">${title}</span>
        </li>
      `;
    }).join('');

    track.querySelectorAll('.lesson-card-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = parseInt(pill.dataset.lessonId, 10);
        const selected = getLessonById(id);
        if (selected) loadLesson(selected);
      });
    });
  }

  const carouselTrack = document.getElementById('carousel-track');
  document.getElementById('carousel-prev-btn')?.addEventListener('click', () => {
    if (carouselTrack) carouselTrack.scrollBy({ left: -220, behavior: 'smooth' });
  });
  document.getElementById('carousel-next-btn')?.addEventListener('click', () => {
    if (carouselTrack) carouselTrack.scrollBy({ left: 220, behavior: 'smooth' });
  });

  // =========================================================================
  // SIDEBAR NAVIGATION & MODALS
  // =========================================================================

  const rail = document.getElementById('main-left-rail');
  document.getElementById('btn-rail-collapse')?.addEventListener('click', () => {
    rail?.classList.toggle('rail-collapsed');
    window.dispatchEvent(new Event('resize'));
  });

  document.getElementById('btn-rail-home')?.addEventListener('click', () => {
    loadLesson(LESSONS_DATA[3]); // Load #knob
  });

  const bomModal = document.getElementById('bom-modal');
  const lessonsModal = document.getElementById('lessons-modal');
  const settingsModal = document.getElementById('settings-modal');

  document.getElementById('btn-rail-bom')?.addEventListener('click', () => {
    renderBOM();
    if (bomModal) bomModal.style.display = 'grid';
  });
  document.getElementById('btn-close-bom')?.addEventListener('click', () => {
    if (bomModal) bomModal.style.display = 'none';
  });

  function renderBOM() {
    const container = document.getElementById('bom-grid-container');
    if (!container || !window.HARDWARE_COMPONENTS) return;
    container.innerHTML = HARDWARE_COMPONENTS.map(c => `
      <div class="bom-card">
        <h4 class="bom-card-title">${c.name}</h4>
        <span style="font-size:0.75rem; color:var(--teal); font-weight:700;">${c.category} · ${c.operatingVoltage}</span>
        <p class="bom-card-desc">${c.description}</p>
      </div>
    `).join('');
  }

  document.getElementById('btn-rail-lessons')?.addEventListener('click', () => {
    renderCurriculumModal();
    if (lessonsModal) lessonsModal.style.display = 'grid';
  });
  document.getElementById('btn-header-curriculum')?.addEventListener('click', () => {
    renderCurriculumModal();
    if (lessonsModal) lessonsModal.style.display = 'grid';
  });
  document.getElementById('btn-close-lessons')?.addEventListener('click', () => {
    if (lessonsModal) lessonsModal.style.display = 'none';
  });

  function renderCurriculumModal() {
    const container = document.getElementById('lessons-grid-container');
    if (!container) return;
    container.innerHTML = LESSONS_DATA.map(l => `
      <div class="lesson-modal-card ${l.id === currentLesson.id ? 'active' : ''}" data-lesson-id="${l.id}">
        <span class="card-pill-num">${l.id}</span>
        <div class="lesson-modal-title">${l.title}</div>
        <div class="lesson-modal-subtitle">${l.subtitle || ''}</div>
        <button class="btn-launch-lesson">Launch Lab →</button>
      </div>
    `).join('');

    container.querySelectorAll('.lesson-modal-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.lessonId, 10);
        const sel = getLessonById(id);
        if (sel) {
          loadLesson(sel);
          if (lessonsModal) lessonsModal.style.display = 'none';
        }
      });
    });
  }

  document.getElementById('btn-rail-settings')?.addEventListener('click', () => {
    if (settingsModal) settingsModal.style.display = 'grid';
  });
  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    if (settingsModal) settingsModal.style.display = 'none';
  });

  // Sound Mute Toggle
  document.getElementById('btn-rail-mute')?.addEventListener('click', (e) => {
    if (window.audioSynth) {
      const muted = window.audioSynth.toggleMute();
      e.currentTarget.querySelector('span').textContent = muted ? '🔇' : '🔊';
    }
  });

  // Brand Logo Easter Egg
  document.getElementById('btn-brand-logo')?.addEventListener('click', () => {
    if (window.audioSynth) {
      window.audioSynth.triggerTone(523.25, 0.08);
      setTimeout(() => window.audioSynth?.triggerTone(659.25, 0.08), 90);
      setTimeout(() => window.audioSynth?.triggerTone(783.99, 0.16), 180);
    }
    workbench.resetCamera();
    setTimeout(update3DCallouts, 150);
  });

  // Close modals on background click
  window.addEventListener('click', (e) => {
    if (e.target === bomModal) bomModal.style.display = 'none';
    if (e.target === lessonsModal) lessonsModal.style.display = 'none';
    if (e.target === settingsModal) settingsModal.style.display = 'none';
  });

  // =========================================================================
  // GLOBAL KEYBOARD SHORTCUTS
  // =========================================================================

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      btnRun?.click();
    } else if (e.key === 'r' || e.key === 'R') {
      workbench?.resetCamera();
      setTimeout(update3DCallouts, 150);
    } else if (e.key === '1') {
      setTab('overview');
    } else if (e.key === '2') {
      setTab('pinout');
    } else if (e.key === '3') {
      setTab('example');
    } else if (e.key === '4') {
      setTab('specs');
    } else if (e.key === 'c' || e.key === 'C') {
      btnSchematic?.click();
    } else if (e.key === 'q' || e.key === 'Q') {
      document.getElementById('hud-rot-left')?.click();
    } else if (e.key === 'e' || e.key === 'E') {
      document.getElementById('hud-rot-right')?.click();
    } else if (e.key === 'Escape') {
      if (bomModal) bomModal.style.display = 'none';
      if (lessonsModal) lessonsModal.style.display = 'none';
      if (settingsModal) settingsModal.style.display = 'none';
    }
  });

  // Studio Tools Button Bindings
  const btnToolMove = document.getElementById('tool-btn-move');
  const btnToolWire = document.getElementById('tool-btn-wire');
  const btnToolCutter = document.getElementById('tool-btn-cutter');
  const studioToolBtns = [btnToolMove, btnToolWire, btnToolCutter];

  btnToolMove?.addEventListener('click', () => {
    circuitBuilder.setTool('move');
    studioToolBtns.forEach(b => b?.classList.remove('active'));
    btnToolMove.classList.add('active');
  });
  btnToolWire?.addEventListener('click', () => {
    circuitBuilder.setTool('wire');
    studioToolBtns.forEach(b => b?.classList.remove('active'));
    btnToolWire.classList.add('active');
  });
  btnToolCutter?.addEventListener('click', () => {
    circuitBuilder.setTool('cutter');
    studioToolBtns.forEach(b => b?.classList.remove('active'));
    btnToolCutter.classList.add('active');
  });
  document.getElementById('btn-auto-wire')?.addEventListener('click', () => {
    circuitBuilder.loadPresetWires();
    if (window.audioSynth) window.audioSynth.triggerTone(587.33, 0.08);
  });
  document.getElementById('btn-check-circuit')?.addEventListener('click', () => {
    const res = circuitBuilder.verifyCircuit();
    if (window.audioSynth) {
      if (res.verified) window.audioSynth.triggerTone(880, 0.15);
      else window.audioSynth.triggerTone(220, 0.2);
    }
  });
  document.getElementById('btn-clear-wires')?.addEventListener('click', () => {
    circuitBuilder.clearAllWires();
    if (window.audioSynth) window.audioSynth.triggerTone(330, 0.1);
  });

  // Dynamic URL hash routing (#sensor, #knob, #blink, #button, etc.)
  window.addEventListener('hashchange', () => {
    const target = getLessonByHash(window.location.hash);
    if (target && target.id !== currentLesson.id) {
      loadLesson(target);
    }
  });

  // Initial Load
  loadLesson(currentLesson);
});
