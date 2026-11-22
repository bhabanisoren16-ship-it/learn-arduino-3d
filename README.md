# Learn Arduino 3D: Website & Simulator

An interactive 3D browser-based hardware electronics workbench, simulator, and curriculum for the **Arduino Uno R3 (ATmega328P)** microcontroller, based on the **Learn Arduino 3D Website & Simulator Guide** (`Learn_Arduino_3D_Website_Guide.pdf`).

---

## 🌟 Key Features

### 1. 3D Viewport & 2D Schematic Toggle
- **Interactive 3D Arduino Uno R3**: ATmega328P DIP package, USB Type-B port, DC barrel jack, 16 MHz crystal oscillator, reset button, pin headers (`5V`, `3.3V`, `GND`, `VIN`, `D0–D13`, `A0–A5`), and active LEDs (`ON`, `L` Pin 13, `TX`, `RX`).
- **Solderless Breadboard**: Full-size breadboard with power rails and component tie points.
- **2D Circuit Schematic**: Instant toggle to standard electronic schematic diagrams with color-coded signal nets and component symbols.
- **Camera Navigation**:
  - **Orbit**: Mouse Left Drag or **Q** / **E** keys
  - **Pan**: Mouse Right Drag or **W**, **A**, **S**, **D** keys
  - **Zoom**: Mouse Scroll Wheel

### 2. Hand-Tool Breadboard Studio & Jumper-Wire Routing
- **Hand Move Tool (Mode 1)**: Inspect and reposition breadboard modules.
- **Wire Connect Tool (Mode 2)**: Route color-coded jumper wires between Uno headers and breadboard components. Supports 7 standard jumper wire colors:
  - 🔴 **Red**: `+5.0V` Power Rail
  - ⚫ **Black**: `GND` Common Ground
  - 🔵 **Blue**: PWM Output (`~D9`)
  - 🟡 **Amber**: Analog Input / Wiper (`A0`)
  - 🟢 **Green**: Logic / I2C Bus (`A4`/`A5`)
  - 🟠 **Orange**: Ultrasonic / Servo Pulse
  - 🟣 **Purple**: Audio Frequency Tone Output
- **Wire Cutter & Unplug (Mode 3)**: Snip misplaced wires or clear all connections with 1-click.
- **Auto-Wire Preset**: Instantly loads verified jumper connections for any lesson.
- **Netlist Circuit Verification**: Automatically compares your wiring against the lesson netlist with step-by-step diagnostic feedback.

