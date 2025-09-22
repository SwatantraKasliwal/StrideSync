/*
 * StrideSync Smart Shoe - Arduino Code
 *
 * This sketch demonstrates how to send data from an Arduino with HC-05
 * Bluetooth module to the StrideSync web application.
 *
 * Hardware Requirements:
 * - Arduino Uno/Nano/ESP32
 * - HC-05 Bluetooth Module
 * - Step sensor (accelerometer, gyroscope, or piezoelectric)
 * - Power generation sensor (voltage/current measurement)
 * - Buzzer for object detection alerts
 * - Optional: Ultrasonic sensor for object detection
 *
 * Wiring:
 * HC-05 VCC -> 3.3V
 * HC-05 GND -> GND
 * HC-05 TXD -> Digital Pin 2 (RX)
 * HC-05 RXD -> Digital Pin 3 (TX)
 * Buzzer -> Digital Pin 8
 * Step Sensor -> Analog Pin A0
 * Power Sensor -> Analog Pin A1
 * Object Sensor -> Digital Pin 7
 */

#include <SoftwareSerial.h>

// Bluetooth module pins
SoftwareSerial bluetooth(2, 3); // RX, TX

// Sensor pins
const int BUZZER_PIN = 8;
const int STEP_SENSOR_PIN = A0;
const int POWER_SENSOR_PIN = A1;
const int OBJECT_SENSOR_PIN = 7;

// Variables
int stepCount = 0;
float powerGenerated = 0.0;
bool buzzerEnabled = true;
bool objectDetected = false;
unsigned long lastStepTime = 0;
unsigned long lastDataSend = 0;
int lastStepReading = 0;

// Thresholds
const int STEP_THRESHOLD = 50;                 // Adjust based on your sensor
const unsigned long DEBOUNCE_TIME = 300;       // ms between steps
const unsigned long DATA_SEND_INTERVAL = 1000; // Send data every 1 second

void setup()
{
    Serial.begin(9600);
    bluetooth.begin(9600);

    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(OBJECT_SENSOR_PIN, INPUT);

    Serial.println("StrideSync Smart Shoe Initialized");
    bluetooth.println("StrideSync Ready");
}

void loop()
{
    // Read sensors
    readStepSensor();
    readPowerSensor();
    readObjectSensor();

    // Handle Bluetooth commands
    handleBluetoothCommands();

    // Control buzzer based on object detection and settings
    controlBuzzer();

    // Send data periodically
    if (millis() - lastDataSend >= DATA_SEND_INTERVAL)
    {
        sendDataToBluetooth();
        lastDataSend = millis();
    }

    delay(50); // Small delay for stability
}

void readStepSensor()
{
    int currentReading = analogRead(STEP_SENSOR_PIN);

    // Simple step detection based on threshold crossing
    if (currentReading > STEP_THRESHOLD &&
        lastStepReading <= STEP_THRESHOLD &&
        millis() - lastStepTime > DEBOUNCE_TIME)
    {

        stepCount++;
        lastStepTime = millis();
        Serial.print("Step detected! Total: ");
        Serial.println(stepCount);
    }

    lastStepReading = currentReading;
}

void readPowerSensor()
{
    // Read power sensor (voltage from piezoelectric elements)
    int sensorValue = analogRead(POWER_SENSOR_PIN);

    // Convert to voltage (0-5V range)
    float voltage = (sensorValue / 1024.0) * 5.0;

    // Calculate power (this is a simplified calculation)
    // In real implementation, you'd measure current too
    powerGenerated = voltage * 0.1; // Assuming some current

    // Add some realistic variation
    powerGenerated += (random(-10, 10) / 100.0);
    if (powerGenerated < 0)
        powerGenerated = 0;
}

void readObjectSensor()
{
    // Read object detection sensor (could be ultrasonic, IR, etc.)
    objectDetected = digitalRead(OBJECT_SENSOR_PIN);
}

void handleBluetoothCommands()
{
    if (bluetooth.available())
    {
        String command = bluetooth.readString();
        command.trim();

        Serial.print("Received command: ");
        Serial.println(command);

        if (command == "BUZZER_ON")
        {
            buzzerEnabled = true;
            bluetooth.println("Buzzer enabled");
        }
        else if (command == "BUZZER_OFF")
        {
            buzzerEnabled = false;
            digitalWrite(BUZZER_PIN, LOW); // Turn off buzzer
            bluetooth.println("Buzzer disabled");
        }
        else if (command == "RESET_STEPS")
        {
            stepCount = 0;
            bluetooth.println("Steps reset");
        }
        else if (command == "STATUS")
        {
            sendDataToBluetooth();
        }
    }
}

void controlBuzzer()
{
    // Buzzer is active only if enabled AND object is detected
    bool shouldBuzz = buzzerEnabled && objectDetected;

    if (shouldBuzz)
    {
        // Create a beeping pattern
        if ((millis() / 500) % 2 == 0)
        {
            digitalWrite(BUZZER_PIN, HIGH);
        }
        else
        {
            digitalWrite(BUZZER_PIN, LOW);
        }
    }
    else
    {
        digitalWrite(BUZZER_PIN, LOW);
    }
}

void sendDataToBluetooth()
{
    // Send data in the format expected by the web app
    // Format: "STEPS:1234,POWER:0.52,BUZZER:1"

    String dataString = "STEPS:" + String(stepCount) +
                        ",POWER:" + String(powerGenerated, 2) +
                        ",BUZZER:" + String(buzzerEnabled && objectDetected ? 1 : 0);

    bluetooth.println(dataString);

    // Also print to Serial monitor for debugging
    Serial.println("Sent: " + dataString);
}

/*
 * Additional functions you might want to implement:
 *
 * 1. Calibration routine for step detection
 * 2. Power management for battery life
 * 3. Data logging to EEPROM
 * 4. Multiple sensor fusion for better step detection
 * 5. Adaptive thresholds based on walking pattern
 */