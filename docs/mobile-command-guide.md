# 📱 How to Send Commands from Mobile to HI TECH

## Step-by-Step Mobile Command Guide

### **Step 1: Download Bluetooth Terminal App**

**Recommended App**: "Serial Bluetooth Terminal" 📱

- **Android**: Search "Serial Bluetooth Terminal" in Play Store
- **Alternative**: "Bluetooth Scanner" or "Bluetooth Terminal"

### **Step 2: Connect to HI TECH Device**

1. **Open the Bluetooth Terminal app**
2. **Tap "Devices" or "Connect"**
3. **Switch to "Bluetooth Classic" tab** (NOT Bluetooth LE!)
4. **Find and tap "HI TECH"** in the device list
5. **Tap "Connect"** or "Pair"
6. **Enter PIN if asked**: Try `1234` or `0000`

### **Step 3: Verify Connection**

After connecting, you should see welcome messages:

```
=== StrideSync Connected! ===
Device: HI TECH
Commands: ON, OFF, STATUS, RESET
STATUS:READY
```

You'll also see live data every few seconds:

```
📊 Live Data:
Steps: 3
Power: 28.45mV
Distance: No object
Buzzer: OFF
Device: HI TECH - Connected
```

### **Step 4: Send Commands**

In the terminal app, **type these commands and press SEND**:

#### **🔊 Turn Buzzer ON**

**Type**: `ON` **[SEND]**
**Response**:

```
>> Command received: ON
✅ BUZZER ON
ACK:BUZZER_ON
```

**Result**: Buzzer starts making sound immediately

#### **🔇 Turn Buzzer OFF**

**Type**: `OFF` **[SEND]**
**Response**:

```
>> Command received: OFF
✅ BUZZER OFF
ACK:BUZZER_OFF
```

**Result**: Buzzer stops making sound immediately

#### **📊 Check Device Status**

**Type**: `STATUS` **[SEND]**
**Response**:

```
>> Command received: STATUS
✅ DEVICE STATUS:
Device: HI TECH
Connection: ACTIVE
Steps: 5
Power: 34.56mV
Buzzer: OFF
ACK:DEVICE_ACTIVE
```

#### **🔄 Reset Step Counter**

**Type**: `RESET` **[SEND]**
**Response**:

```
>> Command received: RESET
✅ STEPS RESET to 0
ACK:STEPS_RESET
```

#### **🧪 Test Connection**

**Type**: `TEST` **[SEND]**
**Response**:

```
>> Command received: TEST
✅ TEST SUCCESS
HI TECH is connected and responding!
```

**Result**: Buzzer beeps once for 0.5 seconds

## 📱 Screenshots Guide

### In Serial Bluetooth Terminal App:

1. **Connection Screen**:

   ```
   [Devices] → [Bluetooth Classic] → [HI TECH] → [Connect]
   ```

2. **Terminal Screen**:

   ```
   [Text Input Box]  [SEND Button]
   ↑ Type "ON" here   ↑ Tap to send
   ```

3. **Response Area**:
   ```
   Shows all responses from Arduino in real-time
   ```

## 🔧 Troubleshooting Mobile Commands

### **Problem 1: No Response to Commands**

**Solutions**:

- Make sure you're connected to **"HI TECH"**, not another device
- Check that message shows **">> Command received: [YOUR_COMMAND]"**
- Try the **`TEST`** command first to verify connection

### **Problem 2: Connection Keeps Dropping**

**Solutions**:

- Stay close to Arduino (within 10 meters)
- Don't connect web app simultaneously (HC-05 = one connection only)
- Restart Bluetooth Terminal app if needed

### **Problem 3: Commands Don't Work**

**Check these**:

- **Correct spelling**: `ON` not `on` or `On`
- **No extra spaces**: `ON` not `ON` or `ON `
- **Press SEND button** after typing command
- **Wait for response** before sending next command

### **Problem 4: Can't Find HI TECH Device**

**Solutions**:

- Make sure Arduino is powered on
- Check HC-05 LED is blinking (fast = discoverable)
- Use **"Bluetooth Classic"** tab, not "Bluetooth LE"
- Try Android Settings → Bluetooth → Scan for devices

## 🎯 Command Quick Reference

| Command  | Action           | Expected Response     |
| -------- | ---------------- | --------------------- |
| `ON`     | Turn buzzer ON   | ✅ BUZZER ON          |
| `OFF`    | Turn buzzer OFF  | ✅ BUZZER OFF         |
| `STATUS` | Get device info  | ✅ DEVICE STATUS: ... |
| `RESET`  | Reset step count | ✅ STEPS RESET to 0   |
| `TEST`   | Test connection  | ✅ TEST SUCCESS       |

## 📝 Pro Tips

1. **Start with `TEST`** - Always test connection first
2. **Wait for responses** - Don't send commands too fast
3. **Watch Serial Monitor** - Arduino shows all received commands
4. **One app at a time** - Don't use web app and mobile simultaneously
5. **Stay in range** - Keep mobile within 10 meters of Arduino

## 🔄 Command Flow Example

```
You type: TEST
Response: >> Command received: TEST
Response: ✅ TEST SUCCESS
Response: HI TECH is connected and responding!
[Buzzer beeps once]

You type: ON
Response: >> Command received: ON
Response: ✅ BUZZER ON
Response: ACK:BUZZER_ON
[Buzzer turns ON continuously]

You type: STATUS
Response: >> Command received: STATUS
Response: ✅ DEVICE STATUS:
Response: Device: HI TECH
Response: Connection: ACTIVE
Response: Steps: 7
Response: Power: 41.23mV
Response: Buzzer: ON
Response: ACK:DEVICE_ACTIVE

You type: OFF
Response: >> Command received: OFF
Response: ✅ BUZZER OFF
Response: ACK:BUZZER_OFF
[Buzzer turns OFF]
```

That's it! Your mobile can now fully control the HI TECH device! 🎉
