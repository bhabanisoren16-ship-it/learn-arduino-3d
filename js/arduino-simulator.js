// Virtual Arduino Microcontroller Runtime & In-Browser C++ Sketch Simulator
// Emulates ATmega328P hardware registers, GPIO pins, 10-bit ADC, 8-bit PWM, Serial UART, and Timers.

class ArduinoSimulator {
  constructor(workbench, serialOutputCallback) {
    this.workbench = workbench;
    this.serialCallback = serialOutputCallback;

    this.isRunning = false;
    this.isPaused = false;
    this.abortController = null;

    // Pin states
    this.digitalPins = new Array(14).fill(0); // D0 - D13
    this.pinModes = new Array(14).fill('INPUT'); // 'INPUT', 'OUTPUT', 'INPUT_PULLUP'
    this.pwmValues = new Array(14).fill(0); // 0 - 255 for ~3, ~5, ~6, ~9, ~10, ~11
    this.analogInputs = { A0: 512, A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 };

    // Telemetry & Hardware state
    this.baudRate = 9600;
    this.servoAngle = 90;
    this.activeToneFreq = 0;
    this.lastLoopTime = 0;

    // Interactive sensor values bound from UI controls
    this.sensorInputs = {
      knob_raw: 512,
      button_state: 0, // 0 = unpressed, 1 = pressed
      ambient_light: 600,
      obstacle_dist: 28,
      ambient_temp: 24,
      soil_moisture: 45,
      applied_force: 2.5,
      piano_key: -1,
      rgb_r: 255,
      rgb_g: 120,
      rgb_b: 200
    };
  }

  setSensorInput(key, value) {
    this.sensorInputs[key] = value;

    // Real-time 3D model visual responsiveness even when simulator is not running
    if (key === 'knob_raw') {
      this.analogInputs.A0 = parseInt(value, 10);
      if (this.workbench && typeof this.workbench.updatePotKnob === 'function') {
        this.workbench.updatePotKnob(parseInt(value, 10));
      }
    } else if (key === 'button_state') {
      if (this.workbench && typeof this.workbench.setButtonPressed === 'function') {
        this.workbench.setButtonPressed(value === 1);
      }
    } else if (key === 'ambient_light') {
      this.analogInputs.A0 = parseInt(value, 10);
    } else if (key === 'ambient_temp') {
      // TMP36: 0.5V at 0°C + 10mV/°C
      const voltage = 0.5 + (parseFloat(value) * 0.010);
      this.analogInputs.A0 = Math.round((voltage / 5.0) * 1023);
    } else if (key === 'soil_moisture') {
      // 0% -> 580 (dry), 100% -> 250 (wet)
      this.analogInputs.A0 = Math.round(580 - (parseInt(value, 10) / 100) * (580 - 250));
    } else if (key === 'applied_force') {
      // FSR: 0N -> 0, 10N -> 1023
      this.analogInputs.A0 = Math.round((parseFloat(value) / 10.0) * 1023);
    } else if (key === 'servo_angle') {
      if (this.workbench && typeof this.workbench.updateServoAngle === 'function') {
        this.workbench.updateServoAngle(parseInt(value, 10));
      }
    }
  }

  // --- Arduino Core API Emulation ---

  pinMode(pin, mode) {
    const p = this.resolvePinIndex(pin);
    if (p >= 0 && p < 14) {
      this.pinModes[p] = mode;
    }
  }

  digitalWrite(pin, value) {
    const p = this.resolvePinIndex(pin);
    const val = (value === 'HIGH' || value === 1 || value === true) ? 1 : 0;
    if (p >= 0 && p < 14) {
      this.digitalPins[p] = val;
      this.pwmValues[p] = val ? 255 : 0;

      // Update 3D elements
      if (p === 13) {
        this.workbench.updateUnoBuiltinLed(val === 1);
      }
      if (p === 9 || p === 13) {
        this.workbench.updateLedState(val ? 255 : 0);
      }
      // Traffic lights in lesson 16 (pins 2, 3, 4)
      if (this.workbench && typeof this.workbench.updateTrafficLight === 'function') {
        if (p === 2 && val) this.workbench.updateTrafficLight('red');
        if (p === 3 && val) this.workbench.updateTrafficLight('yellow');
        if (p === 4 && val) this.workbench.updateTrafficLight('green');
      }
    }
  }

  digitalRead(pin) {
    const p = this.resolvePinIndex(pin);
    // Button on D2 with INPUT_PULLUP: unpressed = HIGH (1), pressed = LOW (0)
    if (p === 2) {
      return this.sensorInputs.button_state === 1 ? 0 : 1;
    }
    // Piano keys D2-D9
    if (p >= 2 && p <= 9 && this.sensorInputs.piano_key >= 0) {
      const activePin = 2 + this.sensorInputs.piano_key;
      return (p === activePin) ? 0 : 1;
    }
    return this.digitalPins[p] || 0;
  }

