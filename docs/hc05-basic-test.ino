/*
 * HC-05 Basic Test - Check if Bluetooth Module is Working
 *
 * This simple test code helps verify if your HC-05 is functioning
 * and can communicate with your Arduino.
 *
 * Wiring:
 * HC-05 VCC -> 5V (or 3.3V depending on your module)
 * HC-05 GND -> GND
 * HC-05 TXD -> Pin 2 (Arduino RX)
 * HC-05 RXD -> Pin 3 (Arduino TX)
 *
 * IMPORTANT: Disconnect HC-05 TX/RX wires during upload!
 */

#include <SoftwareSerial.h>

SoftwareSerial bluetooth(2, 3); // RX, TX
unsigned long lastMessage = 0;

void setup()
{
  Serial.begin(9600);
  bluetooth.begin(9600);

  Serial.println("=== HC-05 Basic Test ===");
  Serial.println("🔍 Checking HC-05 Module...");
  Serial.println();

  delay(2000);

  // Send initial test message
  bluetooth.println("HC-05 Test: Module Active");
  Serial.println("✅ Sent initial test message to HC-05");
  Serial.println("📱 Look for 'HC-05' or similar name in Android Bluetooth scan");
  Serial.println();
}

void loop()
{
  // Send a beacon message every 3 seconds
  if (millis() - lastMessage >= 3000)
  {
    bluetooth.println("BEACON: HC-05 Working - " + String(millis() / 1000) + "s");
    Serial.println("📡 Beacon sent: " + String(millis() / 1000) + " seconds uptime");
    Serial.println("   Check Android: Should see 'HC-05' in Bluetooth Classic scan");
    lastMessage = millis();
  }

  // Check for incoming Bluetooth data
  if (bluetooth.available())
  {
    String received = bluetooth.readString();
    received.trim();
    Serial.println("📨 Received from Bluetooth: " + received);
    bluetooth.println("ACK: Received - " + received);
  }

  // Check for Serial commands to send to Bluetooth
  if (Serial.available())
  {
    String command = Serial.readString();
    command.trim();
    bluetooth.println("CMD: " + command);
    Serial.println("📤 Sent to HC-05: " + command);
  }

  delay(100);
}

/*
 * Testing Steps:
 *
 * 1. Upload this code (disconnect HC-05 TX/RX first!)
 * 2. Reconnect HC-05 TX/RX wires
 * 3. Open Serial Monitor (9600 baud)
 * 4. You should see beacon messages every 3 seconds
 * 5. On Android, scan for Bluetooth Classic devices
 * 6. Look for device named "HC-05" or "HC-06"
 *
 * LED Status:
 * - Fast blinking (2 times/second) = Not paired/discoverable
 * - Slow blinking (once every 2 seconds) = Paired but not connected
 * - Solid on = Connected
 *
 * If HC-05 doesn't appear:
 * - Check power connections (VCC to 5V, GND to GND)
 * - Verify TX/RX wiring (HC-05 TX to Arduino Pin 2, HC-05 RX to Arduino Pin 3)
 * - Try a different Android app (Serial Bluetooth Terminal)
 * - Check if HC-05 LED is blinking
 */