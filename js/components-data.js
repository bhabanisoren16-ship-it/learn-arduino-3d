// Complete 24-Part Hardware Kit Bill of Materials (BOM)
// Based on Learn Arduino 3D Website Guide (PromptShipped Hardware List)

const HARDWARE_COMPONENTS = [
  // 1. Core Board & Prototyping
  {
    id: "uno-r3",
    name: "Arduino Uno R3",
    category: "Core Board & Prototyping",
    icon: "cpu",
    operatingVoltage: "5V (7-12V Input)",
    pins: "14 Digital (6 PWM), 6 Analog",
    description: "Flagship microcontroller development board powered by the ATmega328P MCU at 16 MHz. Includes built-in USB interface, DC barrel jack, and pin headers.",
    lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    badge: "Target Board",
    color: "#00979C",
    specs: {
      microcontroller: "ATmega328P (8-bit AVR RISC)",
      clockSpeed: "16 MHz",
      flashMemory: "32 KB (0.5 KB used by bootloader)",
      sram: "2 KB",
      eeprom: "1 KB",
      dcCurrentPerIO: "20 mA (40 mA absolute max)"
    }
  },
  {
    id: "breadboard-830",
    name: "Full-Size Solderless Breadboard",
    category: "Core Board & Prototyping",
    icon: "grid",
    operatingVoltage: "Up to 500V DC",
    pins: "830 Tie Points (630 terminal + 200 power bus)",
    description: "Full-size solderless breadboard with dual positive and negative power rails along each side. 0.1-inch standard pitch spacing for ICs and components.",
    lessons: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    badge: "Workbench Base",
    color: "#E2E8F0",
    specs: {
      tiePoints: "830 points",
      pitch: "2.54 mm (0.1 in)",
      material: "ABS plastic body with phosphor bronze nickel-plated spring clips",
      dimensions: "165 mm × 55 mm × 10 mm"
    }
  },
  {
    id: "jumper-wires",
    name: "Jumper Wires (7 Colors)",
    category: "Core Board & Prototyping",
    icon: "git-commit",
    operatingVoltage: "30V / 3A max",
    pins: "Male-to-Male (20cm & 10cm)",
    description: "Flexible multi-color jumper wires with gold-plated DuPont pin terminals. Color-coded standards: Red (5V), Black (GND), Blue (PWM), Amber (Analog), etc.",
    lessons: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    badge: "Wiring Tool",
    color: "#E53E3E",
    specs: {
      gauge: "24-26 AWG copper",
      colors: ["Red (5V)", "Black (GND)", "Blue (PWM)", "Amber/Yellow (Signal)", "Green", "Orange", "Purple/White"],
      termination: "Dupont Male Pin 0.1\""
    }
  },
  {
    id: "usb-cable",
    name: "USB-A to USB-B Cable",
    category: "Core Board & Prototyping",
    icon: "cable",
    operatingVoltage: "5V DC USB bus",
    pins: "4-wire (VBUS, D-, D+, GND)",
    description: "Standard 1.5m USB cable connecting computer port to the Uno R3 Type-B jack for firmware flashing and 9600-115200 baud Serial telemetry communication.",
    lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    badge: "Interface",
    color: "#718096",
    specs: {
      length: "1.5 meters",
      interface: "USB 2.0 Full Speed (12 Mbps)",
      currentCapacity: "500 mA max"
    }
  },

  // 2. Resistors & Controls
  {
    id: "resistor-220",
    name: "220 Ω Carbon Film Resistor",
    category: "Resistors & Controls",
    icon: "minus",
    operatingVoltage: "250V max (1/4 Watt)",
    pins: "2 Axial Leads",
    description: "Standard current-limiting resistor for 5mm LEDs. Drops approx 3V from 5V rail to deliver safe ~15mA operating current (Color bands: Red-Red-Brown-Gold).",
    lessons: [2, 4, 5, 16],
    badge: "Current Limiter",
    color: "#C53030",
    specs: {
      resistance: "220 Ω ±5%",
      powerRating: "0.25 W (1/4 Watt)",
      colorCode: "Red - Red - Brown - Gold",
      tempCoefficient: "±350 ppm/°C"
    }
  },
  {
    id: "resistor-1k",
    name: "1 kΩ Resistor",
    category: "Resistors & Controls",
    icon: "minus",
    operatingVoltage: "250V max (1/4 Watt)",
    pins: "2 Axial Leads",
    description: "General-purpose biasing resistor used for transistor base current limiting and optocoupler circuits (Color bands: Brown-Black-Red-Gold).",
    lessons: [10],
    badge: "Bias Resistor",
    color: "#975A16",
    specs: {
      resistance: "1,000 Ω (1 kΩ) ±5%",
      powerRating: "0.25 W",
      colorCode: "Brown - Black - Red - Gold"
    }
  },
  {
    id: "resistor-10k",
    name: "10 kΩ Resistor",
    category: "Resistors & Controls",
    icon: "minus",
    operatingVoltage: "250V max (1/4 Watt)",
    pins: "2 Axial Leads",
    description: "Pull-up / pull-down resistor and voltage divider reference paired with photoresistors (LDR) and force sensors (FSR). (Color bands: Brown-Black-Orange-Gold).",
    lessons: [6, 15],
    badge: "Divider Resistor",
    color: "#DD6B20",
    specs: {
      resistance: "10,000 Ω (10 kΩ) ±5%",
      powerRating: "0.25 W",
      colorCode: "Brown - Black - Orange - Gold"
    }
  },
  {
    id: "potentiometer-10k",
    name: "10 kΩ Linear Potentiometer",
    category: "Resistors & Controls",
    icon: "circle-dot",
    operatingVoltage: "0 – 5V DC analog sweep",
    pins: "3 Pins (Leg 1: 5V, Leg 2: Wiper, Leg 3: GND)",
    description: "Three-terminal rotary variable resistor forming an adjustable voltage divider. Turning the dial sweeps wiper voltage between 0V (GND) and 5V (VCC), read by ADC on A0.",
    lessons: [4],
    badge: "Spotlight #knob",
    color: "#3182CE",
    specs: {
      resistance: "10 kΩ linear taper (B10K)",
      rotationAngle: "300° mechanical sweep",
      wiperVoltage: "0.0 V to 5.0 V DC",
      powerRating: "0.1 W"
    }
  },
  {
    id: "tactile-button-12mm",
    name: "12 mm Tactile Push Button",
    category: "Resistors & Controls",
    icon: "toggle-left",
    operatingVoltage: "12V DC / 50mA max",
    pins: "4 Pins (2 paired internal contacts)",
    description: "Momentary normally-open tactile pushbutton. Paired with internal INPUT_PULLUP on D2; pressing shorts pin directly to GND, registering LOW state.",
    lessons: [3],
    badge: "Digital Input",
    color: "#4A5568",
    specs: {
      contactRating: "50 mA @ 12V DC",
      actuationForce: "160 ± 50 gf",
      travel: "0.25 mm",
      type: "SPST Momentary NO"
    }
  },
  {
    id: "tactile-keys-array",
    name: "8× Tactile Key Matrix / Mini Buttons",
    category: "Resistors & Controls",
    icon: "layout-grid",
    operatingVoltage: "5V DC",
    pins: "8 Signal Pins (D2–D9) + Common GND",
    description: "Array of 8 tactile push buttons mapped to musical notes C4 through C5 (261 Hz to 523 Hz), activating frequencies on the passive piezo buzzer.",
    lessons: [9],
    badge: "Piano Keyboard",
    color: "#805AD5",
    specs: {
      keysCount: 8,
      notesMapped: "C4 (262Hz), D4 (294Hz), E4 (330Hz), F4 (349Hz), G4 (392Hz), A4 (440Hz), B4 (494Hz), C5 (523Hz)",
      pinsUsed: "D2, D3, D4, D5, D6, D7, D8, D9"
    }
  },

  // 3. Sensors & Analog Inputs
  {
    id: "hcsr04-ultrasonic",
    name: "HC-SR04 Ultrasonic Distance Sensor",
    category: "Sensors & Analog Inputs",
    icon: "radio",
    operatingVoltage: "5V DC (< 15mA)",
    pins: "4 Pins (VCC, TRIG, ECHO, GND)",
    description: "Non-contact sonar ranging module with dual 40 kHz transducers. Emits 8-cycle sonic burst on 10µs TRIG pulse; ECHO pulse duration / 58 yields distance in centimeters.",
    lessons: [7, 16],
    badge: "Sonar Ranging",
    color: "#319795",
    specs: {
      range: "2 cm to 400 cm (accuracy ±3 mm)",
      measuringAngle: "15 degrees",
      triggerInput: "10 µs TTL pulse",
      formula: "Distance (cm) = pulseIn(ECHO, HIGH) / 58"
    }
  },
  {
    id: "tmp36-temp-sensor",
    name: "TMP36 Precision Temperature Sensor",
    category: "Sensors & Analog Inputs",
    icon: "thermometer",
    operatingVoltage: "2.7V to 5.5V DC",
    pins: "3 Pins (TO-92: Pin 1: 5V, Pin 2: Vout, Pin 3: GND)",
    description: "Linear analog temperature sensor providing calibrated voltage output directly proportional to Celsius: 500 mV at 0°C with 10 mV/°C scale factor. No calibration needed.",
    lessons: [11],
    badge: "Analog Temp",
    color: "#D69E2E",
    specs: {
      range: "-40°C to +125°C",
      outputScaling: "10 mV per °C (500 mV offset at 0°C)",
      formula: "Temp (°C) = ((voltage - 0.5) * 100)",
      accuracy: "±1°C at 25°C"
    }
  },
  {
    id: "gl5528-ldr",
    name: "GL5528 LDR Photoresistor",
    category: "Sensors & Analog Inputs",
    icon: "sun",
    operatingVoltage: "Up to 150V DC",
    pins: "2 Wire Leads",
    description: "Cadmium Sulfide (CdS) photoconductive cell. Internal resistance drops exponentially as ambient illumination increases (~10-20 kΩ in bright daylight, >1 MΩ in complete darkness).",
    lessons: [6],
    badge: "Light Sensor",
    color: "#ECC94B",
    specs: {
      lightResistance: "10 – 20 kΩ @ 10 Lux",
      darkResistance: "1.0 MΩ min @ 0 Lux",
      peakSpectralResponse: "540 nm (Green-Yellow visible band)",
      responseTime: "20-30 ms"
    }
  },
  {
    id: "capacitive-soil-moisture",
    name: "Capacitive Soil Moisture Sensor v1.2",
    category: "Sensors & Analog Inputs",
    icon: "droplet",
    operatingVoltage: "3.3V to 5.5V DC",
    pins: "3 Pins (VCC, AOUT, GND)",
    description: "Corrosion-resistant capacitive moisture probe using onboard 555 timer oscillator circuit to measure dielectric permittivity of soil. Outputs 1.2V (wet) to 2.8V (dry).",
    lessons: [14],
    badge: "Soil Probe",
    color: "#38A169",
    specs: {
      operatingPrinciple: "Capacitive reactance (No exposed metal electrodes)",
      dryReading: "~2.8 V (approx 580 on 10-bit ADC)",
      wetReading: "~1.2 V (approx 250 on 10-bit ADC)",
      lifespan: "10x longer than resistive probes"
    }
  },
  {
    id: "fsr-402-force",
    name: "FSR 402 Force Sensing Resistor",
    category: "Sensors & Analog Inputs",
    icon: "hand-metal",
    operatingVoltage: "Up to 5V DC",
    pins: "2 Flexible Solderable Tabs",
    description: "Polymer thick film (PTF) sensor exhibiting a decrease in electrical resistance with applied mechanical pressure over its 18 mm active diameter pad (0.1 N to 10 N).",
    lessons: [15],
    badge: "Force Sensor",
    color: "#E53E3E",
    specs: {
      activeArea: "18 mm (0.75 in) diameter",
      forceSensitivityRange: "0.1 N to 10 N (~10g to 1kg force)",
      resistanceRange: "> 10 MΩ (unloaded) down to ~200 Ω (full squeeze)",
      repeatability: "±2%"
    }
  },

  // 4. Displays, Audio & LEDs
  {
    id: "led-5mm-red",
    name: "5 mm Red Diffused LED",
    category: "Displays, Audio & LEDs",
    icon: "lightbulb",
    operatingVoltage: "1.8V – 2.2V DC (20mA)",
    pins: "2 Leads (Anode long +, Cathode short -)",
    description: "Solid-state semiconductor light-emitting diode. Requires 220 Ω resistor in series with Arduino digital pin (D13 or PWM ~9) to limit forward current to safe levels.",
    lessons: [2, 4, 16],
    badge: "Indicator",
    color: "#E53E3E",
    specs: {
      wavelength: "625 nm (Red)",
      luminousIntensity: "80-120 mcd",
      forwardVoltage: "2.0 V nominal",
      maxCurrent: "20 mA continuous"
    }
  },
  {
    id: "led-rgb-cc",
    name: "5 mm Common-Cathode RGB LED",
    category: "Displays, Audio & LEDs",
    icon: "sparkles",
    operatingVoltage: "2.0V (R), 3.2V (G, B)",
    pins: "4 Pins (Red, Longest Cathode GND, Green, Blue)",
    description: "Integrated triple-die LED packaging Red, Green, and Blue crystals with a common ground cathode pin. Connected to 3 PWM pins (~9, ~10, ~11) for 16.7M color blending.",
    lessons: [5],
    badge: "Color Mixer",
    color: "#9F7AEA",
    specs: {
      channels: "Red (~D9), Green (~D10), Blue (~D11)",
      commonPin: "Cathode (-) connected to GND",
      pwmDutyCycles: "analogWrite 0-255 per channel",
      seriesResistors: "3× 220 Ω required"
    }
  },
  {
    id: "traffic-light-module",
    name: "Traffic Light LED Module",
    category: "Displays, Audio & LEDs",
    icon: "stop-circle",
    operatingVoltage: "5V DC (Built-in resistors)",
    pins: "4 Pins (R, Y, G, GND)",
    description: "Integrated mini PCB with three 8 mm LEDs in standard vertical traffic signal arrangement (Red, Yellow, Green). Direct interface to digital pins D4, D3, D2.",
    lessons: [16],
    badge: "Stoplight Module",
    color: "#DD6B20",
    specs: {
      ledSizes: "8 mm diameter high-brightness LEDs",
      pinout: "R (Pin 4), Y (Pin 3), G (Pin 2), GND",
      internalResistors: "Pre-installed 330 Ω SMD resistors"
    }
  },
  {
    id: "oled-ssd1306",
    name: "0.96″ I2C OLED Display (SSD1306)",
    category: "Displays, Audio & LEDs",
    icon: "monitor",
    operatingVoltage: "3.3V – 5.0V DC",
    pins: "4 Pins (GND, VCC, SCL [A5], SDA [A4])",
    description: "Ultra-sharp 128×64 dot matrix organic LED display controlled via Two-Wire Interface (I2C) hardware bus on Arduino Uno pins A4 (SDA) and A5 (SCL).",
    lessons: [14],
    badge: "OLED Screen",
    color: "#4299E1",
    specs: {
      resolution: "128 × 64 pixels",
      driverIC: "SSD1306",
      interface: "I2C (Default address 0x3C)",
      powerConsumption: "0.08 W full screen illuminated"
    }
  },
  {
    id: "piezo-buzzer-12mm",
    name: "12 mm Passive Piezo Buzzer",
    category: "Displays, Audio & LEDs",
    icon: "volume-2",
    operatingVoltage: "3V – 12V P-P AC square wave",
    pins: "2 Pins (Positive +, Negative - / GND)",
    description: "Passive piezoelectric acoustic sounder. Oscillates at commanded frequencies using Arduino `tone(pin, freq)` function to generate musical notes and warning beeps.",
    lessons: [8, 9],
    badge: "Audio Sounder",
    color: "#4A5568",
    specs: {
      type: "Passive (Requires external AC frequency pulse)",
      frequencyRange: "100 Hz to 10,000 Hz",
      resonantFreq: "2,048 Hz",
      soundPressure: "85 dB at 10 cm"
    }
  },

  // 5. Motors & Power Drivers
  {
    id: "sg90-servo",
    name: "SG90 9g Micro Servo Motor",
    category: "Motors & Power Drivers",
    icon: "compass",
    operatingVoltage: "4.8V – 6.0V DC",
    pins: "3-Wire Lead (Brown: GND, Red: 5V, Orange: Signal ~9)",
    description: "Position-controlled gearhead motor with built-in closed-loop potentiometer feedback. Takes 50 Hz PWM pulse (1.0ms = 0°, 1.5ms = 90°, 2.0ms = 180°) via `<Servo.h>`.",
    lessons: [12],
    badge: "Servo Actuator",
    color: "#3182CE",
    specs: {
      weight: "9 grams",
      torque: "1.8 kg-cm @ 4.8V",
      operatingSpeed: "0.10 sec / 60 degrees",
      sweepAngle: "0° to 180°"
    }
  },
  {
    id: "stepper-28byj48-uln2003",
    name: "28BYJ-48 Stepper Motor + ULN2003 Driver",
    category: "Motors & Power Drivers",
    icon: "cog",
    operatingVoltage: "5V DC",
    pins: "Driver: 4 Logic Pins (IN1-IN4 / D3, D4) + VCC, GND",
    description: "Unipolar 4-phase geared stepper motor with Darlington transistor array driver board. Provides 2048 discrete steps per full 360° output shaft revolution.",
    lessons: [13],
    badge: "Precision Stepper",
    color: "#4FD1C5",
    specs: {
      gearReductionRatio: "1/64",
      stepAngle: "5.625° / 64 = approx 0.087° per step",
      stepsPerRevolution: "2048 steps (half-step mode) or 4096 (microstep)",
      driverBoard: "ULN2003 high-voltage high-current Darlington array"
    }
  },
  {
    id: "dc-motor-3v-fan",
    name: "3–6 V DC Motor with Fan Blade",
    category: "Motors & Power Drivers",
    icon: "fan",
    operatingVoltage: "3V – 6V DC (200-500 mA load)",
    pins: "2 Solder Terminals (+ and -)",
    description: "Brushed DC hobby motor fitted with propeller fan. Requires TIP120 transistor or MOSFET driver because motor draws more current (200mA+) than Uno pins can supply (20mA).",
    lessons: [10],
    badge: "DC Motor",
    color: "#E2E8F0",
    specs: {
      noLoadSpeed: "9,000 RPM @ 3V, 15,000 RPM @ 6V",
      stallCurrent: "800 mA",
      speedControl: "PWM duty cycle (0-255) via transistor gate/base"
    }
  },
  {
    id: "tip120-darlington",
    name: "TIP120 NPN Darlington Transistor",
    category: "Motors & Power Drivers",
    icon: "zap",
    operatingVoltage: "60V Collector-Emitter (5A continuous)",
    pins: "3 Pins (TO-220: Pin 1: Base, Pin 2: Collector, Pin 3: Emitter)",
    description: "High-gain power Darlington transistor acting as an electronic switch. Lets low-power Arduino PWM pin (~9) safely control high-current DC motors, solenoids, or lamps.",
    lessons: [10],
    badge: "Power Switch",
    color: "#2D3748",
    specs: {
      dcCurrentGain: "hFE = 1000 min @ 3A",
      collectorCurrent: "5 A continuous, 8 A peak",
      baseControlPin: "Arduino D9 via 1 kΩ series resistor",
      mounting: "TO-220 with metal heat-sink tab"
    }
  },
  {
    id: "flyback-diode-1n4007",
    name: "1N4007 Flyback / Snubber Diode",
    category: "Motors & Power Drivers",
    icon: "shield",
    operatingVoltage: "1000V Peak Reverse Voltage (1A)",
    pins: "2 Axial Leads (Anode, Cathode with white band)",
    description: "Protective clamping diode connected reverse-biased across inductive DC motor coil terminals to safely absorb and dissipate high-voltage back-EMF spikes.",
    lessons: [10],
    badge: "Circuit Protection",
    color: "#1A202C",
    specs: {
      reverseVoltage: "1,000 V max",
      forwardContinuousCurrent: "1.0 A",
      function: "Back-EMF inductive suppression"
    }
  }
];

// Helper functions for components
function getComponentById(id) {
  return HARDWARE_COMPONENTS.find(c => c.id === id);
}

function getComponentsByCategory(cat) {
  return HARDWARE_COMPONENTS.filter(c => c.category === cat);
}

