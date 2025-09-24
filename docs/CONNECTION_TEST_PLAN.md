# StrideSync Connection Test Plan

## 🔧 Hardware Setup Verification

### Step 1: Arduino Hardware Test

1. **Upload the hardware test code** (`docs/hardware-test.ino`)
2. **CRITICAL**: Disconnect HC-05 TX/RX wires before uploading!
3. **Reconnect** HC-05 TX/RX wires after upload
4. **Open Serial Monitor** (9600 baud)
5. **Expected output**:
   ```
   🧪 STRIDESYNC HARDWARE TEST
   📡 HC-05 Module: Initializing...
   🔊 Buzzer: Testing...
   ✅ Buzzer test completed
   💓 Heartbeat sent
   ```

### Step 2: Mobile App Testing (nRF Connect)

1. **Download nRF Connect** app on your phone
2. **Scan for devices** - look for "HI TECH"
3. **Connect to device**
4. **Find service** with UUID ending in `FFE0`
5. **Send commands**:
   - Use characteristic `FFE2` to send: `TEST`
   - Monitor characteristic `FFE1` for responses
6. **Expected responses**:
   ```
   TEST_SUCCESS
   Hardware: OK
   Buzzer: WORKING
   ```

### Step 3: Web Application Test Mode

1. **Open browser**: http://localhost:3000
2. **Click "Scan Devices"**
3. **Click "Test Mode"** button
4. **Expected behavior**:
   - Shows "🔄 Connecting..." toast
   - Shows "🎯 Test Mode Connected!" toast
   - Green success banner appears
   - Step count and power data starts updating every 2 seconds

## 🐛 Current Issues & Solutions

### Issue 1: Test Mode Not Working

**Problem**: Web app test mode doesn't show data
**Solution**: Status callbacks are working, but data simulation might have timing issues

### Issue 2: Mobile Commands Not Working

**Problem**: Arduino not responding to mobile app commands
**Solution**: Use the simplified hardware test code first

### Issue 3: Web App Connection Status

**Problem**: Connection status not clear to users
**Solution**: Enhanced toast notifications and status indicators

## 🚀 Debugging Steps

### For Arduino Issues:

1. Check Serial Monitor output
2. Verify buzzer beeps on startup
3. Test with simple commands (TEST, BUZZ, STOP)
4. Use nRF Connect app for direct testing

### For Web App Issues:

1. Open browser developer console (F12)
2. Look for console.log messages
3. Check for JavaScript errors
4. Verify test mode connection flow

### For Mobile App Issues:

1. Use nRF Connect (most reliable)
2. Check HC-05 is discoverable
3. Verify correct service UUID (FFE0)
4. Use correct characteristics (FFE1/FFE2)

## 📋 Success Checklist

- [ ] Arduino Serial Monitor shows startup messages
- [ ] Buzzer beeps 3 times on Arduino startup
- [ ] Heartbeat messages appear every 5 seconds
- [ ] nRF Connect can discover "HI TECH" device
- [ ] nRF Connect can send TEST command successfully
- [ ] Web app test mode shows connection success toast
- [ ] Web app displays simulated step/power data
- [ ] Real-time data updates every 2 seconds in web app

## 🔍 Next Steps

1. **First**: Upload and test the hardware-test.ino code
2. **Second**: Test mobile connectivity with nRF Connect
3. **Third**: Test web application test mode
4. **Finally**: Upload the full StrideSync code once hardware is verified
