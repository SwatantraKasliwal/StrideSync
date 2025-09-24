/*
 * StrideSync Hardware Test - SIMPLE VERSION
 * 
 * This is a MINIMAL test to verify your hardware connections.
 * Use this FIRST before the main program.
 * 
 * WIRING (Double-check these connections):
 * HC-05 VCC -> Arduino 5V (RED wire)
 * HC-05 GND -> Arduino GND (BLACK wire) 
 * HC-05 TXD -> Arduino Pin 2 (BLUE or GREEN wire)
 * HC-05 RXD -> Arduino Pin 3 (YELLOW or WHITE wire)
 * 
 * Buzzer + -> Arduino Pin 4 (RED wire)
 * Buzzer - -> Arduino GND (BLACK wire)
 * 
 * UPLOAD STEPS:
 * 1. ⚠️ DISCONNECT HC-05 TX/RX wires (pins 2&3) FIRST!
 * 2. Upload this code
 * 3. ✅ RECONNECT HC-05 TX/RX wires  
 * 4. Open Serial Monitor (9600 baud)
 * 5. You should see test messages
 */

#include <SoftwareSerial.h>

// Pin definitions
const int BUZZER_PIN = 4;      
const int HC05_RX_PIN = 2;     // HC-05 TXD connects here
const int HC05_TX_PIN = 3;     // HC-05 RXD connects here

// Bluetooth communication
SoftwareSerial bluetooth(HC05_RX_PIN, HC05_TX_PIN);

void setup() {
    // Initialize serial communications
    Serial.begin(9600);
    bluetooth.begin(9600);
    
    // Initialize buzzer pin
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    
    Serial.println();
    Serial.println("=================================");
    Serial.println("🧪 STRIDESYNC HARDWARE TEST");
    Serial.println("=================================");
    Serial.println("📡 HC-05 Module: Initializing...");
    Serial.println("🔊 Buzzer: Testing...");
    
    // Test buzzer - 3 quick beeps
    for(int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(200);
        digitalWrite(BUZZER_PIN, LOW);
        delay(200);
    }
    
    Serial.println("✅ Buzzer test completed");
    Serial.println("📱 HC-05 ready for mobile connection");
    Serial.println("📋 Send 'TEST' command from mobile app");
    Serial.println("=================================");
    
    // Send initial messages to Bluetooth
    bluetooth.println("HARDWARE_TEST_READY");
    bluetooth.println("Device: StrideSync HC-05");
    bluetooth.println("Status: WAITING_FOR_COMMANDS");
}

void loop() {
    // Check for incoming Bluetooth commands
    if (bluetooth.available()) {
        String command = bluetooth.readString();
        command.trim();
        command.toUpperCase();
        
        Serial.println("📨 Received: '" + command + "'");
        
        if (command == "TEST") {
            Serial.println("🧪 Executing TEST command");
            bluetooth.println("TEST_SUCCESS");
            bluetooth.println("Hardware: OK");
            bluetooth.println("Buzzer: WORKING");
            
            // Test buzzer
            digitalWrite(BUZZER_PIN, HIGH);
            delay(500);
            digitalWrite(BUZZER_PIN, LOW);
            
            Serial.println("✅ TEST completed successfully");
        }
        else if (command == "BUZZ") {
            Serial.println("🔊 Buzzer ON");
            digitalWrite(BUZZER_PIN, HIGH);
            bluetooth.println("BUZZER_ON");
        }
        else if (command == "STOP") {
            Serial.println("🔇 Buzzer OFF");
            digitalWrite(BUZZER_PIN, LOW);
            bluetooth.println("BUZZER_OFF");
        }
        else if (command == "STATUS") {
            Serial.println("📊 Sending status");
            bluetooth.println("STATUS_OK");
            bluetooth.println("Device: HC-05 StrideSync");
            bluetooth.println("Uptime: " + String(millis()/1000) + "s");
            bluetooth.println("Commands: TEST, BUZZ, STOP, STATUS");
        }
        else {
            Serial.println("❌ Unknown command: " + command);
            bluetooth.println("ERROR: Unknown command");
            bluetooth.println("Valid: TEST, BUZZ, STOP, STATUS");
        }
        
        Serial.println("---------------------------------");
    }
    
    // Send heartbeat every 5 seconds
    static unsigned long lastHeartbeat = 0;
    if (millis() - lastHeartbeat > 5000) {
        bluetooth.println("HEARTBEAT: HC-05 ACTIVE");
        Serial.println("💓 Heartbeat sent");
        lastHeartbeat = millis();
    }
    
    delay(100);
}

/*
 * 🔧 TROUBLESHOOTING GUIDE:
 * 
 * 1. If no Serial Monitor output:
 *    - Check USB cable connection
 *    - Verify correct COM port selected
 *    - Make sure baud rate is 9600
 * 
 * 2. If no buzzer sound:
 *    - Check buzzer wiring (+ to pin 4, - to GND)
 *    - Try different buzzer if available
 *    - Verify pin connections
 * 
 * 3. If mobile app can't connect:
 *    - Make sure HC-05 TX/RX wires are connected
 *    - Check HC-05 power (LED should blink)
 *    - Try resetting Arduino (press reset button)
 *    - Ensure HC-05 is in pairing mode
 * 
 * 4. If commands not working:
 *    - Check Serial Monitor for received commands
 *    - Try sending commands one at a time
 *    - Make sure mobile app is using correct characteristic
 *    - Use nRF Connect app for testing
 * 
 * 📱 MOBILE APP TESTING:
 * 1. Download nRF Connect app
 * 2. Scan for "HI TECH" device
 * 3. Connect to device
 * 4. Find service with UUID ending in FFE0
 * 5. Use characteristic FFE2 to send commands
 * 6. Monitor characteristic FFE1 for responses
 * 
 * ✅ SUCCESS INDICATORS:
 * - Serial Monitor shows startup messages
 * - Buzzer beeps 3 times on startup
 * - Heartbeat messages every 5 seconds
 * - Commands received and acknowledged
 * - Mobile app can connect and send commands
 */