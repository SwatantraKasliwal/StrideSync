// Enhanced HC-05 Debug Code - Add this to your Arduino for better debugging

#include <SoftwareSerial.h>

SoftwareSerial bluetooth(2, 3); // RX, TX

void setup()
{
    Serial.begin(9600);
    bluetooth.begin(9600);

    pinMode(4, OUTPUT); // Buzzer pin
    digitalWrite(4, LOW);

    Serial.println("🔍 HC-05 Enhanced Debug Mode");
    Serial.println("📱 HC-05 Connection Status:");
    Serial.println("   - Check HC-05 LED status");
    Serial.println("   - Fast blink = Ready to pair");
    Serial.println("   - Slow blink = Paired but not connected");
    Serial.println("   - Solid = Connected");
    Serial.println("");

    // Send beacon every 2 seconds
    Serial.println("🚀 Starting Bluetooth beacon...");
}

void loop()
{
    // Send periodic beacon to help detection
    bluetooth.println("STRIDE_BEACON:READY");
    Serial.println("📡 Beacon sent: STRIDE_BEACON:READY");

    // Check for any incoming data
    if (bluetooth.available())
    {
        String received = bluetooth.readString();
        received.trim();

        Serial.print("📨 Received: '");
        Serial.print(received);
        Serial.println("'");

        // Respond to any command
        if (received == "BUZZER_ON")
        {
            digitalWrite(4, HIGH);
            bluetooth.println("ACK:BUZZER_ON");
            Serial.println("✅ Buzzer ON");
        }
        else if (received == "BUZZER_OFF")
        {
            digitalWrite(4, LOW);
            bluetooth.println("ACK:BUZZER_OFF");
            Serial.println("✅ Buzzer OFF");
        }
        else
        {
            bluetooth.println("ACK:RECEIVED");
            Serial.println("✅ Command acknowledged");
        }
    }

    // Show status every 5 seconds
    static unsigned long lastStatus = 0;
    if (millis() - lastStatus > 5000)
    {
        Serial.println("📊 System Status: RUNNING");
        Serial.println("🔗 HC-05 Status: Waiting for connection");
        Serial.println("---");
        lastStatus = millis();
    }

    delay(2000);
}