/*
 * Simple Buzzer Test - Check if Buzzer is Working
 * 
 * This code just beeps the buzzer every 2 seconds
 * to verify the buzzer hardware is connected properly.
 */

const int BUZZER_PIN = 4;

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("=== Buzzer Test Started ===");
  Serial.println("Buzzer should beep every 2 seconds");
  Serial.println("If no beep, check wiring:");
  Serial.println("  Buzzer + → Pin 4");
  Serial.println("  Buzzer - → GND");
}

void loop() {
  Serial.println("🔊 Buzzer ON");
  digitalWrite(BUZZER_PIN, HIGH);
  delay(500);  // Beep for 0.5 seconds
  
  Serial.println("🔇 Buzzer OFF");
  digitalWrite(BUZZER_PIN, LOW);
  delay(1500); // Wait 1.5 seconds
  
  Serial.println("---");
}