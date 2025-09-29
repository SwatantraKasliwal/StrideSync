/*
 * StrideSync Smart Shoe - FINAL OPTIMIZED VERSION
 *
 * This is the clean, working version for HC-05 Bluetooth communication
 * with the StrideSync web application.
 *
 * WIRING:
 * HC-05 VCC -> Arduino 5V
 * HC-05 GND -> Arduino GND
 * HC-05 TXD -> Arduino Pin 2 (RX)
 * HC-05 RXD -> Arduino Pin 3 (TX)
 *
 * Buzzer + -> Arduino Pin 12
 * Buzzer - -> Arduino GND
 *
 * Ultrasonic Sensor:
 * VCC -> Arduino 5V
 * GND -> Arduino GND
 * Trig -> Arduino Pin 9
 * Echo -> Arduino Pin 8
 *
 * UPLOAD INSTRUCTIONS:
 * 1. DISCONNECT HC-05 TX/RX wires (pins 2&3) FIRST!
 * 2. Upload this code
 * 3. RECONNECT HC-05 TX/RX wires
 * 4. Open Serial Monitor (9600 baud)
 * 5. Test with web application
 */

#include <SoftwareSerial.h>

// Pin definitions
const int BUZZER_PIN = 12; // Updated buzzer pin
const int HC05_RX_PIN = 2; // HC-05 TXD connects here
const int HC05_TX_PIN = 3; // HC-05 RXD connects here
const int TRIG_PIN = 9;    // Ultrasonic sensor trigger
const int ECHO_PIN = 8;    // Ultrasonic sensor echo

// Bluetooth communication
SoftwareSerial bluetooth(HC05_RX_PIN, HC05_TX_PIN);

// System variables
unsigned long stepCount = 0;
float powerGenerated = 15.0;
bool buzzerEnabled = false;    // Buzzer enabled/disabled from web app
bool buzzerDisabled = false;   // Buzzer explicitly disabled (overrides obstacle detection)
bool obstacleDetected = false; // Current obstacle detection status

// Timing variables
unsigned long lastDataSend = 0;
unsigned long lastStepUpdate = 0;

// Buzzer control variables
bool buzzerPulseState = false;
unsigned long lastBuzzerToggle = 0;
float previousDistance = -1;

// Configuration
const unsigned long DATA_SEND_INTERVAL = 2000;   // Send data every 2 seconds
const unsigned long STEP_UPDATE_INTERVAL = 3000; // Update steps every 3 seconds
const float OBSTACLE_DISTANCE_CM = 20.0;         // Trigger buzzer if obstacle closer than 20cm

void setup()
{
    // Initialize serial communications
    Serial.begin(9600);
    bluetooth.begin(9600);

    // Initialize pins
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(TRIG_PIN, LOW);
    buzzerEnabled = false;
    buzzerDisabled = false;
    obstacleDetected = false;

    // Startup sequence
    Serial.println();
    Serial.println("🚀 StrideSync Smart Shoe - FINAL VERSION");
    Serial.println("📡 HC-05 Bluetooth Module");
    Serial.println("🔧 Hardware:");
    Serial.println("   - Buzzer on Pin 12");
    Serial.println("   - HC-05 on Pins 2&3");
    Serial.println("   - Ultrasonic Trig Pin 9, Echo Pin 8");
    Serial.println();

    // Test buzzer on startup
    Serial.println("🔊 Testing buzzer...");
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("✅ Buzzer test complete");

    delay(1000);

    // Clear Bluetooth buffer
    while (bluetooth.available())
    {
        bluetooth.read();
    }

    // Send ready signal
    bluetooth.println("HI TECH READY");

    Serial.println("📱 Bluetooth initialized");
    Serial.println("✅ System ready - waiting for commands");
    Serial.println("=====================================");
}

void loop()
{
    // Handle incoming Bluetooth commands
    handleBluetoothCommands();

    // Update step count periodically
    if (millis() - lastStepUpdate >= STEP_UPDATE_INTERVAL)
    {
        updateSteps();
        lastStepUpdate = millis();
    }

    // Send data to web application
    if (millis() - lastDataSend >= DATA_SEND_INTERVAL)
    {
        sendDataToApp();
        lastDataSend = millis();
    }

    // Check for obstacles and control buzzer
    checkObstacleAndControlBuzzer();

    delay(100); // Small delay for stability
}

void updateSteps()
{
    // Simulate step detection
    stepCount += random(1, 4);

    // Update power generation (simulate realistic values)
    powerGenerated = 15.0 + (random(0, 200) / 10.0); // 15-35 range

    Serial.println("👟 Steps: " + String(stepCount) + " | Power: " + String(powerGenerated, 1) + "mV");
}

void sendDataToApp()
{
    // Send structured data that the web app expects
    // buzzerActive shows if buzzer is currently sounding (enabled AND obstacle detected)
    // BUT respects the buzzerDisabled override
    bool buzzerActive = !buzzerDisabled && buzzerEnabled && obstacleDetected;

    String data = "STEPS:" + String(stepCount) +
                  ",POWER:" + String(powerGenerated, 2) +
                  ",BUZZER:" + String(buzzerActive ? "1" : "0");

    // Send the data with proper line ending
    bluetooth.print(data);
    bluetooth.print("\r\n"); // Explicit line ending

    // Small delay and send again for reliability
    delay(100);
    bluetooth.print(data);
    bluetooth.print("\r\n");

    Serial.println("📤 Data sent (2x): " + data);
}

