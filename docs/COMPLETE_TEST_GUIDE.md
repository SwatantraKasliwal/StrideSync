# 🚀 StrideSync Complete Testing Guide

## 📋 Current Status

- ✅ Web application running on http://localhost:3000
- ✅ Arduino hardware setup visible in photos
- ✅ HC-05 Bluetooth module connected
- ❓ Need to test both mobile commands and web app test mode

## 🔧 STEP 1: Test Your Arduino Hardware

### Upload Test Code

1. **CRITICAL**: Disconnect HC-05 TX/RX wires (pins 2&3) from Arduino
2. Open Arduino IDE
3. Upload the code from `docs/hardware-test.ino`
4. **CRITICAL**: Reconnect HC-05 TX/RX wires to pins 2&3
5. Open Serial Monitor (9600 baud)

### Expected Serial Monitor Output:

```
=================================
🧪 STRIDESYNC HARDWARE TEST
=================================
📡 HC-05 Module: Initializing...
🔊 Buzzer: Testing...
✅ Buzzer test completed
📱 HC-05 ready for mobile connection
💓 Heartbeat sent
```

**If you don't see this output, there's a hardware issue!**

## 📱 STEP 2: Test Mobile Commands (nRF Connect)

### Download and Setup nRF Connect

1. Install "nRF Connect for Mobile" app on your phone
2. Open the app and tap "Scanner"
3. Look for "HI TECH" device in the list
4. Tap "CONNECT" on the HI TECH device

### Send Test Commands

1. After connecting, tap "Unknown Service" (UUID ending in FFE0)
2. Find characteristic ending in FFE2 (this is for sending commands)
3. Tap the "⬆️" (write) icon on the FFE2 characteristic
4. Select "Text" format
5. Type: `TEST`
6. Tap "Send"

### Expected Response

1. Buzzer should beep for 0.5 seconds
2. Serial Monitor should show:
   ```
   📨 Received: 'TEST'
   🧪 Executing TEST command
   ✅ TEST completed successfully
   ```
3. In nRF Connect, characteristic FFE1 should show response:
   ```
   TEST_SUCCESS
   Hardware: OK
   Buzzer: WORKING
   ```

## 💻 STEP 3: Test Web Application

### Open and Test

1. Go to http://localhost:3000
2. Open browser Developer Tools (F12)
3. Click Console tab
4. Click "Scan Devices" button
5. Click "Test Mode" button

### Expected Web App Behavior

1. **Toast notifications**:
   - "🔄 Connecting..." (briefly)
   - "🎯 Test Mode Connected!" (4 seconds)
2. **Green success banner**: "✅ Successfully Connected!"
3. **Live data**: Step count and power values updating every 2 seconds
4. **Console messages**: Detailed debug output

### Expected Console Output:

```
DeviceScanner: Test Mode button clicked
Dashboard: Connecting to device: Test StrideSync Device ID: test-device-12345
Dashboard: Detected test device, calling connectTestDevice()
BluetoothService: connectTestDevice() called
Dashboard: Status callback received: connecting
Dashboard: Status callback received: connected
BluetoothService: Simulated data: {steps: X, power: Y, buzzerActive: false}
Dashboard: Received data from bluetooth service: {steps: X, power: Y}
```

## 🐛 Troubleshooting Guide

### Hardware Issues:

- **No Serial Monitor output**: Check USB connection, baud rate (9600), correct COM port
- **No buzzer sound**: Check wiring (+ to pin 4, - to GND), try different buzzer
- **Can't find "HI TECH" device**: HC-05 not powered, wiring issue, or not in pairing mode

### Mobile App Issues:

- **Can't connect**: Reset Arduino, check HC-05 power LED is blinking
- **Commands not working**: Wrong characteristic, check FFE2 for commands, FFE1 for responses
- **No response**: Check Serial Monitor for received commands

### Web App Issues:

- **Test mode button doesn't work**: Check browser console for errors, refresh page
- **No toast notifications**: Check if using Chrome/Edge/Opera, clear browser cache
- **No data updates**: Look for simulation data in console, check data callback

## ✅ Success Indicators

### Arduino Success:

- [ ] Serial Monitor shows startup messages
- [ ] Buzzer beeps 3 times on startup
- [ ] Heartbeat messages every 5 seconds
- [ ] TEST command works via nRF Connect

### Web App Success:

- [ ] Test mode shows connection success toast
- [ ] Green banner appears with device name
- [ ] Step counter increases every 2 seconds
- [ ] Power values change dynamically
- [ ] Console shows simulation data messages

## 🎯 Next Actions

1. **First**: Test Arduino hardware with the test code
2. **Report**: What you see in Serial Monitor
3. **Second**: Test mobile commands with nRF Connect
4. **Report**: Whether TEST command works
5. **Third**: Test web app test mode
6. **Report**: What console messages and visual feedback you see

**Send me screenshots or copy-paste the outputs so I can help debug any issues!**
