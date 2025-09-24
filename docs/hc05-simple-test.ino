// Simple HC-05 Test - Upload this first to test Bluetooth
#include <SoftwareSerial.h>

SoftwareSerial bluetooth(2, 3); // RX, TX

void setup()
{
  Serial.begin(9600);
  bluetooth.begin(9600);

  Serial.println("🔍 HC-05 Simple Test Started");
  Serial.println("📱 Looking for Bluetooth connection...");

  // Send test message every 3 seconds
}

void loop()
{
  // Send periodic beacon
  bluetooth.println("HC-05 ALIVE");
  Serial.println("📡 Sent: HC-05 ALIVE");

  // Check for incoming data
  if (bluetooth.available())
  {
    String received = bluetooth.readString();
    Serial.print("📨 Received: ");
    Serial.println(received);
    bluetooth.println("ACK: " + received);
  }

  delay(3000);
}