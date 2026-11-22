// 2D Circuit Schematic Rendering Engine
// Generates standard electrical circuit schematics with component symbols, nets, and labels.

class SchematicView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeLesson = null;
  }

  render(lesson) {
    this.activeLesson = lesson;
    if (!this.container) return;

    if (lesson.id === 4) {
      this.renderKnobSchematic();
    } else if (lesson.id === 5) {
      this.renderRGBSchematic();
    } else if (lesson.id === 2) {
      this.renderBlinkSchematic();
    } else if (lesson.id === 3) {
      this.renderButtonSchematic();
    } else if (lesson.id === 7) {
      this.renderSonarSchematic();
    } else if (lesson.id === 12) {
      this.renderServoSchematic();
    } else {
      this.renderGenericSchematic(lesson);
    }
  }

  renderKnobSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 4: Turn a Knob (#knob) — Voltage Divider &amp; PWM Output</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 800 400" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#DC2626"/>
            </marker>
          </defs>

          <!-- Arduino Uno Symbol Box -->
          <rect x="30" y="40" width="220" height="320" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="140" y="75" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          <text x="140" y="95" fill="#94A3B8" font-size="12" text-anchor="middle">ATmega328P MCU</text>

          <!-- Uno Pin Terminals -->
          <!-- 5V -->
          <circle cx="250" cy="130" r="5" fill="#EF4444"/>
          <text x="235" y="135" fill="#FCA5A5" font-size="13" font-weight="700" text-anchor="end">5V Power</text>

          <!-- A0 -->
          <circle cx="250" cy="190" r="5" fill="#F59E0B"/>
          <text x="235" y="195" fill="#FDE68A" font-size="13" font-weight="700" text-anchor="end">Pin A0 (ADC)</text>

          <!-- ~9 PWM -->
          <circle cx="250" cy="250" r="5" fill="#0284C7"/>
          <text x="235" y="255" fill="#7DD3FC" font-size="13" font-weight="700" text-anchor="end">Pin ~9 (PWM)</text>

          <!-- GND -->
          <circle cx="250" cy="310" r="5" fill="#64748B"/>
          <text x="235" y="315" fill="#CBD5E1" font-size="13" font-weight="700" text-anchor="end">GND Rail</text>

          <!-- Potentiometer Symbol (Variable Resistor) -->
          <g transform="translate(370, 88)">
            <!-- Outer Housing Box -->
            <rect x="0" y="0" width="215" height="132" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
            
            <!-- Title Header Banner -->
            <rect x="0" y="0" width="215" height="28" rx="8" fill="#0F172A"/>
            <text x="107.5" y="19" fill="#FDE68A" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="0.05em">10 kΩ POTENTIOMETER</text>
            
            <!-- Terminal 1 (5V Ref) -->
            <circle cx="0" cy="42" r="5" fill="#EF4444"/>
            <text x="14" y="46" fill="#FECACA" font-size="11.5" font-weight="700">Leg 1: +5V Reference</text>

            <!-- Subtle Internal Divider -->
            <line x1="14" y1="68" x2="201" y2="68" stroke="#334155" stroke-dasharray="2,2" stroke-width="1"/>

            <!-- Terminal 2 (Wiper Output) -->
            <circle cx="0" cy="102" r="5" fill="#F59E0B"/>
            <text x="14" y="97" fill="#FBBF24" font-size="11.5" font-weight="700">Leg 2 (Wiper)</text>
            <text x="14" y="113" fill="#FDE68A" font-size="10.5" font-weight="600">Signal to A0</text>

            <!-- Terminal 3 (GND Return) -->
            <circle cx="215" cy="102" r="5" fill="#64748B"/>
            <text x="201" y="97" fill="#F1F5F9" font-size="11.5" font-weight="700" text-anchor="end">Leg 3: GND</text>
            <text x="201" y="113" fill="#CBD5E1" font-size="10.5" font-weight="600" text-anchor="end">Ground Return</text>
          </g>

          <!-- Resistor & LED Subcircuit -->
          <g transform="translate(610, 212.5)">
            <!-- 220Ω Resistor Symbol -->
            <rect x="0" y="25" width="60" height="25" rx="3" fill="#1E293B" stroke="#94A3B8" stroke-width="1.5"/>
            <text x="30" y="42" fill="#FFFFFF" font-size="11" font-weight="800" text-anchor="middle">220 Ω</text>

            <!-- LED Symbol -->
            <path d="M 88 25 L 112 37.5 L 88 50 Z" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5"/>
            <line x1="112" y1="20" x2="112" y2="55" stroke="#B91C1C" stroke-width="2.5"/>
            <!-- LED light arrows -->
            <line x1="100" y1="18" x2="112" y2="8" stroke="#EF4444" stroke-width="1.5" marker-end="url(#arrow)"/>
            <line x1="108" y1="24" x2="120" y2="14" stroke="#EF4444" stroke-width="1.5" marker-end="url(#arrow)"/>

            <!-- High-Contrast LED Badge -->
            <rect x="50" y="62" width="100" height="20" rx="4" fill="#FFFFFF" stroke="#FCA5A5" stroke-width="1.2"/>
            <text x="100" y="76" fill="#B91C1C" font-size="11" font-weight="800" text-anchor="middle">Dimmable LED</text>
            
            <!-- Intermediate wire between Resistor and LED -->
            <line x1="60" y1="37.5" x2="88" y2="37.5" stroke="#0284C7" stroke-width="2.5"/>
          </g>

          <!-- Wires & High-Contrast Badges -->
          <!-- Wire 1: 5V to Pot Leg 1 (Red) -->
          <path d="M 250 130 L 370 130" stroke="#DC2626" stroke-width="3" fill="none"/>
          <g transform="translate(310, 118)">
            <rect x="-46" y="-11" width="92" height="22" rx="5" fill="#FFFFFF" stroke="#FCA5A5" stroke-width="1.5"/>
            <text x="0" y="4" fill="#B91C1C" font-size="11" font-weight="800" text-anchor="middle">Wire 1 (+5V)</text>
          </g>

          <!-- Wire 2: Pot Wiper to A0 (Green) -->
          <path d="M 370 190 L 250 190" stroke="#10B981" stroke-width="3" fill="none"/>
          <g transform="translate(310, 178)">
            <rect x="-56" y="-11" width="112" height="22" rx="5" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="1.5"/>
            <text x="0" y="4" fill="#047857" font-size="11" font-weight="800" text-anchor="middle">Wire 2 (Green: A0)</text>
          </g>

          <!-- Wire 4: ~9 PWM to Resistor (Amber/Yellow) -->
          <path d="M 250 250 L 610 250" stroke="#F59E0B" stroke-width="3" fill="none"/>
          <g transform="translate(435, 238)">
            <rect x="-65" y="-11" width="130" height="22" rx="5" fill="#FFFFFF" stroke="#FDE68A" stroke-width="1.5"/>
            <text x="0" y="4" fill="#B45309" font-size="11" font-weight="800" text-anchor="middle">Wire 4 (Amber: ~9)</text>
          </g>

          <!-- Common Ground Rail (Black / Dark Slate) -->
          <!-- Pot Leg 3 to GND -->
          <path d="M 585 190 L 595 190 L 595 310 L 250 310" stroke="#181A20" stroke-width="2.5" fill="none"/>
          <!-- LED Cathode to GND -->
          <path d="M 722 250 L 745 250 L 745 310 L 595 310" stroke="#181A20" stroke-width="2.5" fill="none"/>

          <!-- Common Ground Badge -->
          <g transform="translate(420, 310)">
            <rect x="-115" y="-11" width="230" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
            <text x="0" y="4" fill="#1E293B" font-size="11" font-weight="800" text-anchor="middle">Wires 3 &amp; 5: Common GND (0V)</text>
          </g>

          <!-- Junction Node -->
          <circle cx="595" cy="310" r="4.5" fill="#181A20"/>
        </svg>

        <div class="schematic-legend">
          <div class="legend-item"><span class="legend-color" style="background:#dc2626"></span> Red: 5V Power (+5.0V)</div>
          <div class="legend-item"><span class="legend-color" style="background:#10b981"></span> Green: A0 Wiper Signal (0–5V)</div>
          <div class="legend-item"><span class="legend-color" style="background:#f59e0b"></span> Amber: PWM ~9 Output (490 Hz)</div>
          <div class="legend-item"><span class="legend-color" style="background:#181a20"></span> Black: Common Ground (0V) with Row 11–20 Bridge</div>
        </div>
      </div>
    `;
  }

  renderRGBSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 5: Mix Colours (#rgb) — 3-Channel PWM &amp; Common-Cathode RGB LED</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 800 420" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- Arduino Uno Symbol Box -->
          <rect x="30" y="40" width="220" height="340" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="140" y="75" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          <text x="140" y="95" fill="#94A3B8" font-size="12" text-anchor="middle">ATmega328P MCU</text>

          <!-- Uno Pin Terminals -->
          <!-- ~9 PWM (Red) -->
          <circle cx="250" cy="130" r="5" fill="#EE7F62"/>
          <text x="235" y="135" fill="#FECACA" font-size="13" font-weight="700" text-anchor="end">Pin ~9 (PWM Red)</text>

          <!-- ~10 PWM (Green) -->
          <circle cx="250" cy="190" r="5" fill="#10B981"/>
          <text x="235" y="195" fill="#A7F3D0" font-size="13" font-weight="700" text-anchor="end">Pin ~10 (PWM Green)</text>

          <!-- ~11 PWM (Blue) -->
          <circle cx="250" cy="250" r="5" fill="#3B82F6"/>
          <text x="235" y="255" fill="#BAE6FD" font-size="13" font-weight="700" text-anchor="end">Pin ~11 (PWM Blue)</text>

          <!-- GND -->
          <circle cx="250" cy="320" r="5" fill="#64748B"/>
          <text x="235" y="325" fill="#CBD5E1" font-size="13" font-weight="700" text-anchor="end">GND (Common Rail)</text>

          <!-- Three 220Ω Current Limiting Resistors -->
          <!-- R1: Red Channel Resistor -->
          <rect x="380" y="117.5" width="75" height="25" rx="3" fill="#1E293B" stroke="#EE7F62" stroke-width="1.8"/>
          <text x="417.5" y="134" fill="#FFFFFF" font-size="11.5" font-weight="800" text-anchor="middle">220 Ω (R)</text>

          <!-- R2: Green Channel Resistor -->
          <rect x="380" y="177.5" width="75" height="25" rx="3" fill="#1E293B" stroke="#10B981" stroke-width="1.8"/>
          <text x="417.5" y="194" fill="#FFFFFF" font-size="11.5" font-weight="800" text-anchor="middle">220 Ω (G)</text>

          <!-- R3: Blue Channel Resistor -->
          <rect x="380" y="237.5" width="75" height="25" rx="3" fill="#1E293B" stroke="#3B82F6" stroke-width="1.8"/>
          <text x="417.5" y="254" fill="#FFFFFF" font-size="11.5" font-weight="800" text-anchor="middle">220 Ω (B)</text>

          <!-- RGB LED Module Box -->
          <g transform="translate(560, 95)">
            <rect x="0" y="0" width="190" height="210" rx="10" fill="#1E293B" stroke="#D946EF" stroke-width="2"/>
            <rect x="0" y="0" width="190" height="28" rx="10" fill="#0F172A"/>
            <text x="95" y="19" fill="#F0ABFC" font-size="12" font-weight="800" text-anchor="middle">COMMON-CATHODE RGB LED</text>

            <!-- Red Diode -->
            <circle cx="0" cy="35" r="5" fill="#EE7F62"/>
            <text x="14" y="39" fill="#FECACA" font-size="11" font-weight="700">Red Anode</text>
            <path d="M 90 25 L 115 35 L 90 45 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5"/>
            <line x1="115" y1="22" x2="115" y2="48" stroke="#B91C1C" stroke-width="2"/>

            <!-- Green Diode -->
            <circle cx="0" cy="95" r="5" fill="#10B981"/>
            <text x="14" y="99" fill="#A7F3D0" font-size="11" font-weight="700">Green Anode</text>
            <path d="M 90 85 L 115 95 L 90 105 Z" fill="#10B981" stroke="#047857" stroke-width="1.5"/>
            <line x1="115" y1="82" x2="115" y2="108" stroke="#047857" stroke-width="2"/>

            <!-- Blue Diode -->
            <circle cx="0" cy="155" r="5" fill="#3B82F6"/>
            <text x="14" y="159" fill="#BAE6FD" font-size="11" font-weight="700">Blue Anode</text>
            <path d="M 90 145 L 115 155 L 90 165 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="1.5"/>
            <line x1="115" y1="142" x2="115" y2="168" stroke="#1D4ED8" stroke-width="2"/>

            <!-- Common Ground Bus -->
            <line x1="115" y1="35" x2="155" y2="35" stroke="#94A3B8" stroke-width="2"/>
            <line x1="115" y1="95" x2="155" y2="95" stroke="#94A3B8" stroke-width="2"/>
            <line x1="115" y1="155" x2="155" y2="155" stroke="#94A3B8" stroke-width="2"/>
            <line x1="155" y1="35" x2="155" y2="185" stroke="#94A3B8" stroke-width="2.5"/>
            <circle cx="155" cy="185" r="5" fill="#64748B"/>
            <text x="145" y="189" fill="#E2E8F0" font-size="11" font-weight="700" text-anchor="end">Cathode (GND)</text>
          </g>

          <!-- Wires & Connecting Lines -->
          <!-- Wire 1: D9 to R1 (Red) -->
          <line x1="250" y1="130" x2="380" y2="130" stroke="#EE7F62" stroke-width="3"/>
          <line x1="455" y1="130" x2="560" y2="130" stroke="#EE7F62" stroke-width="2.5"/>
          <g transform="translate(315, 118)">
            <rect x="-48" y="-11" width="96" height="22" rx="5" fill="#FFFFFF" stroke="#FECACA" stroke-width="1.5"/>
            <text x="0" y="4" fill="#B91C1C" font-size="11" font-weight="800" text-anchor="middle">Wire 1: ~9 (Red)</text>
          </g>

          <!-- Wire 2: D10 to R2 (Green) -->
          <line x1="250" y1="190" x2="380" y2="190" stroke="#10B981" stroke-width="3"/>
          <line x1="455" y1="190" x2="560" y2="190" stroke="#10B981" stroke-width="2.5"/>
          <g transform="translate(315, 178)">
            <rect x="-52" y="-11" width="104" height="22" rx="5" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="1.5"/>
            <text x="0" y="4" fill="#047857" font-size="11" font-weight="800" text-anchor="middle">Wire 3: ~10 (Grn)</text>
          </g>

          <!-- Wire 3: D11 to R3 (Blue) -->
          <line x1="250" y1="250" x2="380" y2="250" stroke="#3B82F6" stroke-width="3"/>
          <line x1="455" y1="250" x2="560" y2="250" stroke="#3B82F6" stroke-width="2.5"/>
          <g transform="translate(315, 238)">
            <rect x="-52" y="-11" width="104" height="22" rx="5" fill="#FFFFFF" stroke="#BAE6FD" stroke-width="1.5"/>
            <text x="0" y="4" fill="#1D4ED8" font-size="11" font-weight="800" text-anchor="middle">Wire 4: ~11 (Blu)</text>
          </g>

          <!-- Wire 4: GND to Cathode (Navy / Black) -->
          <path d="M 250 320 L 715 320 L 715 280" stroke="#181A20" stroke-width="2.5" fill="none"/>
          <g transform="translate(480, 320)">
            <rect x="-105" y="-11" width="210" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
            <text x="0" y="4" fill="#1E293B" font-size="11" font-weight="800" text-anchor="middle">Wire 2: Common GND (0V)</text>
          </g>
        </svg>

        <div class="schematic-legend">
          <div class="legend-item"><span class="legend-color" style="background:#ee7f62"></span> Coral Red: ~9 PWM (Red Anode)</div>
          <div class="legend-item"><span class="legend-color" style="background:#10b981"></span> Green: ~10 PWM (Green Anode)</div>
          <div class="legend-item"><span class="legend-color" style="background:#3b82f6"></span> Blue: ~11 PWM (Blue Anode)</div>
          <div class="legend-item"><span class="legend-color" style="background:#181a20"></span> Navy/Black: Common Cathode GND (0V)</div>
        </div>
      </div>
    `;
  }

  renderBlinkSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 2: Blink an LED — Digital Output Current-Limited Circuit</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 740 360" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="40" width="220" height="260" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="150" y="80" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          
          <circle cx="260" cy="140" r="5" fill="#0284C7"/>
          <text x="245" y="145" fill="#7DD3FC" font-size="13" font-weight="700" text-anchor="end">Pin D13 (5V Out)</text>

          <circle cx="260" cy="220" r="5" fill="#64748B"/>
          <text x="245" y="225" fill="#CBD5E1" font-size="13" font-weight="700" text-anchor="end">GND (0V)</text>

          <!-- Resistor -->
          <rect x="360" y="127" width="80" height="26" rx="3" fill="#1E293B" stroke="#94A3B8" stroke-width="1.5"/>
          <text x="400" y="145" fill="#F8FAFC" font-size="12" font-weight="800" text-anchor="middle">220 Ω</text>

          <!-- LED -->
          <g transform="translate(520, 115)">
            <path d="M 0 12 L 30 25 L 0 38 Z" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5"/>
            <line x1="30" y1="8" x2="30" y2="42" stroke="#B91C1C" stroke-width="2.5"/>
            <rect x="-35" y="48" width="100" height="20" rx="4" fill="#FFFFFF" stroke="#FCA5A5" stroke-width="1.2"/>
            <text x="15" y="62" fill="#B91C1C" font-size="11" font-weight="800" text-anchor="middle">5mm Red LED</text>
          </g>

          <!-- Wire D13 to Resistor -->
          <line x1="260" y1="140" x2="360" y2="140" stroke="#0284C7" stroke-width="3"/>
          <g transform="translate(310, 128)">
            <rect x="-42" y="-11" width="84" height="20" rx="4" fill="#FFFFFF" stroke="#BAE6FD" stroke-width="1.2"/>
            <text x="0" y="3" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">Wire (Blue)</text>
          </g>

          <!-- Wire Resistor to LED -->
          <line x1="440" y1="140" x2="520" y2="140" stroke="#D97706" stroke-width="2.5"/>

          <!-- Return to GND -->
          <path d="M 550 140 L 600 140 L 600 220 L 260 220" stroke="#475569" stroke-width="2.5" fill="none"/>
          <g transform="translate(430, 220)">
            <rect x="-105" y="-11" width="210" height="22" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
            <text x="0" y="4" fill="#1E293B" font-size="11" font-weight="800" text-anchor="middle">Wire (Black): Return to GND</text>
          </g>
        </svg>
      </div>
    `;
  }

  renderButtonSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 3: Push a Button — Active-LOW Internal Pull-Up</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 740 360" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="40" width="240" height="260" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="160" y="80" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          
          <circle cx="280" cy="140" r="5" fill="#F59E0B"/>
          <text x="265" y="145" fill="#FDE68A" font-size="13" font-weight="700" text-anchor="end">D2 (INPUT_PULLUP)</text>

          <circle cx="280" cy="220" r="5" fill="#64748B"/>
          <text x="265" y="225" fill="#CBD5E1" font-size="13" font-weight="700" text-anchor="end">GND (Ground)</text>

          <!-- Tactile Switch Symbol -->
          <g transform="translate(420, 110)">
            <rect x="0" y="0" width="130" height="110" rx="8" fill="#1E293B" stroke="#0284C7" stroke-width="2"/>
            <text x="65" y="30" fill="#7DD3FC" font-size="13" font-weight="bold" text-anchor="middle">Tactile Switch</text>
            <circle cx="25" cy="55" r="4.5" fill="#FBBF24"/>
            <circle cx="105" cy="55" r="4.5" fill="#94A3B8"/>
            <line x1="30" y1="52" x2="95" y2="42" stroke="#FFFFFF" stroke-width="2.5"/>
            <text x="65" y="90" fill="#CBD5E1" font-size="11" font-weight="600" text-anchor="middle">Press: Signal to GND</text>
          </g>

          <line x1="280" y1="140" x2="420" y2="165" stroke="#D97706" stroke-width="3"/>
          <path d="M 550 165 L 590 165 L 590 220 L 280 220" stroke="#475569" stroke-width="3" fill="none"/>
        </svg>
      </div>
    `;
  }

  renderSonarSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 7: HC-SR04 Sonar — Acoustic Time-of-Flight Interface</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 740 380" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="40" width="220" height="300" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="150" y="80" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          
          <text x="245" y="135" fill="#FCA5A5" font-size="12" font-weight="700" text-anchor="end">5V (VCC)</text>
          <circle cx="260" cy="130" r="5" fill="#EF4444"/>

          <text x="245" y="185" fill="#FDBA74" font-size="12" font-weight="700" text-anchor="end">D9 (TRIG Out)</text>
          <circle cx="260" cy="180" r="5" fill="#F97316"/>

          <text x="245" y="235" fill="#FDE68A" font-size="12" font-weight="700" text-anchor="end">D10 (ECHO In)</text>
          <circle cx="260" cy="230" r="5" fill="#F59E0B"/>

          <text x="245" y="285" fill="#CBD5E1" font-size="12" font-weight="700" text-anchor="end">GND</text>
          <circle cx="260" cy="280" r="5" fill="#64748B"/>

          <!-- HC-SR04 Symbol -->
          <g transform="translate(420, 90)">
            <rect x="0" y="0" width="220" height="220" rx="10" fill="#0369A1" stroke="#38BDF8" stroke-width="2"/>
            <text x="110" y="35" fill="#FFFFFF" font-size="14" font-weight="bold" text-anchor="middle">HC-SR04 Ultrasonic</text>
            <circle cx="60" cy="85" r="30" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
            <text x="60" y="90" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">TRANSMIT</text>
            <circle cx="160" cy="85" r="30" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
            <text x="160" y="90" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">RECEIVE</text>

            <text x="20" y="155" fill="#FECACA" font-size="11.5" font-weight="700">VCC (+5V)</text>
            <text x="20" y="175" fill="#FED7AA" font-size="11.5" font-weight="700">TRIG (Trigger)</text>
            <text x="20" y="195" fill="#FEF08A" font-size="11.5" font-weight="700">ECHO (Pulse)</text>
            <text x="20" y="215" fill="#E2E8F0" font-size="11.5" font-weight="700">GND (Ground)</text>
          </g>

          <line x1="260" y1="130" x2="420" y2="150" stroke="#DC2626" stroke-width="2.5"/>
          <line x1="260" y1="180" x2="420" y2="170" stroke="#EA580C" stroke-width="2.5"/>
          <line x1="260" y1="230" x2="420" y2="190" stroke="#D97706" stroke-width="2.5"/>
          <line x1="260" y1="280" x2="420" y2="210" stroke="#475569" stroke-width="2.5"/>
        </svg>
      </div>
    `;
  }

  renderServoSchematic() {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">Lesson 12: SG90 Micro Servo — PWM Pulse Position Signal</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <svg viewBox="0 0 740 360" class="schematic-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="40" width="220" height="260" rx="10" fill="#0B1329" stroke="#00979C" stroke-width="2.5"/>
          <text x="150" y="80" fill="#38BDF8" font-size="16" font-weight="bold" text-anchor="middle">ARDUINO UNO R3</text>
          
          <text x="245" y="135" fill="#FCA5A5" font-size="13" font-weight="700" text-anchor="end">5V Power</text>
          <circle cx="260" cy="130" r="5" fill="#EF4444"/>

          <text x="245" y="185" fill="#FDBA74" font-size="13" font-weight="700" text-anchor="end">~D9 (PWM Signal)</text>
          <circle cx="260" cy="180" r="5" fill="#F97316"/>

          <text x="245" y="235" fill="#CBD5E1" font-size="13" font-weight="700" text-anchor="end">GND (Ground)</text>
          <circle cx="260" cy="230" r="5" fill="#64748B"/>

          <!-- Servo Motor Box -->
          <g transform="translate(420, 90)">
            <rect x="0" y="0" width="180" height="180" rx="8" fill="#0284C7" stroke="#38BDF8" stroke-width="2"/>
            <text x="90" y="35" fill="#FFFFFF" font-size="14" font-weight="bold" text-anchor="middle">SG90 Servo</text>
            <circle cx="90" cy="90" r="35" fill="#0F172A" stroke="#FFFFFF" stroke-width="2"/>
            <line x1="90" y1="90" x2="115" y2="70" stroke="#FFFFFF" stroke-width="4"/>

            <text x="15" y="145" fill="#FECACA" font-size="11.5" font-weight="700">Red: +5V (VCC)</text>
            <text x="15" y="160" fill="#FED7AA" font-size="11.5" font-weight="700">Orange: ~D9 (Signal)</text>
            <text x="15" y="175" fill="#E2E8F0" font-size="11.5" font-weight="700">Brown: GND (0V)</text>
          </g>

          <line x1="260" y1="130" x2="420" y2="145" stroke="#DC2626" stroke-width="2.5"/>
          <line x1="260" y1="180" x2="420" y2="160" stroke="#EA580C" stroke-width="2.5"/>
          <line x1="260" y1="230" x2="520" y2="230" stroke="#475569" stroke-width="2.5"/>
          <line x1="520" y1="230" x2="520" y2="175" stroke="#475569" stroke-width="2.5"/>
        </svg>
      </div>
    `;
  }

  renderGenericSchematic(lesson) {
    this.container.innerHTML = `
      <div class="schematic-wrapper">
        <div class="schematic-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="schematic-badge">2D Circuit Schematic</span>
            <span class="schematic-title">${lesson.title} — Component Wiring Map</span>
          </div>
          <button class="schematic-back-btn" onclick="document.getElementById('btn-view-3d')?.click()">Return to 3D View ➔</button>
        </div>
        <div class="schematic-generic-view">
          <div class="schematic-uno-box">
            <h4>Arduino Uno R3</h4>
            <div class="pin-list">
              ${(lesson.unoPins || []).map(p => `<div class="pin-item"><span class="pin-dot"></span>${p}</div>`).join('')}
            </div>
          </div>
          <div class="schematic-arrow-col">
            <div class="arrow-line"></div>
            <span>Jumper Wires</span>
          </div>
          <div class="schematic-parts-box">
            <h4>Breadboard Modules</h4>
            <div class="pin-list">
              ${(lesson.hardwareList || []).map(h => `<div class="part-item">🔌 ${h}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

window.SchematicView = SchematicView;

