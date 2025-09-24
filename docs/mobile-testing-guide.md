# Mobile Testing Guide for StrideSync HC-05

## Method 1: Bluetooth Terminal Apps (Recommended)

### Android:

1. **Download "Serial Bluetooth Terminal"** from Play Store
2. **Pair HC-05** in Android Bluetooth settings
3. **Open app** → Connect to HC-05
4. **Test commands**:
   - Type: `BUZZER_ON` → Should activate buzzer
   - Type: `BUZZER_OFF` → Should deactivate buzzer
   - Type: `STATUS` → Should get device response

### iPhone:

1. **Download "LightBlue Explorer"** from App Store
2. **Connect to HC-05**
3. **Find UART service** and send commands

## Method 2: Web App on Mobile

### Android Chrome:

1. **Enable Chrome flags**:

   - Go to: `chrome://flags/#enable-web-bluetooth`
   - Set to "Enabled"
   - Restart Chrome

2. **Connect to same WiFi** as your laptop
3. **Use network URL**: `http://192.168.0.207:9002`
4. **Test Web Bluetooth**

### iPhone Safari:

- **Not supported** - Web Bluetooth not available on iOS Safari
- Use LightBlue Explorer app instead

## Method 3: Create QR Code for Easy Access

Scan this QR code with your phone to access the app:

```
Network URL: http://192.168.0.207:9002
```

## Expected Behavior:

✅ HC-05 LED should be blinking (ready to pair)
✅ Can pair HC-05 in phone's Bluetooth settings  
✅ Bluetooth terminal app can connect and send commands
✅ Arduino Serial Monitor shows received commands
✅ Buzzer responds to commands immediately