  analogRead(pin) {
    const pinName = String(pin).toUpperCase();
    if (pinName === 'A0' || pinName === '0' || pin === 0) {
      return this.analogInputs.A0 !== undefined ? this.analogInputs.A0 : this.sensorInputs.knob_raw;
    }
    return this.analogInputs[pinName] || 0;
  }

  analogWrite(pin, dutyCycle) {
    const p = this.resolvePinIndex(pin);
    const duty = Math.max(0, Math.min(255, Math.round(dutyCycle)));
    if (p >= 0 && p < 14) {
      this.pwmValues[p] = duty;
      this.digitalPins[p] = duty > 0 ? 1 : 0;

      // Update 3D LED glow or motor speed
      if (p === 9) {
        this.workbench.updateLedState(duty);
      }
      if (p === 13) {
        this.workbench.updateUnoBuiltinLed(duty > 127);
      }
      // Multi-channel RGB LED support (pins 9, 10, 11)
      if (p === 9 || p === 10 || p === 11) {
        const r = this.pwmValues[9] || 0;
        const g = this.pwmValues[10] || 0;
        const b = this.pwmValues[11] || 0;
        const rgbHex = (r << 16) | (g << 8) | b;
        this.workbench.updateLedState(Math.max(r, g, b), rgbHex);
      }
    }
  }

  tone(pin, frequency) {
    this.activeToneFreq = frequency;
    if (window.audioSynth) {
      window.audioSynth.playTone(frequency);
    }
  }

  noTone(pin) {
    this.activeToneFreq = 0;
    if (window.audioSynth) {
      window.audioSynth.stopTone();
    }
  }

  pulseIn(pin, value, timeout = 30000) {
    // Sonar HC-SR04: Distance (cm) * 58 = echo pulse microseconds
    const distCm = this.sensorInputs.obstacle_dist || 25;
    return distCm * 58;
  }