void handleBluetoothCommands()
{
    if (bluetooth.available())
    {
        String command = bluetooth.readString();
        command.trim();
        command.toUpperCase();

        Serial.println();
        Serial.println("📨 Command received: '" + command + "'");

        // Always acknowledge receipt
        bluetooth.println("RECEIVED: " + command);

        if (command == "TEST")
        {
            Serial.println("🧪 TEST command - beeping buzzer and sending test data");
            digitalWrite(BUZZER_PIN, HIGH);
            delay(500);
            digitalWrite(BUZZER_PIN, LOW);

            // Send test data immediately
            bool buzzerActive = !buzzerDisabled && buzzerEnabled && obstacleDetected;
            String testData = "STEPS:" + String(stepCount) +
                              ",POWER:" + String(powerGenerated, 2) +
                              ",BUZZER:" + String(buzzerActive ? "1" : "0");
            bluetooth.print(testData);
            bluetooth.print("\r\n");

            bluetooth.println("TEST SUCCESS");
            Serial.println("✅ TEST complete - test data sent: " + testData);
        }
        else if (command == "BUZZER_ON" || command == "ON")
        {
            Serial.println("🔊 BUZZER ON command");
            buzzerEnabled = true;
            buzzerDisabled = false; // Clear disable flag
            bluetooth.println("BUZZER ON SUCCESS");
            Serial.println("✅ Buzzer is now ENABLED (will buzz only when obstacle detected)");
        }
        else if (command == "BUZZER_OFF" || command == "OFF")
        {
            Serial.println("🔇 BUZZER OFF command");
            buzzerEnabled = false;
            buzzerDisabled = true; // Set disable flag to override obstacle detection
            digitalWrite(BUZZER_PIN, LOW);
            bluetooth.println("BUZZER OFF SUCCESS");
            Serial.println("✅ Buzzer is now DISABLED (no obstacle detection)");
        }
        else if (command == "STATUS")
        {
            Serial.println("📊 STATUS command");
            bluetooth.println("STATUS: CONNECTED");
            bluetooth.println("Steps: " + String(stepCount));
            bluetooth.println("Power: " + String(powerGenerated, 2) + "mV");
            bluetooth.println("Buzzer: " + String(buzzerEnabled ? "ENABLED" : (buzzerDisabled ? "DISABLED (OVERRIDE)" : "AUTO")));
            bluetooth.println("Obstacle: " + String(obstacleDetected ? "DETECTED" : "CLEAR"));
            Serial.println("✅ Status sent");
        }
        else if (command == "RESET")
        {
            Serial.println("🔄 RESET command");
            stepCount = 0;
            powerGenerated = 15.0;
            buzzerEnabled = false;
            buzzerDisabled = false;
            obstacleDetected = false;
            digitalWrite(BUZZER_PIN, LOW);
            bluetooth.println("RESET SUCCESS");
            Serial.println("✅ System reset");
        }
        else
        {
            Serial.println("❌ Unknown command: '" + command + "'");
            bluetooth.println("ERROR: Unknown command");
        }

        Serial.println("=====================================");
    }
}

void controlBuzzer()
{
    // This function is deprecated - use checkObstacleAndControlBuzzer() instead
    // Keeping for compatibility but functionality moved to checkObstacleAndControlBuzzer()
    Serial.println("⚠️  controlBuzzer() is deprecated - using checkObstacleAndControlBuzzer()");
}

void checkObstacleAndControlBuzzer()
{
    // Read ultrasonic sensor
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = (duration * 0.034) / 2; // Convert to cm

    // Check for obstacle (distance less than 20cm)
    bool previousObstacleState = obstacleDetected;
    obstacleDetected = (distance > 0 && distance < OBSTACLE_DISTANCE_CM);

    // Debug output for distance monitoring (only when values change)
    if (abs(distance - previousDistance) > 1.0 || obstacleDetected != previousObstacleState)
    {
        Serial.print("Distance: ");
        Serial.print(distance);
        Serial.print(" cm, Obstacle: ");
        Serial.println(obstacleDetected ? "YES" : "NO");
        previousDistance = distance;
    }

    // Check if buzzer is explicitly disabled (overrides everything)
    if (buzzerDisabled)
    {
        // Buzzer is explicitly turned OFF - no sound regardless of obstacles
        digitalWrite(BUZZER_PIN, LOW);
        buzzerPulseState = false;
        return; // Exit early, don't process any other buzzer logic
    }

    // NEW LOGIC: Buzzer only works when BOTH enabled from app AND obstacle detected
    bool shouldBuzz = buzzerEnabled && obstacleDetected;

    if (shouldBuzz)
    {
        // Pulsed buzzer when app enabled AND obstacle detected (500ms on/off)
        unsigned long currentTime = millis();
        if (currentTime - lastBuzzerToggle >= 500)
        {
            buzzerPulseState = !buzzerPulseState;
            digitalWrite(BUZZER_PIN, buzzerPulseState ? HIGH : LOW);
            lastBuzzerToggle = currentTime;
        }
    }
    else
    {
        // Turn off buzzer (either app disabled OR no obstacle)
        digitalWrite(BUZZER_PIN, LOW);
        buzzerPulseState = false;
    }
}

/*
 * ✅ FINAL StrideSync Arduino Code
 *
 * This version is optimized for:
 * - Clean data transmission
 * - Reliable command handling
 * - Minimal interference
 * - Clear debugging output
 *
 * Upload Instructions:
 * 1. Disconnect HC-05 TX/RX (pins 2&3)
 * 2. Upload this code
 * 3. Reconnect HC-05 TX/RX
 * 4. Open Serial Monitor
 * 5. Connect via web app
 *
 * Expected behavior:
 * - Sends data every 2 seconds
 * - Responds to commands immediately
 * - Clear Serial Monitor output
 * - Buzzer works on command
 */