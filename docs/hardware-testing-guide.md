# StrideSync Hardware Testing & Customization Guide

## Hardware Testing Steps

### 1. HC-05 Connection Test

**Step 1: Upload the HC-05 Test Code**

1. Open `hc05-test.ino` in Arduino IDE
2. Upload to your Arduino
3. Open Serial Monitor (9600 baud rate)
4. You should see: "HC-05 Test Started" and "Bluetooth initialized"

**Step 2: Pair with HC-05**

1. On your phone, go to Bluetooth settings
2. Look for a device named "HC-05" or similar
3. Pair with it (default PIN: 1234 or 0000)
4. Use a Bluetooth terminal app to connect

**Step 3: Test Communication**

- Send "Hello" from your phone → Arduino should receive it
- Type in Serial Monitor → HC-05 should send to phone
- Look for heartbeat messages every 5 seconds

### 2. Hardware Wiring Verification

**HC-05 Bluetooth Module:**

```
HC-05 VCC  → Arduino 3.3V (NOT 5V!)
HC-05 GND  → Arduino GND
HC-05 TXD  → Arduino Pin 2 (RX)
HC-05 RXD  → Arduino Pin 3 (TX)
```

**Sensors (as per your Arduino code):**

```
Buzzer        → Arduino Pin 4
Ultrasonic VCC → Arduino 5V
Ultrasonic GND → Arduino GND
Ultrasonic Trig → Arduino Pin 9
Ultrasonic Echo → Arduino Pin 10
Piezo Sensor   → Arduino Pin A0
Accelerometer  → Arduino Pin A1
```

### 3. Component Testing

**Test Buzzer:**

```cpp
// Add to loop() for testing
digitalWrite(4, HIGH);
delay(500);
digitalWrite(4, LOW);
delay(500);
```

**Test Ultrasonic Sensor:**

```cpp
// Check Serial Monitor for distance readings
float distance = readDistance();
Serial.print("Distance: ");
Serial.println(distance);
```

## Code Customization Guide

### 1. Adjust Step Detection Sensitivity

In `arduino-example.ino`, modify these values:

```cpp
const int STEP_THRESHOLD = 500;        // Increase = less sensitive, Decrease = more sensitive
const unsigned long STEP_COOLDOWN = 200; // Increase = slower step detection
```

**Finding the right threshold:**

1. Add this to `readStepSensor()` function:

```cpp
Serial.print("Accelerometer reading: ");
Serial.println(accelerometerValue);
```

2. Walk around and note the values
3. Set threshold to 50-100 above baseline

### 2. Customize Buzzer Behavior

**Current behavior:** Buzzer activates when:

- Object within 30cm OR
- App sends "ON" command

**To change distance threshold:**

```cpp
const float DISTANCE_THRESHOLD = 20.0; // Change from 30.0 to 20.0 cm
```

**To add beeping pattern:**

```cpp
void controlBuzzer(float distance) {
    bool shouldBuzz = false;

    if (distance > 0 && distance < DISTANCE_THRESHOLD) {
        shouldBuzz = true;
    }
    if (buzzerState) {
        shouldBuzz = true;
    }

    if (shouldBuzz) {
        // Create beeping pattern instead of constant sound
        if ((millis() / 300) % 2 == 0) {
            digitalWrite(BUZZER_PIN, HIGH);
        } else {
            digitalWrite(BUZZER_PIN, LOW);
        }
    } else {
        digitalWrite(BUZZER_PIN, LOW);
    }
}
```

### 3. Enhance Power Generation Calculation

Replace the simple voltage reading with more realistic power calculation:

```cpp
void readPiezoSensor() {
    int piezoReading = analogRead(PIEZO_PIN);
    float piezoVoltage = (piezoReading / 1024.0) * 5.0;

    // More realistic power calculation
    if (piezoVoltage > 0.1) { // Only calculate power if significant voltage
        float current = piezoVoltage / 1000.0; // Assume 1k ohm load
        powerGenerated = piezoVoltage * current * 1000000; // Convert to microwatts
    } else {
        powerGenerated = 0;
    }
}
```

### 4. Add Data Filtering

To smooth out noisy sensor readings:

```cpp
// Add these variables at the top
float stepReadingBuffer[5] = {0, 0, 0, 0, 0};
int bufferIndex = 0;

// In readStepSensor():
void readStepSensor() {
    int rawReading = analogRead(STEP_SENSOR_PIN);

    // Add to circular buffer
    stepReadingBuffer[bufferIndex] = rawReading;
    bufferIndex = (bufferIndex + 1) % 5;

    // Calculate average
    float average = 0;
    for (int i = 0; i < 5; i++) {
        average += stepReadingBuffer[i];
    }
    average /= 5;

    // Use average for step detection
    unsigned long currentTime = millis();
    if (average > STEP_THRESHOLD && (currentTime - lastStepTime) > STEP_COOLDOWN) {
        stepCount++;
        lastStepTime = currentTime;
        Serial.print("Step detected! Total: ");
        Serial.println(stepCount);
    }
}
```

## Web Application Compatibility

**Your current web app WILL detect the HC-05** because:

1. ✅ It has HC-05 specific UUIDs:

```typescript
private readonly HC05_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
private readonly HC05_DATA_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
```

2. ✅ It expects data in the format your Arduino sends:

```typescript
// Arduino sends: "123,45.67" (steps,power)
// App expects: StrideData with steps and power
```

3. ✅ It can send commands your Arduino understands:

```typescript
// App can send: "ON", "OFF", "RESET", "STATUS"
// Arduino handles these exact commands
```

## Testing Your Complete System

### 1. Hardware Test Sequence

1. Upload `hc05-test.ino` → Verify HC-05 connection
2. Upload `arduino-example.ino` → Test full system
3. Open Serial Monitor → Verify sensor readings
4. Test each sensor individually

### 2. Web App Integration Test

1. Open your StrideSync web application
2. Click "Scan for Devices"
3. Select your HC-05 device (should appear as "HC-05" or similar)
4. Connect → Should show "Connected" status
5. Check dashboard for real-time data updates

### 3. Functionality Verification

- ✅ Step counting (walk around, verify count increases)
- ✅ Power generation (tap piezo sensor, verify voltage changes)
- ✅ Proximity detection (place object near ultrasonic sensor)
- ✅ Remote buzzer control (use app to turn buzzer ON/OFF)
- ✅ Data transmission (verify data appears in web app)

## Troubleshooting

**HC-05 not appearing in scan:**

- Check wiring (especially VCC to 3.3V, not 5V)
- Try different baud rates (9600, 38400, 115200)
- Ensure HC-05 is in pairing mode (LED blinking)

**No step detection:**

- Monitor accelerometer values in Serial Monitor
- Adjust STEP_THRESHOLD based on readings
- Check accelerometer wiring and power

**Web app not receiving data:**

- Verify data format matches expected format
- Check Bluetooth characteristic UUIDs
- Monitor Serial output for transmission confirmation

**Erratic sensor readings:**

- Add filtering/smoothing algorithms
- Check for loose connections
- Add capacitors for power supply smoothing
