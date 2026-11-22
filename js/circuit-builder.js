// Hand-Tool Breadboard Studio & Netlist Verification Engine
// Implements Hand Move Tool, Wire Connect Tool (7 Colors), Wire Cutter, and Netlist Verification

class CircuitBuilder {
  constructor(workbench) {
    this.workbench = workbench;
    this.activeTool = 'move'; // 'move', 'wire', 'cutter'
    this.selectedWireColor = 'red';
    this.activeLesson = null;
    this.userWires = [];
    this.pendingPin = null;

    this.availableColors = [
      { id: 'red', name: 'Red (5V Power)', hex: '#9e1a1a' },
      { id: 'black', name: 'Black (GND Ground)', hex: '#06080e' },
      { id: 'blue', name: 'Blue (PWM Signal)', hex: '#1d4ed8' },
      { id: 'amber', name: 'Amber (Analog / Wiper)', hex: '#c67d0a' },
      { id: 'green', name: 'Green (Logic / I2C)', hex: '#156d35' },
      { id: 'orange', name: 'Orange (Servo / Sonar)', hex: '#c2410c' },
      { id: 'purple', name: 'Purple (Tone / Audio)', hex: '#581c87' }
    ];

    // Terminal Pin Definitions for interactive picking & UI lists
    this.unoTerminals = [
      { id: 'Uno.5V', label: '5V (Power)', group: 'power' },
      { id: 'Uno.3.3V', label: '3.3V (Power)', group: 'power' },
      { id: 'Uno.GND', label: 'GND (Ground)', group: 'power' },
      { id: 'Uno.VIN', label: 'VIN (Raw Power)', group: 'power' },
      { id: 'Uno.A0', label: 'A0 (Analog In)', group: 'analog' },
      { id: 'Uno.A1', label: 'A1 (Analog In)', group: 'analog' },
      { id: 'Uno.A2', label: 'A2 (Analog In)', group: 'analog' },
      { id: 'Uno.A3', label: 'A3 (Analog In)', group: 'analog' },
      { id: 'Uno.A4', label: 'A4 / SDA (I2C Data)', group: 'analog' },
      { id: 'Uno.A5', label: 'A5 / SCL (I2C Clock)', group: 'analog' },
      { id: 'Uno.D2', label: 'D2 (Digital)', group: 'digital' },
      { id: 'Uno.D3', label: '~D3 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D4', label: 'D4 (Digital)', group: 'digital' },
      { id: 'Uno.D5', label: '~D5 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D6', label: '~D6 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D7', label: 'D7 (Digital)', group: 'digital' },
      { id: 'Uno.D8', label: 'D8 (Digital)', group: 'digital' },
      { id: 'Uno.D9', label: '~D9 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D10', label: '~D10 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D11', label: '~D11 (PWM Digital)', group: 'digital' },
      { id: 'Uno.D12', label: 'D12 (Digital)', group: 'digital' },
      { id: 'Uno.D13', label: 'D13 (LED / Digital)', group: 'digital' }
    ];
  }

  setLesson(lesson) {
    this.activeLesson = lesson;
    this.pendingPin = null;
    // Default to lesson's preset wires so users start with a verified state
    this.loadPresetWires();
  }

  setTool(tool) {
    this.activeTool = tool;
    this.pendingPin = null;
    this.notifyUI();
  }

  setColor(color) {
    this.selectedWireColor = color;
    this.notifyUI();
  }

  // Handle pin click in Wire Connect mode
  handlePinClick(pinId) {
    if (this.activeTool !== 'wire') return;

    if (!this.pendingPin) {
      // First click: select starting pin
      this.pendingPin = pinId;
      this.notifyUI(`Selected start terminal: ${pinId}. Now click destination terminal.`);
    } else {
      // Second click: create connection
      if (this.pendingPin === pinId) {
        // Deselect if clicked same pin
        this.pendingPin = null;
        this.notifyUI('Selection cancelled.');
        return;
      }

      this.addWire(this.pendingPin, pinId, this.selectedWireColor);
      const msg = `Connected ${this.pendingPin} ➔ ${pinId} (${this.selectedWireColor})`;
      this.pendingPin = null;
      this.notifyUI(msg);
    }
  }