  delay(ms) {
    return new Promise((resolve, reject) => {
      if (!this.isRunning) return resolve();
      const timeout = setTimeout(() => resolve(), ms);
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }

  delayMicroseconds(us) {
    return new Promise(resolve => setTimeout(resolve, Math.max(1, Math.round(us / 1000))));
  }

  map(x, in_min, in_max, out_min, out_max) {
    return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
  }

  constrain(amt, low, high) {
    return Math.max(low, Math.min(high, amt));
  }

  // --- Serial Monitor UART Stream ---

  serialPrint(val) {
    if (this.serialCallback) {
      this.serialCallback(String(val), false);
    }
    if (this.workbench && typeof this.workbench.flashTxRx === 'function') {
      this.workbench.flashTxRx();
    }
  }

  serialPrintln(val = '') {
    if (this.serialCallback) {
      this.serialCallback(String(val) + '\n', true);
    }
    if (this.workbench && typeof this.workbench.flashTxRx === 'function') {
      this.workbench.flashTxRx();
    }
  }

  resolvePinIndex(pin) {
    if (typeof pin === 'number') return pin;
    if (typeof pin === 'string') {
      const clean = pin.replace(/[^0-9]/g, '');
      if (clean) return parseInt(clean, 10);
    }
    return 0;
  }

  // --- Code Execution Engine ---

  async runSketch(codeString, lesson) {
    this.stopSketch();
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    this.serialPrintln(`[VIRTUAL ATMEGA328P] Compilation successful.`);
    this.serialPrintln(`[FLASH] Writing sketch to 32KB flash at 16 MHz...`);
    this.serialPrintln(`[SYSTEM] Initializing I/O pins and UART at 9600 baud...\n`);

    // Reset pins
    this.digitalPins.fill(0);
    this.pwmValues.fill(0);

    // Context environment provided to running sketch
    const scope = {
      HIGH: 1,
      LOW: 0,
      INPUT: 'INPUT',
      OUTPUT: 'OUTPUT',
      INPUT_PULLUP: 'INPUT_PULLUP',
      A0: 'A0', A1: 'A1', A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5',
      pinMode: (p, m) => this.pinMode(p, m),
      digitalWrite: (p, v) => this.digitalWrite(p, v),
      digitalRead: (p) => this.digitalRead(p),
      analogRead: (p) => this.analogRead(p),
      analogWrite: (p, v) => this.analogWrite(p, v),
      tone: (p, f) => this.tone(p, f),
      noTone: (p) => this.noTone(p),
      pulseIn: (p, v, t) => this.pulseIn(p, v, t),
      delay: (ms) => this.delay(ms),
      delayMicroseconds: (us) => this.delayMicroseconds(us),
      map: (x, im, ix, om, ox) => this.map(x, im, ix, om, ox),
      constrain: (x, l, h) => this.constrain(x, l, h),
      Serial: {
        begin: (baud) => { this.baudRate = baud; },
        print: (v) => this.serialPrint(v),
        println: (v) => this.serialPrintln(v)
      },
      Servo: class {
        constructor() { this.pin = 9; }
        attach(p) { this.pin = p; }
        write(angle) {
          if (window.appSimulator && window.appSimulator.workbench) {
            window.appSimulator.workbench.updateServoAngle(angle);
          }
        }
      }
    };

    // Parse and adapt C++ Arduino code into executable asynchronous JavaScript
    const jsCode = this.transpileArduinoCppToJS(codeString);

    try {
      const runner = new Function('ctx', `
        with(ctx) {
          return (async () => {
            ${jsCode}
            if (typeof setup === 'function') {
              await setup();
            }
            while (ctx.isSimRunning()) {
              if (typeof loop === 'function') {
                await loop();
              }
              // Prevent busy-looping if loop has no delay
              await delay(20);
            }
          })();
        }
      `);

      scope.isSimRunning = () => this.isRunning;
      await runner(scope);
    } catch (err) {
      if (this.isRunning) {
        this.serialPrintln(`\n[RUNTIME ERROR]: ${err.message}`);
        console.error("Arduino simulation error:", err);
      }
    }
  }

  stopSketch() {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (window.audioSynth) {
      window.audioSynth.stopTone();
    }
    // Reset indicators
    if (this.workbench) {
      this.workbench.updateUnoBuiltinLed(false);
      this.workbench.updateLedState(0);
    }
  }

  // Transpiles C++ Arduino sketch into robust async JavaScript
  transpileArduinoCppToJS(cppCode) {
    let js = cppCode;

    // 1. Strip preprocessor directives
    js = js.replace(/#include\s+<[^>]+>/g, '// [included library]');
    js = js.replace(/#include\s+"[^"]+"/g, '// [included library]');
    js = js.replace(/#define\s+([a-zA-Z0-9_]+)\s+([^\r\n]+)/g, 'const $1 = $2;');

    // 2. Strip C++ numeric literal suffixes: 30000UL -> 30000, 1000L -> 1000, 2.5f -> 2.5
    js = js.replace(/\b([0-9]+)(?:UL|ULL|U|L|LL)\b/gi, '$1');
    js = js.replace(/\b([0-9]+\.[0-9]+)[fF]\b/g, '$1');

    // 3. Transform C++ object instantations: Servo arm; -> let arm = new Servo();
    js = js.replace(/\b(Servo|LiquidCrystal|Stepper)\s+([a-zA-Z0-9_]+)\s*(?:\(([^)]*)\))?;/g, (match, cls, inst, args) => {
      return `let ${inst} = new ${cls}(${args || ''});`;
    });

    // 4. Transform functions with return types: void foo(...), int foo(...), bool foo(...) -> async function foo(...)
    js = js.replace(/\b(?:void|int|float|double|char|long|bool|boolean|byte|short|word)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g, (match, fnName, params) => {
      // Strip type keywords from parameter list
      const cleanParams = params.split(',').map(p => {
        p = p.trim();
        if (!p) return '';
        return p.replace(/^(?:const\s+)?(?:int|float|double|char\*?|long|bool|boolean|byte|short|word|String)\s+/, '');
      }).join(', ');
      return `async function ${fnName}(${cleanParams}) {`;
    });

    // 5. Transform array declarations: const int KEYS[8] = {1, 2}; or int arr[] = {3, 4};
    js = js.replace(/\b(?:const\s+)?(?:int|float|double|char\*?|long|bool|boolean|byte|short|word)\s+([a-zA-Z0-9_]+)\s*\[\s*[0-9]*\s*\]\s*=\s*\{([^}]+)\};/g, 'const $1 = [$2];');

    // 6. Transform remaining variable declarations: const int x = 5; int y = 10;
    js = js.replace(/\b(const\s+int|const\s+float|const\s+char\*|const\s+bool|const\s+long|const\s+byte)\b/g, 'const');
    js = js.replace(/\b(int|float|double|char|long|unsigned\s+long|byte|boolean|bool|short|word)\b/g, 'let');

    // 7. Transform delay(x) and delayMicroseconds(x) into await delay(x)
    js = js.replace(/(\bdelay\s*\([^)]*\);)/g, 'await $1');
    js = js.replace(/(\bdelayMicroseconds\s*\([^)]*\);)/g, 'await $1');

    // 8. Transform pulseIn(...) -> await pulseIn(...)
    js = js.replace(/(\bpulseIn\s*\([^)]*\))/g, 'await $1');

    return js;
  }
}

window.ArduinoSimulator = ArduinoSimulator;

