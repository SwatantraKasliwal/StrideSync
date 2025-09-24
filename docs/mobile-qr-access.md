# QR Code for Mobile Access

## Scan this QR code with your mobile device:

**Network URL**: http://192.168.0.207:9002

## Or manually type in mobile browser:

```
http://192.168.0.207:9002
```

## Mobile Testing Steps:

1. **Connect phone to same WiFi** as laptop
2. **Open Chrome** on Android (or any browser)
3. **Go to network URL** above
4. **Try "Scan for Devices"** button
5. **Look for HC-05** in device list

## If Web Bluetooth doesn't work on mobile:

Use **Bluetooth Terminal app** instead:

- Android: "Serial Bluetooth Terminal"
- iOS: "LightBlue Explorer"

## Test Commands:

- `BUZZER_ON` → Should activate buzzer
- `BUZZER_OFF` → Should deactivate buzzer
- `STATUS` → Should get response

## Debug with Arduino Serial Monitor:

- See beacon messages every 2 seconds
- See received commands
- See buzzer status changes
