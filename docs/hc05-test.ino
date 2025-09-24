// HC-05 Bluetooth Module Test Code
// This code tests if your HC-05 is properly connected and working

#include <SoftwareSerial.h>

const int RX_PIN = 2; // Connect HC-05 TX to Arduino pin 2
const int TX_PIN = 3; // Connect HC-05 RX to Arduino pin 3

SoftwareSerial bluetooth(RX_PIN, TX_PIN);

void setup()
{
    // Initialize serial communication with computer
    Serial.begin(9600);
    Serial.println("HC-05 Test Started");

    // Initialize Bluetooth communication
    bluetooth.begin(9600); // Default baud rate for HC-05
    Serial.println("Bluetooth initialized");

    // Send test message
    bluetooth.println("HC-05 Connected Successfully!");
    Serial.println("Test message sent to HC-05");
}

void loop()
{
    // Check if data is available from Bluetooth
    if (bluetooth.available())
    {
        String receivedData = bluetooth.readString();
        Serial.print("Received from Bluetooth: ");
        Serial.println(receivedData);
    }

    // Check if data is available from Serial Monitor
    if (Serial.available())
    {
        String serialData = Serial.readString();
        bluetooth.print("Arduino says: ");
        bluetooth.println(serialData);
        Serial.print("Sent to Bluetooth: ");
        Serial.println(serialData);
    }

    // Send periodic test messages
    static unsigned long lastSend = 0;
    if (millis() - lastSend > 5000)
    { // Every 5 seconds
        bluetooth.println("Heartbeat from Arduino");
        Serial.println("Heartbeat sent");
        lastSend = millis();
    }
}