  addWire(from, to, color) {
    // Check if wire already exists
    const exists = this.userWires.some(w => 
      (w.from === from && w.to === to) || (w.from === to && w.to === from)
    );
    if (exists) {
      this.notifyUI(`Wire between ${from} and ${to} already exists.`);
      return;
    }

    const newWire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      from: from,
      to: to,
      color: color,
      label: `${from} ➔ ${to}`
    };

    this.userWires.push(newWire);
    this.syncWiresTo3D();
  }

  removeWire(wireId) {
    this.userWires = this.userWires.filter(w => w.id !== wireId);
    this.syncWiresTo3D();
    this.notifyUI('Wire snipped.');
  }

  clearAllWires() {
    this.userWires = [];
    this.pendingPin = null;
    this.syncWiresTo3D();
    this.notifyUI('All jumper wires removed from breadboard.');
  }

  loadPresetWires() {
    if (!this.activeLesson || !this.activeLesson.requiredNetlist) return;
    this.userWires = this.activeLesson.requiredNetlist.map((w, idx) => ({
      id: `preset_${idx}`,
      from: w.from,
      to: w.to,
      color: w.color,
      label: w.label || `${w.from} ➔ ${w.to}`
    }));
    this.syncWiresTo3D();
  }

  syncWiresTo3D() {
    if (this.workbench && typeof this.workbench.renderWires === 'function') {
      this.workbench.renderWires(this.userWires);
    }
  }

  // Circuit Verification against active lesson netlist
  verifyCircuit() {
    if (!this.activeLesson) {
      return { verified: false, message: "No active lesson loaded." };
    }

    const required = this.activeLesson.requiredNetlist || [];
    if (required.length === 0) {
      return {
        verified: true,
        message: "No external jumper wiring needed for this onboard lesson! Ready to run.",
        missing: [],
        connectedCount: this.userWires.length,
        requiredCount: 0
      };
    }

    const missing = [];
    let matchedCount = 0;

    required.forEach(req => {
      const isConnected = this.userWires.some(userWire => {
        const direct = (this.fuzzyMatchPin(userWire.from, req.from) && this.fuzzyMatchPin(userWire.to, req.to));
        const reverse = (this.fuzzyMatchPin(userWire.from, req.to) && this.fuzzyMatchPin(userWire.to, req.from));
        return direct || reverse;
      });

      if (isConnected) {
        matchedCount++;
      } else {
        missing.push(req);
      }
    });

    if (missing.length === 0) {
      return {
        verified: true,
        message: `Circuit 100% Verified! All ${required.length} jumper connections match lesson schematic.`,
        missing: [],
        connectedCount: this.userWires.length,
        requiredCount: required.length
      };
    } else {
      const firstMissing = missing[0];
      return {
        verified: false,
        message: `Circuit Incomplete (${matchedCount}/${required.length} wires connected). Missing: ${firstMissing.label || firstMissing.from + ' ➔ ' + firstMissing.to}`,
        missing: missing,
        connectedCount: matchedCount,
        requiredCount: required.length
      };
    }
  }

  fuzzyMatchPin(p1, p2) {
    if (p1 === p2) return true;
    const clean1 = p1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = p2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
    // Ground return aliases: Bridge_GND equates to Uno.GND / Pot_Leg3, Bridge_Cathode equates to LED_Cathode
    if ((clean1.includes('bridge') && clean2.includes('gnd')) || (clean2.includes('bridge') && clean1.includes('gnd'))) return true;
    if ((clean1.includes('bridge') && clean2.includes('cathode')) || (clean2.includes('bridge') && clean1.includes('cathode'))) return true;
    return false;
  }

  notifyUI(statusText) {
    const event = new CustomEvent('circuitUpdated', {
      detail: {
        activeTool: this.activeTool,
        selectedColor: this.selectedWireColor,
        wires: this.userWires,
        pendingPin: this.pendingPin,
        statusText: statusText
      }
    });
    window.dispatchEvent(event);
  }
}

window.CircuitBuilder = CircuitBuilder;

