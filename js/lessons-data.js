// Complete 16-Lesson Curriculum Data for Learn Arduino 3D & Simulator
// Fully aligned with Learn Arduino 3D Website Guide & BitForBytes Curriculum

const LESSONS_DATA = [
  {
    id: 1,
    slug: "meet-the-board",
    hash: "#board",
    title: "1. Meet the Board",
    subtitle: "Arduino Uno R3 Anatomy & Built-in LED",
    badge: "Lesson 1 / 16",
    difficulty: "Beginner",
    hardwareList: ["Arduino Uno R3 (ATmega328P)", "USB-A to USB-B Cable"],
    unoPins: ["D13 (Built-in 'L' LED)", "USB 5V", "GND"],
    overview: {
      concept: "Introduction to the ATmega328P microcontroller board architecture, onboard power regulators, crystal oscillator, and the built-in LED tied to digital pin 13.",
      physics: "The ATmega328P operates at 16 MHz with 32 KB flash memory. Digital pin 13 is hardwired to an onboard surface-mount LED labeled 'L' through a buffer resistor, allowing immediate testing without external wiring.",
      formula: "Clock Period T = 1 / 16,000,000 s = 62.5 nanoseconds per CPU instruction cycle.",
      applications: "Hardware health verification, bootloader diagnostic blinking, embedded C++ foundation."
    },
    pinout: [
      { pin: "D13", function: "Built-in LED Anode", signal: "Digital Output (HIGH = 5V, LOW = 0V)" },
      { pin: "USB", function: "5V Bus Power & Serial", signal: "5V Regulated / 9600 Baud UART" },
      { pin: "GND", function: "Common Ground Reference", signal: "0V Reference" }
    ],
    code: `// Lesson 1: Meet the Board
// Introduces board layout, setup(), loop(), and Serial telemetry.

const int LED_PIN = 13; // Built-in LED on Arduino Uno

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("====================================");
  Serial.println("Welcome to Learn Arduino 3D!");
  Serial.println("Target: Arduino Uno R3 (ATmega328P)");
  Serial.println("System initialized at 9600 baud.");
  Serial.println("====================================");
}

void loop() {
  Serial.println("Board Heartbeat: LED ON");
  digitalWrite(LED_PIN, HIGH);
  delay(1000);

  Serial.println("Board Heartbeat: LED OFF");
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`,
    specifications: {
      operatingVoltage: "5.0 V DC",
      microcontroller: "Microchip ATmega328P 8-bit AVR",
      clockSpeed: "16 MHz",
      digitalIOPins: "14 (pins 0 through 13)",
      analogInputs: "6 (A0 through A5)",
      serialBaudDefault: "9600 baud"
    },
    schematic: {
      type: "built-in",
      nodes: [
        { id: "uno", label: "Arduino Uno R3", type: "mcu" },
        { id: "led13", label: "SMD LED 'L' (Pin 13)", type: "led", state: "blinking" }
      ]
    },
    requiredNetlist: [],
    sensorControls: [
      { id: "power_state", type: "toggle", label: "USB Power", default: 1, min: 0, max: 1 }
    ]
  },

  {
    id: 2,
    slug: "blink-an-led",
    hash: "#blink",
    title: "2. Blink an LED",
    subtitle: "External LED with Current-Limiting Resistor",
    badge: "Lesson 2 / 16",
    difficulty: "Beginner",
    hardwareList: ["5 mm Red LED", "220 Ω Resistor", "Breadboard", "2x Jumper Wires"],
    unoPins: ["D13", "GND"],
    overview: {
      concept: "Controlling an external discrete 5mm LED on a breadboard. Learn Ohm's law and how a current-limiting resistor protects both the LED and the ATmega328P output driver.",
      physics: "A standard red LED has a forward voltage drop Vf ≈ 2.0 V. Driving it with 5V directly causes excessive current (>100mA) that would destroy the pin. With a 220 Ω resistor: I = (5.0V - 2.0V) / 220Ω ≈ 13.6 mA, perfectly safe for the 20 mA pin limit.",
      formula: "R = (V_supply - V_forward) / I_desired = (5.0V - 2.0V) / 0.015A = 200 Ω → 220 Ω standard.",
      applications: "Status indicators, user feedback beacons, relay triggers."
    },
    pinout: [
      { pin: "D13", function: "LED Drive Output", signal: "0V or 5V (PWM capable)", color: "#f0a53a" },
      { pin: "220Ω", function: "Current Limiter", signal: "Drops 3.0V at 13.6mA", color: "#eedec6" },
      { pin: "GND", function: "Cathode Return Rail", signal: "0V Ground", color: "#24272f" }
    ],
    code: `// Lesson 2: Blink an External LED
// Switches digital output between 5V and 0V with digitalWrite() and delay()

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 2: External LED Blink ready");
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // Turn LED ON (5V)
  Serial.println("LED State: HIGH (ON)");
  delay(1000);                 // Wait 1000 ms

  digitalWrite(LED_PIN, LOW);  // Turn LED OFF (0V)
  Serial.println("LED State: LOW (OFF)");
  delay(1000);                 // Wait 1000 ms
}`,
    specifications: {
      resistorValue: "220 Ω 1/4W",
      ledForwardVoltage: "2.0 V",
      forwardCurrent: "13.6 mA",
      pinOutputVoltage: "5.0 V"
    },
    requiredNetlist: [
      { from: "Uno.D13", to: "Breadboard.Resistor1", color: "amber", label: "D13 to 220Ω Resistor (Row 10)" },
      { from: "Breadboard.Resistor2", to: "Breadboard.LED_Anode", color: "amber", label: "Row 14 Internal Shared Tie" },
      { from: "Breadboard.LED_Cathode", to: "Uno.GND", color: "navy", label: "LED Cathode to GND (Row 15)" }
    ],
    sensorControls: [
      { id: "blink_rate", type: "slider", label: "Blink Delay (ms)", default: 1000, min: 100, max: 2000, step: 50, unit: "ms" }
    ]
  },

  {
    id: 3,
    slug: "push-a-button",
    hash: "#button",
    title: "3. Push a Button",
    subtitle: "Tactile Switch with Internal Pull-Up Resistor",
    badge: "Lesson 3 / 16",
    difficulty: "Beginner",
    hardwareList: ["12 mm Tactile Push Button", "Breadboard", "2x Jumper Wires"],
    unoPins: ["D2 (INPUT_PULLUP)", "D13 (LED)", "GND"],
    overview: {
      concept: "Reading digital input states using the internal 20kΩ-50kΩ pull-up resistor built into the ATmega328P. Eliminates the need for external pull-up resistors.",
      physics: "When the button is open (unpressed), the internal pull-up resistor holds pin D2 HIGH (5V). When pressed, the switch connects pin D2 to GND, pulling it LOW (0V). This inverted logic is known as active-LOW.",
      formula: "V_pin = 5.0 V (Open / HIGH) or 0.0 V (Pressed / LOW).",
      applications: "User input buttons, limit switches, keypad matrices, door trip sensors."
    },
    pinout: [
      { pin: "D2", function: "Tactile Button Input", signal: "INPUT_PULLUP (HIGH idle, LOW active)" },
      { pin: "D13", function: "Status Indicator LED", signal: "HIGH when pressed" },
      { pin: "GND", function: "Switch Common Ground", signal: "0V Reference" }
    ],
    code: `// Lesson 3: Push a Button (BitForBytes #button)
// Internal pull-up holds D2 HIGH until button press pulls it LOW

const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 3: Push Button Active-LOW ready");
}

void loop() {
  bool pressed = (digitalRead(BUTTON_PIN) == LOW);
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);
  
  if (pressed) {
    Serial.println("Button: PRESSED (D2 = LOW, LED ON)");
  } else {
    Serial.println("Button: RELEASED (D2 = HIGH, LED OFF)");
  }
  delay(100);
}`,
    specifications: {
      internalPullup: "20 kΩ to 50 kΩ",
      buttonType: "SPST Momentary NO",
      debounceDelay: "10 ms software debounce"
    },
    requiredNetlist: [
      { from: "Uno.D2", to: "Breadboard.Btn_Leg1", color: "amber", label: "D2 to Button Leg 1" },
      { from: "Breadboard.Btn_Leg2", to: "Uno.GND", color: "black", label: "Button Leg 2 to GND" }
    ],
    sensorControls: [
      { id: "button_state", type: "button", label: "Tactile Push Button (D2)", default: 0, min: 0, max: 1 }
    ]
  },

  {
    id: 4,
    slug: "turn-a-knob",
    hash: "#knob",
    title: "4. Turn a Knob (Spotlight #knob)",
    cardTitle: "4. Turn a knob",
    heading: "Turn a knob",
    lede: "A potentiometer is a resistor with a slider. Turning the knob moves the middle leg anywhere from 0 V to 5 V, and an analog pin turns that into a number.",
    subtitle: "10 kΩ Potentiometer Analog Voltage Divider & PWM LED",
    badge: "Spotlight Module",
    difficulty: "Intermediate",
    hardwareList: ["10 kΩ Linear Potentiometer", "5 mm LED", "220 Ω Resistor", "Breadboard", "5x Jumper Wires"],
    unoPins: ["A0 (Analog In)", "~D9 (PWM Out)", "5V Power", "GND Rail"],
    features: [
      ["knob", "Drag around the knob to turn it"],
      ["wave", "<code>analogRead()</code> gives 0–1023"],
      ["pwm", "<code>analogWrite()</code> dims the LED, 0–255"]
    ],
    example: [
      "<code>analogRead(POT)</code> measures the wiper voltage: 0 V is 0, 5 V is 1023.",
      "PWM only goes up to 255, so <code>value / 4</code> scales the reading to fit.",
      "<code>analogWrite(LED, …)</code> pulses pin 9 so fast the LED looks dimmed.",
      "Open the serial monitor (press Run) to watch the numbers as you turn."
    ],
    specs: [
      ["Potentiometer", "10 kΩ linear, 270° travel"],
      ["ADC", "10-bit, 0–1023"],
      ["Resolution", "≈ 4.9 mV per step"],
      ["PWM", "8-bit, 0–255 at ~490 Hz"],
      ["Read time", "≈ 100 µs per <code>analogRead()</code>"]
    ],
    overview: {
      concept: "A potentiometer is a resistor with a slider. Turning the knob moves the middle leg anywhere from 0 V to 5 V, and an analog pin turns that into a number.",
      physics: "The ATmega328P 10-bit Analog-to-Digital Converter (ADC) samples pin A0 from 0 V to 5 V as an integer from 0 to 1023 (step resolution = 5V / 1024 ≈ 4.88 mV). PWM on pin ~9 operates at 490 Hz with an 8-bit duty cycle (0 to 255). Dividing raw by 4 maps 10-bit ADC cleanly to 8-bit PWM (bright = raw / 4).",
      formula: "V_wiper = 5V × (R2 / (R1 + R2)) | ADC = (V_wiper / 5.0) × 1023 | PWM = ADC / 4 (0 to 255).",
      applications: "Audio volume faders, motor speed throttles, lighting dimmers, calibration dials."
    },
    pinout: [
      { pin: "5V", function: "Potentiometer Outer Leg 1", signal: "Top of the voltage divider (+5.0 V).", color: "#d64a3a" },
      { pin: "A0", function: "Potentiometer Middle Leg 2", signal: "The wiper: 0–5 V as you turn.", color: "#3fae6a" },
      { pin: "GND", function: "Potentiometer Outer Leg 3", signal: "Bottom of divider (0 V ground).", color: "#2f3547" },
      { pin: "~D9", function: "220 Ω Resistor → LED Anode", signal: "PWM output sets the brightness (0–255).", color: "#f0a53a" },
      { pin: "GND", function: "LED Cathode (Short Leg)", signal: "Ground return via Row 11–20 bridge (0 V).", color: "#2f3547" }
    ],
    callouts: [
      { anchor: "part:pot", icon: "knob", title: "Potentiometer", body: "Drag around the knob to turn it.", x: -162, y: -350, w: 252, side: "bottom", at: 200, leg: 30, ring: true },
      { anchor: "pin:A0", icon: "wave", wide: true, title: "Pin A0", body: "Reads the knob as a number, 0–1023.", x: -498, y: 130, w: 252, side: "top", at: 150, leg: 40, ring: true },
      { anchor: "part:led", icon: "led", title: "LED", body: "Brightness follows the knob.", x: 290, y: -350, w: 238, side: "bottom", at: 40, leg: 30, ring: true },
      { anchor: "pin:D9", icon: "pwm", wide: true, title: "Pin ~9 (PWM)", body: "Controls the LED with fast pulses.", x: 270, y: 160, w: 238, side: "left", at: 46, leg: 40, ring: true }
    ],
    code: `// Turn a knob: a potentiometer on A0 sets the brightness of an LED on pin 9.
const int KNOB_PIN = A0;
const int LED_PIN = 9; // must be a ~ (PWM) pin

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(KNOB_PIN); // 0 .. 1023
  int bright = raw / 4;           // 0 .. 255
  analogWrite(LED_PIN, bright);
  Serial.print("knob = ");
  Serial.print(raw);
  Serial.print(" brightness = ");
  Serial.println(bright);
  delay(100);
}`,
    specifications: {
      potentiometerResistance: "10 kΩ linear taper, 270° travel",
      adcResolution: "10-bit (1024 steps, 4.88 mV/step)",
      pwmFrequency: "490 Hz on pin ~9",
      pwmDutyCycle: "0% to 100% (0 to 255 steps)",
      readTime: "≈ 100 µs per analogRead()"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.Pot_Leg1", color: "red", label: "Wire 1 (Red): Uno 5V → Potentiometer Outer Leg 1" },
      { from: "Breadboard.Pot_Leg2", to: "Uno.A0", color: "green", label: "Wire 2 (Green): Potentiometer Middle Leg 2 → Uno A0" },
      { from: "Uno.GND", to: "Breadboard.Pot_Leg3", color: "black", label: "Wire 3 (Black): Uno GND → Potentiometer Outer Leg 3" },
      { from: "Uno.D9", to: "Breadboard.Resistor1", color: "yellow", label: "Wire 4 (Yellow/Amber): Uno PWM ~9 → 220 Ω Resistor → LED Anode" },
      { from: "Breadboard.Bridge_GND", to: "Breadboard.Bridge_Cathode", color: "black", isBridge: true, label: "Wire 5 (Black Bridge): GND Rail (Row 11) → LED Cathode (Row 20)" }
    ],
    sensorControls: [
      { id: "knob_raw", type: "knob", label: "10 kΩ Potentiometer (A0)", default: 620, min: 0, max: 1023, step: 1, unit: "ADC" }
    ]
  },

  {
    id: 5,
    slug: "mix-colours",
    hash: "#rgb",
    title: "5. Mix Colours",
    subtitle: "Common-Cathode RGB LED Full-Spectrum PWM",
    badge: "Lesson 5 / 16",
    difficulty: "Intermediate",
    hardwareList: ["5 mm Common-Cathode RGB LED", "3× 220 Ω Resistors", "Breadboard", "4x Jumper Wires"],
    unoPins: ["~D9 (Red PWM)", "~D10 (Green PWM)", "~D11 (Blue PWM)", "GND"],
    overview: {
      concept: "Additive color synthesis using a common-cathode RGB LED. Modulating three independent 8-bit PWM channels creates 16.7 million distinct hues (256³ combinations).",
      physics: "Each color die has a different semiconductor bandgap and forward voltage (Red ~2.0V, Green ~3.2V, Blue ~3.2V). 220 Ω resistors limit current on all three anode legs while the common cathode connects to GND.",
      formula: "Color = (R, G, B) where each channel is duty cycle from 0 to 255.",
      applications: "Mood lights, smart bulb illumination, multi-state visual telemetry."
    },
    pinout: [
      { pin: "~D9", function: "220 Ω → Red Anode", signal: "PWM duty cycle (0–255) sets red channel brightness.", color: "#ee7f62" },
      { pin: "~D10", function: "220 Ω → Green Anode", signal: "PWM duty cycle (0–255) sets green channel brightness.", color: "#3fae6a" },
      { pin: "~D11", function: "220 Ω → Blue Anode", signal: "PWM duty cycle (0–255) sets blue channel brightness.", color: "#3d6fc4" },
      { pin: "GND", function: "Common Cathode Lead", signal: "Ground return shared by all three color dies (0 V).", color: "#24272f" }
    ],
    callouts: [
      { anchor: "part:rgb", icon: "bulb", title: "RGB LED", body: "Three colours in one lens — click it to mix.", x: 290, y: -350, w: 238, side: "bottom", at: 40, leg: 30, ring: true },
      { anchor: "part:r-green", icon: "resistor", wide: true, title: "3 Resistors", body: "220 Ω on each colour keeps the current safe.", x: 270, y: 160, w: 248, side: "left", at: 46, leg: 40, ring: true },
      { anchor: "pin:D10", icon: "pwm", wide: true, title: "Pins ~9 ~10 ~11", body: "One PWM pin for each colour.", x: -162, y: -350, w: 252, side: "bottom", at: 70, leg: 30, ring: true },
      { anchor: "pin:GND", icon: "wave", title: "GND", body: "The longest leg is the shared ground.", x: -498, y: -330, w: 236, side: "right", at: 46, leg: 30, ring: true }
    ],
    code: `// Lesson 5: Mix Colours
// Sweeps three independent PWM channels (0–255) to blend full-spectrum color.

const int RED_PIN = 9;
const int GREEN_PIN = 10;
const int BLUE_PIN = 11;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 5: RGB Color Mixing active");
}

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
  Serial.print("RGB Color -> R: ");
  Serial.print(r);
  Serial.print(" G: ");
  Serial.print(g);
  Serial.print(" B: ");
  Serial.println(b);
}

void loop() {
  setColor(255, 0, 0);   // Red
  delay(1000);
  setColor(0, 255, 0);   // Green
  delay(1000);
  setColor(0, 0, 255);   // Blue
  delay(1000);
  setColor(255, 255, 0); // Yellow
  delay(1000);
  setColor(0, 255, 255); // Cyan
  delay(1000);
  setColor(255, 0, 255); // Magenta
  delay(1000);
  setColor(255, 255, 255); // White
  delay(1000);
}`,
    specifications: {
      rgbChannels: "3 Independent 8-bit PWM channels",
      pinAssignments: "Red: ~9, Green: ~10, Blue: ~11",
      resistors: "3x 220 Ω 1/4W"
    },
    requiredNetlist: [
      { from: "Uno.D9", to: "Breadboard.RGB_ResRed", color: "red", label: "Wire 1 (Coral/Red): Uno PWM ~9 → 220 Ω Resistor → Red Anode" },
      { from: "Breadboard.RGB_GND", to: "Uno.GND", color: "black", label: "Wire 2 (Navy): Common Cathode (GND) → Uno GND" },
      { from: "Uno.D10", to: "Breadboard.RGB_ResGreen", color: "green", label: "Wire 3 (Green): Uno PWM ~10 → 220 Ω Resistor → Green Anode" },
      { from: "Uno.D11", to: "Breadboard.RGB_ResBlue", color: "blue", label: "Wire 4 (Blue): Uno PWM ~11 → 220 Ω Resistor → Blue Anode" }
    ],
    sensorControls: [
      { id: "rgb_r", type: "slider", label: "Red PWM (~9)", default: 255, min: 0, max: 255, step: 1, unit: "PWM" },
      { id: "rgb_g", type: "slider", label: "Green PWM (~10)", default: 120, min: 0, max: 255, step: 1, unit: "PWM" },
      { id: "rgb_b", type: "slider", label: "Blue PWM (~11)", default: 200, min: 0, max: 255, step: 1, unit: "PWM" }
    ]
  },

  {
    id: 6,
    slug: "sense-light",
    hash: "#light",
    title: "6. Sense Light",
    subtitle: "GL5528 LDR Photoresistor & Automatic Night Light",
    badge: "Lesson 6 / 16",
    difficulty: "Beginner",
    hardwareList: ["GL5528 Photoresistor (LDR)", "10 kΩ Resistor", "LED", "220 Ω Resistor", "Breadboard"],
    unoPins: ["A0 (Divider)", "D13 (LED)", "5V", "GND"],
    overview: {
      concept: "Constructing a light-sensitive voltage divider with a Cadmium Sulfide (CdS) photoresistor. Automatically triggers a night-light LED when ambient darkness falls below a threshold.",
      physics: "Photons falling on the semiconductor crystal excite electrons into conduction, dropping LDR resistance from >1 MΩ in complete darkness down to ~10 kΩ in bright ambient room light.",
      formula: "V_out = 5.0V × (10kΩ / (R_LDR + 10kΩ)). In dark, R_LDR is huge → V_out drops < 1.95V (ADC < 400).",
      applications: "Solar street lights, smartphone auto-brightness sensors, camera light meters."
    },
    pinout: [
      { pin: "5V", function: "LDR Terminal 1", signal: "+5V Reference" },
      { pin: "A0", function: "Divider Junction (LDR + 10kΩ)", signal: "Analog Voltage (0-5V)" },
      { pin: "D13", function: "Night Light Indicator LED", signal: "HIGH when dark (< 400)" },
      { pin: "GND", function: "10kΩ Return & LED Return", signal: "0V Ground" }
    ],
    code: `// Lesson 6: Sense Light
// LDR resistance drops in bright light; triggers night-light LED when analogRead(A0) < 400.

const int LDR_PIN = A0;
const int LED_PIN = 13;
const int THRESHOLD = 400; // Darkness trip point

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 6: Automatic Night Light active");
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);
  Serial.print("Ambient Light ADC: ");
  Serial.print(lightLevel);

  if (lightLevel < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println(" -> DARK DETECTED: Night Light ON");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println(" -> ADEQUATE LIGHT: Night Light OFF");
  }
  delay(200);
}`,
    specifications: {
      ldrType: "GL5528 CdS Photoconductive Cell",
      darkResistance: "> 1.0 MΩ",
      lightResistance: "10–20 kΩ @ 10 Lux",
      tripThreshold: "400 ADC counts (~1.95V)"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.LDR_Leg1", color: "red", label: "5V to LDR Leg 1" },
      { from: "Breadboard.LDR_Leg2", to: "Uno.A0", color: "amber", label: "LDR Leg 2 to Uno A0" },
      { from: "Uno.A0", to: "Breadboard.Res10k_Leg1", color: "amber", label: "A0 to 10kΩ Resistor" },
      { from: "Breadboard.Res10k_Leg2", to: "Uno.GND", color: "black", label: "10kΩ to GND" },
      { from: "Uno.D13", to: "Breadboard.LED_Anode", color: "blue", label: "D13 to LED Anode" },
      { from: "Breadboard.LED_Cathode", to: "Uno.GND", color: "black", label: "LED Cathode to GND" }
    ],
    sensorControls: [
      { id: "ambient_light", type: "slider", label: "Ambient Illumination (Lux)", default: 600, min: 50, max: 1000, step: 10, unit: "ADC" }
    ]
  },

  {
    id: 7,
    slug: "read-a-sensor",
    hash: "#sensor",
    title: "7. Read a Sensor",
    subtitle: "HC-SR04 Ultrasonic Sonar Ranging Module",
    badge: "Lesson 7 / 16",
    difficulty: "Intermediate",
    hardwareList: ["HC-SR04 Ultrasonic Sensor", "Breadboard", "4x Jumper Wires"],
    unoPins: ["D9 (TRIG)", "D10 (ECHO)", "5V", "GND"],
    overview: {
      concept: "Echolocation distance measurement using the HC-SR04 ultrasonic sensor. Measures acoustic time-of-flight of high-frequency 40 kHz sound waves.",
      physics: "Sound travels through air at approximately 343 m/s (0.0343 cm/µs or ~29.1 µs/cm). The acoustic pulse travels to the obstacle and bounces back, so round-trip distance is twice the single-way distance: Total µs / 58 ≈ Distance in cm.",
      formula: "Distance (cm) = (Duration in microseconds × 0.0343) / 2 = Duration / 58.",
      applications: "Robotics obstacle avoidance, parking radar, water tank level gauges."
    },
    pinout: [
      { pin: "5V", function: "VCC Power Supply", signal: "+5.0V (< 15mA)" },
      { pin: "D9", function: "TRIG Pulse Trigger", signal: "10 µs HIGH TTL pulse" },
      { pin: "D10", function: "ECHO Echo Receive", signal: "Pulse width proportional to distance" },
      { pin: "GND", function: "Common Ground Return", signal: "0V Ground" }
    ],
    code: `// Lesson 7: HC-SR04 Distance (BitForBytes #distance)
// Fires a 10 us ultrasonic ping and divides echo time (pulseIn()) by 58 us/cm.

const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  Serial.println("Lesson 7: HC-SR04 Ultrasonic Ranging active");
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  
  long cm = pulseIn(ECHO, HIGH, 30000UL) / 58;
  
  Serial.print("Target Distance: ");
  Serial.print(cm);
  Serial.println(" cm");
  
  delay(200);
}`,
    specifications: {
      frequency: "40 kHz ultrasound",
      rangingRange: "2 cm to 400 cm",
      resolution: "0.3 cm",
      measuringAngle: "15 degrees"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.Sonar_VCC", color: "red", label: "5V to HC-SR04 VCC" },
      { from: "Uno.D9", to: "Breadboard.Sonar_TRIG", color: "orange", label: "D9 to TRIG" },
      { from: "Uno.D10", to: "Breadboard.Sonar_ECHO", color: "amber", label: "D10 to ECHO" },
      { from: "Breadboard.Sonar_GND", to: "Uno.GND", color: "black", label: "HC-SR04 GND to Uno GND" }
    ],
    sensorControls: [
      { id: "obstacle_dist", type: "slider", label: "Obstacle Distance (cm)", default: 28, min: 2, max: 200, step: 1, unit: "cm" }
    ]
  },

  {
    id: 8,
    slug: "make-a-sound",
    hash: "#sound",
    title: "8. Make a Sound",
    subtitle: "12 mm Passive Piezo Buzzer & Tone Synthesis",
    badge: "Lesson 8 / 16",
    difficulty: "Beginner",
    hardwareList: ["12 mm Passive Piezo Buzzer", "Breadboard", "2x Jumper Wires"],
    unoPins: ["D8 (Tone Out)", "GND"],
    overview: {
      concept: "Generating audible square waves using the ATmega328P hardware timers and the `tone()` API. Drives a piezo acoustic disc into resonance.",
      physics: "The piezoelectric crystal flexes mechanically when an electric voltage is applied. By toggling pin D8 at specific frequencies (e.g., 440 Hz for concert pitch A4), sound waves are radiated into the ambient air.",
      formula: "Period T = 1 / Frequency = 1 / 440 Hz ≈ 2.27 milliseconds square wave cycle.",
      applications: "Audio alerts, alarm chimes, synthesized music, acoustic user confirmation."
    },
    pinout: [
      { pin: "D8", function: "Square Wave Audio Tone", signal: "AC square wave (tone(8, freq))" },
      { pin: "GND", function: "Piezo Return Leg", signal: "0V Ground" }
    ],
    code: `// Lesson 8: Make a Sound
// Generates square-wave audio frequencies (tone(8, 440) for concert A4) and noTone()

const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 8: Piezo Audio Synthesis active");
}

void loop() {
  Serial.println("Playing Concert A4 (440 Hz)...");
  tone(BUZZER_PIN, 440); // 440 Hz A4
  delay(500);

  Serial.println("Playing High C5 (523 Hz)...");
  tone(BUZZER_PIN, 523); // 523 Hz C5
  delay(500);

  Serial.println("Buzzer Silence...");
  noTone(BUZZER_PIN);
  delay(1000);
}`,
    specifications: {
      buzzerType: "12 mm Passive Piezo Transducer",
      audioFrequencies: "440 Hz (A4) and 523 Hz (C5)",
      splRating: "85 dB @ 10 cm",
      operatingVoltage: "3-12V P-P"
    },
    requiredNetlist: [
      { from: "Uno.D8", to: "Breadboard.Buzzer_Pos", color: "purple", label: "D8 to Buzzer Positive (+)" },
      { from: "Breadboard.Buzzer_Neg", to: "Uno.GND", color: "black", label: "Buzzer Negative (-) to GND" }
    ],
    sensorControls: [
      { id: "tone_freq", type: "slider", label: "Audio Frequency (Hz)", default: 440, min: 200, max: 2000, step: 20, unit: "Hz" }
    ]
  },

  {
    id: 9,
    slug: "mini-piano",
    hash: "#piano",
    title: "9. Mini Piano",
    subtitle: "8-Key Tactile Keyboard Matrix with C4–C5 Musical Scale",
    badge: "Lesson 9 / 16",
    difficulty: "Intermediate",
    hardwareList: ["8× Tactile Push Buttons", "12 mm Piezo Buzzer", "Breadboard", "10x Jumper Wires"],
    unoPins: ["D2–D9 (Key Inputs)", "D10 (Buzzer)", "GND"],
    overview: {
      concept: "Building an 8-note musical synthesizer keyboard. The sketch polls an array of tactile push buttons on pins D2 through D9, mapping each button to an octave note from C4 (262 Hz) to C5 (523 Hz).",
      physics: "Musical notes correspond to log-spaced frequencies: Middle C is 261.63 Hz, D is 293.66 Hz, E is 329.63 Hz, F is 349.23 Hz, G is 392.00 Hz, A is 440.00 Hz, B is 493.88 Hz, and C5 is 523.25 Hz.",
      formula: "f_n = 440 × 2^((n - 49) / 12) for 12-tone equal temperament.",
      applications: "Electronic music synthesizers, interactive input pads, security code entry sounders."
    },
    pinout: [
      { pin: "D2–D9", function: "8 Key Inputs with INPUT_PULLUP", signal: "Active-LOW push buttons" },
      { pin: "D10", function: "Audio Tone Output to Buzzer", signal: "Synthesized audio square waves" },
      { pin: "GND", function: "Common Key & Buzzer Return", signal: "0V Ground" }
    ],
    code: `// Lesson 9: Mini Piano
// Scans an array of 8 button inputs and plays scale frequencies from C4 to C5.

const int BUZZER = 10;
const int KEYS[8] = {2, 3, 4, 5, 6, 7, 8, 9};
const int NOTES[8] = {262, 294, 330, 349, 392, 440, 494, 523};
const char* NOTE_NAMES[8] = {"C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"};

void setup() {
  pinMode(BUZZER, OUTPUT);
  for (int i = 0; i < 8; i++) {
    pinMode(KEYS[i], INPUT_PULLUP);
  }
  Serial.begin(9600);
  Serial.println("Lesson 9: 8-Key Mini Piano Ready (C4-C5)");
}

void loop() {
  bool notePlayed = false;
  for (int i = 0; i < 8; i++) {
    if (digitalRead(KEYS[i]) == LOW) { // Key pressed
      tone(BUZZER, NOTES[i]);
      Serial.print("Note: ");
      Serial.print(NOTE_NAMES[i]);
      Serial.print(" (");
      Serial.print(NOTES[i]);
      Serial.println(" Hz)");
      notePlayed = true;
      break;
    }
  }
  if (!notePlayed) {
    noTone(BUZZER);
  }
  delay(20);
}`,
    specifications: {
      octaveRange: "C4 (262 Hz) to C5 (523 Hz)",
      keys: "8 Tactile Switches with INPUT_PULLUP",
      buzzerPin: "Pin 10"
    },
    requiredNetlist: [
      { from: "Uno.D2", to: "Breadboard.Key1", color: "red", label: "D2 to Key C4" },
      { from: "Uno.D10", to: "Breadboard.Buzzer_Pos", color: "purple", label: "D10 to Buzzer Pos" },
      { from: "Breadboard.Buzzer_Neg", to: "Uno.GND", color: "black", label: "Buzzer Neg to GND" }
    ],
    sensorControls: [
      { id: "piano_key", type: "piano_keys", label: "Interactive 8-Key Piano", default: 0, min: 0, max: 7 }
    ]
  },

  {
    id: 10,
    slug: "control-a-motor",
    hash: "#motor",
    title: "10. Control a Motor",
    subtitle: "TIP120 Darlington Transistor Switch & Flyback Diode",
    badge: "Lesson 10 / 16",
    difficulty: "Advanced",
    hardwareList: ["3–6 V DC Motor", "TIP120 Darlington Transistor", "1N4007 Flyback Diode", "1 kΩ Resistor", "Breadboard"],
    unoPins: ["~D9 (PWM Motor Speed)", "GND", "External 5V/6V Power"],
    overview: {
      concept: "High-current inductive load control using a TIP120 Darlington power transistor. Protects the sensitive microcontroller from inductive high-voltage kickback using a 1N4007 flyback diode.",
      physics: "A DC motor requires 200mA to 800mA, far exceeding the 20mA limit of an ATmega328P GPIO. The transistor functions as an electronic switch amplified by gain hFE > 1000. When switched off, the motor's collapsing magnetic field creates a huge reverse-voltage spike (V = -L * di/dt) that the flyback diode safely clamps.",
      formula: "Back-EMF V_spike = -L × (dI / dt). Flyback diode clamps voltage to 0.7V above supply.",
      applications: "Robotics drive wheels, cooling fan speed controllers, pump drivers."
    },
    pinout: [
      { pin: "~D9", function: "PWM Motor Speed Control", signal: "0–255 duty cycle to TIP120 Base" },
      { pin: "TIP120.Base", function: "Transistor Gate/Base via 1kΩ", signal: "Current-limited logic drive" },
      { pin: "TIP120.Coll", function: "Collector to Motor (-)", signal: "Switches motor ground return" },
      { pin: "GND", function: "Common Ground (Uno + Motor)", signal: "0V Ground" }
    ],
    code: `// Lesson 10: Control a Motor
// Transistor switches high motor current via PWM while flyback diode absorbs inductive kick.

const int MOTOR_PIN = 9;

void setup() {
  pinMode(MOTOR_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 10: DC Motor PWM Ramp Speed Controller");
}

void loop() {
  Serial.println("Ramping motor speed UP...");
  for (int speed = 0; speed <= 255; speed += 15) {
    analogWrite(MOTOR_PIN, speed);
    Serial.print("Motor PWM: ");
    Serial.print(speed);
    Serial.print(" (");
    Serial.print((speed * 100) / 255);
    Serial.println("% power)");
    delay(100);
  }

  delay(1000);

  Serial.println("Ramping motor speed DOWN...");
  for (int speed = 255; speed >= 0; speed -= 15) {
    analogWrite(MOTOR_PIN, speed);
    Serial.print("Motor PWM: ");
    Serial.println(speed);
    delay(100);
  }

  delay(1000);
}`,
    specifications: {
      transistor: "TIP120 NPN Darlington (60V, 5A continuous)",
      snubberDiode: "1N4007 1000V 1A fast clamp",
      motorVoltage: "3V to 6V DC",
      maxPWMCurrent: "1.5 A with heatsink"
    },
    requiredNetlist: [
      { from: "Uno.D9", to: "Breadboard.Res1k_Leg1", color: "blue", label: "D9 to 1kΩ Resistor" },
      { from: "Breadboard.Res1k_Leg2", to: "Breadboard.TIP120_Base", color: "amber", label: "1kΩ to TIP120 Base" },
      { from: "Breadboard.TIP120_Emitter", to: "Uno.GND", color: "black", label: "TIP120 Emitter to GND" },
      { from: "Breadboard.TIP120_Collector", to: "Breadboard.Motor_Neg", color: "purple", label: "TIP120 Collector to Motor (-)" }
    ],
    sensorControls: [
      { id: "motor_speed_override", type: "slider", label: "Motor Throttle (%)", default: 65, min: 0, max: 100, step: 5, unit: "%" }
    ]
  },

  {
    id: 11,
    slug: "sense-heat",
    hash: "#heat",
    title: "11. Sense Heat",
    subtitle: "TMP36 Analog Temperature Sensor & Celsius Conversion",
    badge: "Lesson 11 / 16",
    difficulty: "Beginner",
    hardwareList: ["TMP36 Temperature Sensor", "Breadboard", "3x Jumper Wires"],
    unoPins: ["A0 (Vout)", "5V", "GND"],
    overview: {
      concept: "Reading calibrated temperature with the TMP36 solid-state silicon bandgap sensor. Converts analog ADC readings into millivolts and exact Celsius temperature.",
      physics: "The TMP36 outputs 500 mV (0.5 V) at 0 °C, and scales linearly with a sensitivity of 10 mV/°C. It requires no external calibration and operates accurately from -40 °C to +125 °C.",
      formula: "Voltage = ADC × (5.0 / 1024.0) | Temp (°C) = (Voltage - 0.5) × 100 | Temp (°F) = (Temp_C × 9/5) + 32.",
      applications: "HVAC thermostats, PC CPU thermal monitoring, weather stations, incubator regulation."
    },
    pinout: [
      { pin: "5V", function: "TMP36 Pin 1 (VCC)", signal: "+2.7V to +5.5V DC" },
      { pin: "A0", function: "TMP36 Pin 2 (Vout)", signal: "10 mV/°C analog output" },
      { pin: "GND", function: "TMP36 Pin 3 (GND)", signal: "0V Ground" }
    ],
    code: `// Lesson 11: Sense Heat
// TMP36 outputs 0.5 V at 0 °C plus 10 mV/°C; converts ADC voltage to Celsius.

const int TEMP_PIN = A0;

void setup() {
  Serial.begin(9600);
  Serial.println("Lesson 11: TMP36 Precision Thermal Monitor ready");
}

void loop() {
  int rawADC = analogRead(TEMP_PIN);
  float voltage = rawADC * (5.0 / 1024.0);
  float temperatureC = (voltage - 0.5) * 100.0;
  float temperatureF = (temperatureC * 9.0 / 5.0) + 32.0;

  Serial.print("Raw ADC: ");
  Serial.print(rawADC);
  Serial.print(" | Voltage: ");
  Serial.print(voltage, 3);
  Serial.print(" V | Temp: ");
  Serial.print(temperatureC, 1);
  Serial.print(" °C (");
  Serial.print(temperatureF, 1);
  Serial.println(" °F)");

  delay(500);
}`,
    specifications: {
      temperatureRange: "-40 °C to +125 °C",
      outputScale: "10.0 mV per degree Celsius",
      offsetAtZero: "500 mV (0.50 V)",
      accuracy: "±1 °C at room temperature"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.TMP36_VCC", color: "red", label: "5V to TMP36 Pin 1 (VCC)" },
      { from: "Breadboard.TMP36_Vout", to: "Uno.A0", color: "amber", label: "TMP36 Pin 2 (Vout) to Uno A0" },
      { from: "Breadboard.TMP36_GND", to: "Uno.GND", color: "black", label: "TMP36 Pin 3 (GND) to Uno GND" }
    ],
    sensorControls: [
      { id: "ambient_temp", type: "slider", label: "Chamber Temperature (°C)", default: 24, min: -10, max: 80, step: 1, unit: "°C" }
    ]
  },

  {
    id: 12,
    slug: "sweep-a-servo",
    hash: "#servo",
    title: "12. Sweep a Servo",
    subtitle: "SG90 9g Micro Servo 0° to 180° Sweep with <Servo.h>",
    badge: "Lesson 12 / 16",
    difficulty: "Intermediate",
    hardwareList: ["SG90 9g Micro Servo Motor", "Breadboard", "3x Jumper Wires"],
    unoPins: ["~D9 (PWM Signal)", "5V", "GND"],
    overview: {
      concept: "Controlling angular shaft position with closed-loop servo feedback using the official `<Servo.h>` library. Sweeps the actuator horn smoothly between 0° and 180°.",
      physics: "A hobby RC servo uses 50 Hz Pulse-Position Modulation (20 ms period). A pulse width of 1.0 ms positions the shaft at 0°, 1.5 ms centers it at 90°, and 2.0 ms positions it at 180°.",
      formula: "Pulse Width = 1.0 ms + (Angle / 180.0) × 1.0 ms (50 Hz repetition rate).",
      applications: "Robotic arms, pan-tilt camera gimbals, RC aircraft steering surfaces, smart door locks."
    },
    pinout: [
      { pin: "5V", function: "Servo Power (Red wire)", signal: "+4.8V to +6.0V DC" },
      { pin: "~D9", function: "Servo Signal (Orange wire)", signal: "50 Hz PPM command pulses" },
      { pin: "GND", function: "Servo Ground (Brown wire)", signal: "0V Ground" }
    ],
    code: `// Lesson 12: Servo Sweep (BitForBytes #servo)
#include <Servo.h>

Servo arm;

void setup() {
  arm.attach(9);
  Serial.begin(9600);
  Serial.println("Lesson 12: SG90 Micro Servo Sweep initialized");
}

void loop() {
  Serial.println("Sweeping 0 to 180 degrees...");
  for (int a = 0; a <= 180; a += 2) {
    arm.write(a);
    Serial.print("Angle: ");
    Serial.println(a);
    delay(15);
  }

  Serial.println("Sweeping 180 to 0 degrees...");
  for (int a = 180; a >= 0; a -= 2) {
    arm.write(a);
    Serial.print("Angle: ");
    Serial.println(a);
    delay(15);
  }
}`,
    specifications: {
      model: "TowerPro SG90 9g",
      torque: "1.8 kg·cm @ 4.8V",
      rotationAngle: "180 degrees",
      commandSignal: "50 Hz (1000 µs to 2000 µs pulse width)"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.Servo_VCC", color: "red", label: "5V to Servo Red (VCC)" },
      { from: "Uno.D9", to: "Breadboard.Servo_Signal", color: "orange", label: "D9 to Servo Orange (Signal)" },
      { from: "Breadboard.Servo_GND", to: "Uno.GND", color: "black", label: "Servo Brown (GND) to Uno GND" }
    ],
    sensorControls: [
      { id: "servo_angle", type: "slider", label: "Servo Arm Angle (°)", default: 90, min: 0, max: 180, step: 1, unit: "°" }
    ]
  },

  {
    id: 13,
    slug: "spin-the-wheel",
    hash: "#wheel",
    title: "13. Spin the Wheel",
    subtitle: "28BYJ-48 Stepper Motor + ULN2003 Driver Micro-Stepping",
    badge: "Lesson 13 / 16",
    difficulty: "Advanced",
    hardwareList: ["28BYJ-48 5V Stepper Motor", "ULN2003 Driver Board", "Breadboard", "6x Jumper Wires"],
    unoPins: ["D3 (STEP)", "D4 (DIR)", "5V", "GND"],
    overview: {
      concept: "High-precision discrete angular positioning using a 4-phase unipolar stepper motor. Advances the internal rotor by precisely energizing electromagnetic coil pairs in sequence.",
      physics: "The 28BYJ-48 has a 64:1 internal planetary gearbox reduction. In half-step mode, it executes 4,096 pulses per full 360° output revolution, allowing micro-positioning down to 0.088° per step without overshoot.",
      formula: "Angular Step = 360° / 2048 steps ≈ 0.175° per step in full-step drive mode.",
      applications: "3D printers, CNC laser plotters, camera slider rails, quartz clock drives."
    },
    pinout: [
      { pin: "D3", function: "Step Pulse Driver", signal: "Logic clock pulses" },
      { pin: "D4", function: "Direction Control", signal: "HIGH = CW, LOW = CCW" },
      { pin: "5V", function: "ULN2003 VCC Power", signal: "+5.0V Driver supply" },
      { pin: "GND", function: "Common Ground Return", signal: "0V Ground" }
    ],
    code: `// Lesson 13: Spin the Wheel
// Advances motor shaft in exact discrete micro-steps (2048 steps per full 28BYJ-48 turn).

const int STEP_PIN = 3;
const int DIR_PIN = 4;
const int STEPS_PER_REV = 2048; // Full 360-degree rotation

void setup() {
  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 13: 28BYJ-48 Stepper Driver active");
}

void loop() {
  Serial.println("Rotating Clockwise (CW) 360°...");
  digitalWrite(DIR_PIN, HIGH);
  for (int i = 0; i < STEPS_PER_REV; i++) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(1000);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(1000);
  }

  delay(1000);

  Serial.println("Rotating Counter-Clockwise (CCW) 360°...");
  digitalWrite(DIR_PIN, LOW);
  for (int i = 0; i < STEPS_PER_REV; i++) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(1000);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(1000);
  }

  delay(1000);
}`,
    specifications: {
      motorType: "28BYJ-48 5V Unipolar Stepper",
      gearRatio: "64:1 reduction",
      stepsPerRev: "2048 full-steps / 4096 half-steps",
      driverIC: "ULN2003 High-Current Darlington Array"
    },
    requiredNetlist: [
      { from: "Uno.D3", to: "Breadboard.ULN_IN1", color: "blue", label: "D3 to ULN2003 STEP" },
      { from: "Uno.D4", to: "Breadboard.ULN_IN2", color: "amber", label: "D4 to ULN2003 DIR" },
      { from: "Uno.5V", to: "Breadboard.ULN_VCC", color: "red", label: "5V to ULN2003 VCC" },
      { from: "Breadboard.ULN_GND", to: "Uno.GND", color: "black", label: "ULN2003 GND to Uno GND" }
    ],
    sensorControls: [
      { id: "stepper_rpm", type: "slider", label: "Target Speed (RPM)", default: 12, min: 1, max: 25, step: 1, unit: "RPM" }
    ]
  },

  {
    id: 14,
    slug: "smart-plant",
    hash: "#plant",
    title: "14. Smart Plant",
    subtitle: "Capacitive Soil Moisture Probe & SSD1306 OLED Screen",
    badge: "Lesson 14 / 16",
    difficulty: "Advanced",
    hardwareList: ["Capacitive Soil Moisture Sensor v1.2", "0.96″ SSD1306 OLED Display", "Breadboard", "7x Jumper Wires"],
    unoPins: ["A0 (Soil)", "A4 (SDA)", "A5 (SCL)", "D13 (LED)", "5V", "GND"],
    overview: {
      concept: "Autonomous agricultural soil health telemetry. Reads a corrosion-resistant capacitive probe to detect water content and renders live graphs and warnings on an I2C OLED display.",
      physics: "Capacitance changes with the dielectric permittivity of the medium (air ε_r ≈ 1, dry soil ε_r ≈ 3-5, pure water ε_r ≈ 80). Moisture raises capacitance, decreasing circuit oscillation voltage (~2.8V bone dry to ~1.2V soaked).",
      formula: "Moisture (%) = map(analogRead(A0), DryADC, WetADC, 0, 100).",
      applications: "Automated drip irrigation, smart greenhouse planters, IoT soil monitors."
    },
    pinout: [
      { pin: "A0", function: "Capacitive Moisture Analog Out", signal: "1.2V (Wet) to 2.8V (Dry)" },
      { pin: "A4", function: "I2C SDA (Serial Data)", signal: "SSD1306 I2C data bus" },
      { pin: "A5", function: "I2C SCL (Serial Clock)", signal: "SSD1306 I2C clock bus" },
      { pin: "D13", function: "Low Moisture Warning LED", signal: "HIGH when dry (< 30%)" },
      { pin: "5V", function: "Shared VCC Rail", signal: "+5V DC" },
      { pin: "GND", function: "Shared Ground Rail", signal: "0V Ground" }
    ],
    code: `// Lesson 14: Smart Plant
// Reads capacitive soil moisture v1.2, alerts when soil drops below threshold.

const int SOIL_PIN = A0;
const int ALERT_LED = 13;
const int DRY_VAL = 580; // ~2.8V in dry soil
const int WET_VAL = 250; // ~1.2V in wet soil

void setup() {
  pinMode(ALERT_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("======================================");
  Serial.println("Smart Plant Soil Telemetry Initialized");
  Serial.println("SSD1306 I2C Address: 0x3C (A4/A5)");
  Serial.println("======================================");
}

void loop() {
  int rawSoil = analogRead(SOIL_PIN);
  int moisturePercent = map(rawSoil, DRY_VAL, WET_VAL, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  Serial.print("Soil ADC: ");
  Serial.print(rawSoil);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.print("%");

  if (moisturePercent < 30) {
    digitalWrite(ALERT_LED, HIGH);
    Serial.println(" [ALERT: WATER NEEDED!]");
  } else {
    digitalWrite(ALERT_LED, LOW);
    Serial.println(" [STATUS: HEALTHY]");
  }
  delay(1000);
}`,
    specifications: {
      probeTechnology: "Capacitive 555-timer frequency detection",
      displayInterface: "SSD1306 128×64 Dot Matrix I2C (0x3C)",
      dryThreshold: "30% moisture limit"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.Soil_VCC", color: "red", label: "5V to Soil VCC" },
      { from: "Breadboard.Soil_AOUT", to: "Uno.A0", color: "amber", label: "Soil AOUT to Uno A0" },
      { from: "Breadboard.Soil_GND", to: "Uno.GND", color: "black", label: "Soil GND to Uno GND" },
      { from: "Uno.A4", to: "Breadboard.OLED_SDA", color: "green", label: "A4 (SDA) to OLED SDA" },
      { from: "Uno.A5", to: "Breadboard.OLED_SCL", color: "blue", label: "A5 (SCL) to OLED SCL" }
    ],
    sensorControls: [
      { id: "soil_moisture", type: "slider", label: "Soil Water Content (%)", default: 45, min: 0, max: 100, step: 1, unit: "%" }
    ]
  },

  {
    id: 15,
    slug: "feel-the-force",
    hash: "#force",
    title: "15. Feel the Force",
    subtitle: "FSR 402 Force Sensing Resistor & Pressure PWM LED",
    badge: "Lesson 15 / 16",
    difficulty: "Intermediate",
    hardwareList: ["FSR 402 (18 mm Pad)", "10 kΩ Resistor", "LED", "220 Ω Resistor", "Breadboard"],
    unoPins: ["A0 (Divider)", "~D9 (PWM LED)", "5V", "GND"],
    overview: {
      concept: "Measuring human physical touch and mechanical compression using a polymer thick-film Force Sensing Resistor (FSR). Directly maps physical fingertip force to LED brightness.",
      physics: "An FSR consists of conductive interlaced fingers separated by a semiconducting polymer matrix. When mechanical pressure compresses the polymer against the traces, contact area increases and electrical resistance drops precipitously from > 10 MΩ down to ~200 Ω.",
      formula: "V_out = 5.0V × (10kΩ / (R_FSR + 10kΩ)). Force 0.1 N to 10 N maps directly into ADC.",
      applications: "Electronic drum pads, robotic gripper tactile feedback, gaming touch controllers."
    },
    pinout: [
      { pin: "5V", function: "FSR Terminal 1", signal: "+5.0V Reference" },
      { pin: "A0", function: "FSR Divider Wiper (FSR + 10kΩ)", signal: "0.0 V – 4.9 V analog voltage" },
      { pin: "~9", function: "PWM to 220Ω & LED Anode", signal: "0–255 duty cycle" },
      { pin: "GND", function: "10kΩ Return & LED Cathode", signal: "0V Ground" }
    ],
    code: `// Lesson 15: FSR Force Pad (BitForBytes #force)
// Pad resistance drops from megaohms to hundreds of ohms under pressure; maps force to PWM.

const int FSR_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Lesson 15: FSR 402 Tactile Force Controller ready");
}

void loop() {
  int v = analogRead(FSR_PIN); // 0 .. 1023
  int brightness = map(v, 0, 1023, 0, 255);
  analogWrite(LED_PIN, brightness);

  Serial.print("Applied Force ADC: ");
  Serial.print(v);
  Serial.print(" -> LED Brightness: ");
  Serial.println(brightness);

  delay(100);
}`,
    specifications: {
      activeDiameter: "18.2 mm (0.75 in)",
      forceSensitivityRange: "0.1 N to 10.0 N (~10g to 1kg force)",
      unloadedResistance: "> 10 MΩ"
    },
    requiredNetlist: [
      { from: "Uno.5V", to: "Breadboard.FSR_Leg1", color: "red", label: "5V to FSR Leg 1" },
      { from: "Breadboard.FSR_Leg2", to: "Uno.A0", color: "amber", label: "FSR Leg 2 to Uno A0" },
      { from: "Uno.A0", to: "Breadboard.Res10k_Leg1", color: "amber", label: "A0 to 10kΩ Resistor" },
      { from: "Breadboard.Res10k_Leg2", to: "Uno.GND", color: "black", label: "10kΩ to Uno GND" },
      { from: "Uno.D9", to: "Breadboard.LED_Anode", color: "blue", label: "D9 to LED Anode" },
      { from: "Breadboard.LED_Cathode", to: "Uno.GND", color: "black", label: "LED Cathode to Uno GND" }
    ],
    sensorControls: [
      { id: "applied_force", type: "slider", label: "Applied Force (Newtons)", default: 2.5, min: 0, max: 10, step: 0.1, unit: "N" }
    ]
  },

  {
    id: 16,
    slug: "build-a-project",
    hash: "#project",
    title: "16. Build a Project",
    subtitle: "Automated Obstacle-Stopping Traffic Light System",
    badge: "Capstone Project",
    difficulty: "Advanced",
    hardwareList: ["HC-SR04 Ultrasonic Sensor", "Traffic Light LED Module (Red, Yellow, Green)", "Piezo Buzzer", "Breadboard"],
    unoPins: ["D9 (TRIG)", "D10 (ECHO)", "D4 (Red LED)", "D3 (Yellow LED)", "D2 (Green LED)", "D8 (Buzzer)", "5V", "GND"],
    overview: {
      concept: "Capstone embedded engineering integration! Combines ultrasonic obstacle ranging with an automated 3-state traffic signal and acoustic proximity alarm. Emulates vehicular collision avoidance systems.",
      physics: "Continuous distance monitoring controls a three-tier safety state machine: Safe (>25 cm = Green light), Caution (10–25 cm = Yellow light + intermittent slow beep), and Danger Emergency Stop (<10 cm = Red light + continuous high-pitched alarm).",
      formula: "State Machine: Distance > 25cm (GREEN) | 10cm ≤ Distance ≤ 25cm (YELLOW) | Distance < 10cm (RED + ALARM).",
      applications: "Automotive ADAS collision braking, industrial gantry crane safety barriers, warehouse AGV robotics."
    },
    pinout: [
      { pin: "D9", function: "HC-SR04 Sonar TRIG", signal: "10 µs trigger pulse" },
      { pin: "D10", function: "HC-SR04 Sonar ECHO", signal: "Pulse-width time-of-flight" },
      { pin: "D4", function: "Traffic Light RED LED", signal: "Emergency Stop Alert (< 10 cm)" },
      { pin: "D3", function: "Traffic Light YELLOW LED", signal: "Caution Approaching (10-25 cm)" },
      { pin: "D2", function: "Traffic Light GREEN LED", signal: "Clear Way (> 25 cm)" },
      { pin: "D8", function: "Acoustic Warning Buzzer", signal: "Proximity tone" },
      { pin: "5V", function: "Shared VCC Rail", signal: "+5.0V DC" },
      { pin: "GND", function: "Shared Ground Rail", signal: "0V Ground" }
    ],
    code: `// Lesson 16: Build a Project (Capstone Obstacle-Stopping Traffic Light)
// Combines ultrasonic obstacle ranging with a 3-state traffic light and buzzer alarm.

const int TRIG = 9;
const int ECHO = 10;
const int RED_LED = 4;
const int YELLOW_LED = 3;
const int GREEN_LED = 2;
const int BUZZER = 8;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  Serial.println("==============================================");
  Serial.println("Capstone 16: Obstacle Traffic System Online");
  Serial.println("Thresholds: Green > 25cm | Yellow 10-25cm | Red < 10cm");
  Serial.println("==============================================");
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  
  long duration = pulseIn(ECHO, HIGH, 30000UL);
  long cm = duration / 58;
  if (cm == 0) cm = 400; // No obstacle in immediate range

  Serial.print("Radar Range: ");
  Serial.print(cm);
  Serial.print(" cm -> ");

  if (cm < 10) {
    // Danger Stop
    digitalWrite(RED_LED, HIGH);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(GREEN_LED, LOW);
    tone(BUZZER, 1000);
    Serial.println("[STATE: EMERGENCY STOP - RED]");
  } else if (cm <= 25) {
    // Caution Slow Down
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    tone(BUZZER, 500);
    delay(50);
    noTone(BUZZER);
    Serial.println("[STATE: CAUTION - YELLOW]");
  } else {
    // Clear Green
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    noTone(BUZZER);
    Serial.println("[STATE: CLEAR - GREEN]");
  }

  delay(150);
}`,
    specifications: {
      sonarRange: "2 cm to 400 cm",
      trafficSignals: "Red (D4), Yellow (D3), Green (D2)",
      acousticWarning: "Passive buzzer on D8",
      safetyZones: "Clear: >25cm | Caution: 10-25cm | Hazard: <10cm"
    },
    requiredNetlist: [
      { from: "Uno.D9", to: "Breadboard.Sonar_TRIG", color: "orange", label: "D9 to Sonar TRIG" },
      { from: "Uno.D10", to: "Breadboard.Sonar_ECHO", color: "amber", label: "D10 to Sonar ECHO" },
      { from: "Uno.D4", to: "Breadboard.Traffic_Red", color: "red", label: "D4 to Red Light" },
      { from: "Uno.D3", to: "Breadboard.Traffic_Yellow", color: "amber", label: "D3 to Yellow Light" },
      { from: "Uno.D2", to: "Breadboard.Traffic_Green", color: "green", label: "D2 to Green Light" },
      { from: "Uno.D8", to: "Breadboard.Buzzer_Pos", color: "purple", label: "D8 to Buzzer" },
      { from: "Uno.5V", to: "Breadboard.VCC_Rail", color: "red", label: "5V to Power Rail" },
      { from: "Uno.GND", to: "Breadboard.GND_Rail", color: "black", label: "GND to Ground Rail" }
    ],
    sensorControls: [
      { id: "radar_distance", type: "slider", label: "Obstacle Proximity (cm)", default: 35, min: 2, max: 80, step: 1, unit: "cm" }
    ]
  }
];

// Helper functions for lessons
function getLessonById(id) {
  return LESSONS_DATA.find(l => l.id === id) || LESSONS_DATA[3]; // default to knob
}

function getLessonByHash(hash) {
  if (!hash) return LESSONS_DATA[3];
  const clean = hash.replace(/^#/, '').toLowerCase();
  return LESSONS_DATA.find(l => {
    const lHash = l.hash.replace(/^#/, '').toLowerCase();
    const lSlug = (l.slug || '').toLowerCase();
    return lHash === clean || lSlug === clean ||
      (clean === 'sensor' && l.id === 7) ||
      (clean === 'distance' && l.id === 7) ||
      (clean === 'stepper' && l.id === 13) ||
      (clean === 'wheel' && l.id === 13);
  }) || LESSONS_DATA[3];
}

if (typeof window !== 'undefined') {
  window.LESSONS_DATA = LESSONS_DATA;
  window.getLessonById = getLessonById;
  window.getLessonByHash = getLessonByHash;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LESSONS_DATA, getLessonById, getLessonByHash };
}