### 3. 4-Tab Hardware Inspector
- **Overview Tab**: Core electronic concept, physics principles, and mathematical formulas (e.g. ADC-to-PWM scaling, time-of-flight ultrasound, Ohm's law).
- **Pinout Tab**: Comprehensive pin mapping table specifying voltages, logic levels, and signal roles.
- **Example Tab**: Production-verified Arduino C++ sketch with 1-click "Load in Editor" and "Copy Code".
- **Specifications Tab**: Electrical ratings, tolerances, clock speed, memory limits, and operating thresholds.

### 4. Try It Yourself In-Browser Runtime & Virtual Simulator
- **In-Browser C++ Code Editor**: Write and edit Arduino C++ sketches with line numbers, indentation, code reset, and **Export `.ino`** for the Arduino IDE.
- **Live Hardware Sensor Sliders**:
  - 10 kΩ Potentiometer rotary dial (`0–1023` ADC counts / `0–5.0V`)
  - Tactile Pushbutton momentary press (`D2 INPUT_PULLUP`)
  - Ultrasonic Sonar Distance slider (`2 cm – 400 cm`)
  - GL5528 LDR Ambient Light sensor slider (`Lux`)
  - TMP36 Temperature slider (`-40 °C to +125 °C`)
  - Capacitive Soil Moisture slider (`0% – 100%`)
  - FSR 402 Force Pad pressure slider (`0 N – 10 N`)
  - C4–C5 8-Key Musical Piano keys
- **Real-Time Serial Monitor**: 9600 baud UART telemetry log with auto-scroll, clear log, and interactive serial command prompt.
- **Web Audio API Acoustic Synthesizer**: Realistic square-wave audio tones for the passive piezo buzzer (`tone()` / `noTone()`) and mini piano keys, with sound mute/unmute toggle.

---

## 📚 16-Lesson Complete Curriculum

| # | Lesson Title | Hardware Components | Pin Mapping | Core Principle & C++ API |
|---|---|---|---|---|
| **1** | **Meet the Board** | Uno R3, USB cable | `D13`, `USB`, `GND` | Board layout, `setup()`, `loop()`, `Serial.println()` |
| **2** | **Blink an LED** | 5mm LED, 220 Ω resistor | `D13`, `GND` | Digital output, `digitalWrite()`, `delay()` |
| **3** | **Push a Button** | Tactile button switch | `D2`, `D13`, `GND` | Internal pull-up `INPUT_PULLUP`, active-LOW logic |
| **4** | **Turn a Knob (#knob)** | 10 kΩ potentiometer, LED, 220 Ω | `A0`, `~D9`, `5V`, `GND` | **Spotlight Lab**: 10-bit ADC to 8-bit PWM mapping (`bright = raw / 4`) |
| **5** | **Mix Colours** | Common-cathode RGB LED, 3× 220 Ω | `~D9`, `~D10`, `~D11`, `GND` | Tri-color PWM blending (16.7M colors) |
| **6** | **Sense Light** | GL5528 LDR, 10 kΩ resistor, LED | `A0`, `D13`, `5V`, `GND` | Photoresistor voltage divider, automatic night light |
| **7** | **Read a Sensor** | HC-SR04 ultrasonic distance sensor | `D9` (TRIG), `D10` (ECHO) | 40 kHz sonar echolocation, `pulseIn() / 58` |
| **8** | **Make a Sound** | 12 mm passive piezo buzzer | `D8`, `GND` | Hardware timer square-wave synthesis, `tone(8, 440)` |
| **9** | **Mini Piano** | 8× tactile keys (C4–C5), buzzer | `D2–D9`, `D10`, `GND` | Button matrix scanning & musical frequency scale |
| **10** | **Control a Motor** | 3–6V DC motor, TIP120, 1N4007 | `~D9`, `GND` | High-current Darlington transistor switch & flyback diode |
| **11** | **Sense Heat** | TMP36 precision temperature sensor | `A0`, `5V`, `GND` | `10 mV/°C` linear output, Celsius calculation |
| **12** | **Sweep a Servo** | SG90 9g micro servo motor | `~D9`, `5V`, `GND` | `<Servo.h>`, 50 Hz pulse-position 0°–180° sweep |
| **13** | **Spin the Wheel** | 28BYJ-48 stepper + ULN2003 driver | `D3`, `D4`, `5V`, `GND` | Discrete micro-stepping (2048 steps per turn) |
| **14** | **Smart Plant** | Capacitive soil moisture, OLED | `A0`, `A4/A5` (I2C) | Dielectric permittivity soil water measurement |
| **15** | **Feel the Force** | FSR 402 force pad, 10 kΩ resistor | `A0`, `~D9`, `5V`, `GND` | Polymer thick film tactile force mapping |
| **16** | **Build a Project** | HC-SR04 + Traffic Light Module | `D9/D10`, `D4/D3/D2`, `D8` | **Capstone Project**: Sonar obstacle radar + Red/Yellow/Green traffic signal |

---

## 🧰 PromptShipped 24-Part Hardware Bill of Materials (BOM)
The application includes a searchable, categorized hardware catalog of all 24 components across 5 categories:
1. **Core Board & Prototyping**: Arduino Uno R3, 830-tie breadboard, 7-color jumper set, USB-A/B cable.
2. **Resistors & Controls**: 220 Ω, 1 kΩ, 10 kΩ resistors, 10 kΩ linear potentiometer, 12 mm & 6 mm tactile buttons, 8-key matrix.
3. **Sensors & Analog Inputs**: HC-SR04 ultrasonic, TMP36 temperature, GL5528 photoresistor, capacitive soil moisture v1.2, FSR 402 force pad.
4. **Displays, Audio & LEDs**: 5 mm diffused LEDs, common-cathode RGB LED, traffic light module, 0.96″ SSD1306 OLED, 12 mm passive buzzer.
5. **Motors & Power Drivers**: SG90 servo, 28BYJ-48 stepper + ULN2003, 3–6V DC motor + fan, TIP120 Darlington transistor, 1N4007 flyback diode.

---

## 🚀 Running the Website

### Method 1: Local Server (Recommended)
Run with Node.js:
```bash
node server.js
```
Then open your browser at:
```
http://localhost:3000/#knob
```

### Method 2: Direct File Open
Double click `index.html` in file explorer to open directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

