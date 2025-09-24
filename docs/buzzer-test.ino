// Simple Arduino test for buzzer control via Bluetooth
// Upload this first to test buzzer control before using the full system

#include <SoftwareSerial.h>

// Bluetooth module pins
SoftwareSerial bluetooth(2, 3); // RX, TX

// Buzzer pin
const int BUZZER_PIN = 4;

// Variables
bool buzzerState = false;

void setup()
{
    Serial.begin(9600);
    bluetooth.begin(9600);

    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW); // Start with buzzer OFF

    Serial.println("🔊 Buzzer Control Test Ready");
    Serial.println("Commands: BUZZER_ON, BUZZER_OFF, ON, OFF");
    bluetooth.println("Buzzer Test Ready");
}

void loop()
{
    // Handle Bluetooth commands
    if (bluetooth.available())
    {
        String command = bluetooth.readString();
        command.trim();
        command.toUpperCase();

        Serial.print("Received: '");
        Serial.print(command);
        Serial.println("'");

        if (command == "ON" || command == "BUZZER_ON")
        {
            buzzerState = true;
            digitalWrite(BUZZER_PIN, HIGH);
            Serial.println("✅ BUZZER ON");
            bluetooth.println("ACK:BUZZER_ON");
        }
        else if (command == "OFF" || command == "BUZZER_OFF")
        {
            buzzerState = false;
            digitalWrite(BUZZER_PIN, LOW);
            Serial.println("❌ BUZZER OFF");
            bluetooth.println("ACK:BUZZER_OFF");
        }
        else if (command == "STATUS")
        {
            bluetooth.println("BUZZER_TEST_ACTIVE");
            Serial.print("Status: Buzzer is ");
            Serial.println(buzzerState ? "ON" : "OFF");
        }
        else
        {
            Serial.println("Unknown command");
            bluetooth.println("ERROR:UNKNOWN");
        }
    }

    // Send periodic status
    static unsigned long lastStatusSend = 0;
    if (millis() - lastStatusSend > 2000)
    { // Every 2 seconds
        String status = "STEPS:0,POWER:0.00,BUZZER:" + String(buzzerState ? "1" : "0");
        bluetooth.println(status);
        Serial.println("Status sent: " + status);
        lastStatusSend = millis();
    }

    delay(100);
}