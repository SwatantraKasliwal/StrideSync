# HC-05 Bluetooth Module Troubleshooting Guide

## 🔍 Is Your HC-05 Working? Diagnostic Checklist

### 1. **Visual Inspection - LED Status**

Check the LED on your HC-05 module:

- **Fast Blinking (2 times/second)** ✅ = Module is powered and discoverable
- **Slow Blinking (once every 2 seconds)** = Paired but not connected
- **Solid ON** = Connected to a device
- **No Light** ❌ = Power issue or module failure

### 2. **Power Supply Check**

- **HC-05 VCC**: Connect to Arduino **5V** (most common) or 3.3V (check your module)
- **HC-05 GND**: Connect to Arduino **GND**
- Measure voltage: Should be 4.8-5.2V on VCC pin with multimeter

### 3. **Wiring Verification**

```
HC-05 Pin    →    Arduino Pin
VCC          →    5V
GND          →    GND
TXD          →    Pin 2 (Arduino RX)
RXD          →    Pin 3 (Arduino TX)
```

**⚠️ CRITICAL**: Disconnect TX/RX wires during code upload!

### 4. **Android Bluetooth Scanning Issues**

#### Common Reasons HC-05 Doesn't Appear:

1. **Wrong Tab Selected**:

   - HC-05 is **Bluetooth Classic**, NOT Bluetooth LE
   - Switch to "Bluetooth Classic" tab in your scanner app

2. **Already Paired**:

   - Check Android Settings → Bluetooth → Paired Devices
   - If "HC-05" is already there, unpair it first

3. **Module Not in Discoverable Mode**:

   - HC-05 should be fast blinking (not connected)
   - Power cycle the Arduino to reset HC-05

4. **App Limitations**:
   - Try different Android apps:
     - "Serial Bluetooth Terminal" (recommended)
     - "Bluetooth Scanner"
     - Android Settings → Bluetooth

### 5. **Testing Steps**

#### Step 1: Upload Basic Test Code

1. Download `hc05-basic-test.ino`
2. **Disconnect HC-05 TX and RX wires**
3. Upload the code to Arduino
4. **Reconnect HC-05 TX and RX wires**
5. Open Serial Monitor (9600 baud)

#### Step 2: Check Serial Monitor Output

You should see:

```
=== HC-05 Basic Test ===
🔍 Checking HC-05 Module...
✅ Sent initial test message to HC-05
📡 Beacon sent: 3 seconds uptime
📡 Beacon sent: 6 seconds uptime
...
```

#### Step 3: Android Scanning

1. Open "Serial Bluetooth Terminal" app
2. Tap "Devices" → "Bluetooth Classic"
3. Tap "Scan" or refresh
4. Look for device named:
   - **HC-05** (most common)
   - **HC-06**
   - **Unknown device** with MAC address

### 6. **Alternative Testing Methods**

#### Method 1: Direct AT Commands

```arduino
// Send AT commands to HC-05 (requires EN pin connection)
bluetooth.println("AT");
delay(1000);
bluetooth.println("AT+NAME?");  // Check device name
delay(1000);
bluetooth.println("AT+ADDR?");  // Check MAC address
```

#### Method 2: Computer Bluetooth

- Check if HC-05 appears on Windows/Mac Bluetooth settings
- Easier to verify basic functionality

#### Method 3: Another Arduino

- Use second Arduino with same test code
- See if they can communicate with each other

### 7. **Hardware Troubleshooting**

#### Check These Common Issues:

- **Loose Connections**: Wiggle wires, ensure firm contact
- **Wrong Voltage**: Some HC-05 need 3.3V, others need 5V
- **Damaged Module**: Try different HC-05 if available
- **Arduino Power**: Ensure Arduino has enough power (USB or external)

#### Advanced Testing:

```bash
# Check wiring with multimeter
# Measure continuity between:
- Arduino Pin 2 ↔ HC-05 TXD
- Arduino Pin 3 ↔ HC-05 RXD
- Arduino 5V ↔ HC-05 VCC
- Arduino GND ↔ HC-05 GND
```

### 8. **Android App Recommendations**

1. **Serial Bluetooth Terminal** ⭐⭐⭐⭐⭐

   - Best for testing HC-05
   - Clear Classic/LE separation
   - Terminal interface for commands

2. **Bluetooth Scanner**

   - Good for discovering devices
   - Shows detailed device info

3. **Android Settings → Bluetooth**
   - Most reliable for basic discovery
   - Built-in pairing process

### 9. **Expected Results**

#### If HC-05 is Working:

- LED should be fast blinking
- Serial Monitor shows beacon messages
- Android finds device named "HC-05"
- Can pair successfully (default PIN: 1234 or 0000)

#### If HC-05 Not Working:

- No LED activity = Power issue
- LED solid but no Android discovery = Bluetooth Classic vs LE confusion
- Found but can't pair = PIN issue or module fault

### 10. **Next Steps After Verification**

Once HC-05 is discovered on Android:

1. Pair with device (PIN: 1234)
2. Test sending commands: "ON", "OFF", "STATUS"
3. Upload enhanced debug code for StrideSync integration
4. Test with StrideSync web app

---

**💡 Pro Tip**: If nothing works, try different power source (external 5V), different Arduino, or different HC-05 module. Sometimes hardware fails!
