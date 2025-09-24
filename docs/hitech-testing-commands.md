# HI TECH (HC-05) Testing Commands

## 🔧 Updated Arduino Code Features

Your HC-05 device name: **"HI TECH"** (as seen in Android scan)

### New Features Added:

✅ **Immediate command feedback** - Shows exactly what was received  
✅ **Connection status in data** - Web app can detect "HI TECH" connection  
✅ **Heartbeat signals** - Sent every 3 seconds for connection detection  
✅ **Better command parsing** - Handles extra characters from mobile apps  
✅ **Human-readable responses** - Easier to see results in Bluetooth Terminal

## 📱 Testing with Bluetooth Terminal App

### Step 1: Connect to HI TECH

1. Open "Serial Bluetooth Terminal" app
2. Go to **"Bluetooth Classic"** tab (not LE!)
3. Find and connect to **"HI TECH"** device
4. You should see welcome messages:
   ```
   === StrideSync Connected! ===
   Device: HI TECH
   Commands: ON, OFF, STATUS, RESET
   STATUS:READY
   ```

### Step 2: Test Basic Commands

**Command: `TEST`**

- Type: `TEST` and send
- Expected response:
  ```
  >> Command received: TEST
  ✅ TEST SUCCESS
  HI TECH is connected and responding!
  ```
- Buzzer should beep once briefly

**Command: `ON`**

- Type: `ON` and send
- Expected response:
  ```
  >> Command received: ON
  ✅ BUZZER ON
  ACK:BUZZER_ON
  ```
- Buzzer should turn ON immediately

**Command: `OFF`**

- Type: `OFF` and send
- Expected response:
  ```
  >> Command received: OFF
  ✅ BUZZER OFF
  ACK:BUZZER_OFF
  ```
- Buzzer should turn OFF immediately

**Command: `STATUS`**

- Type: `STATUS` and send
- Expected response:
  ```
  >> Command received: STATUS
  ✅ DEVICE STATUS:
  Device: HI TECH
  Connection: ACTIVE
  Steps: 2
  Power: 34.56mV
  Buzzer: OFF
  ACK:DEVICE_ACTIVE
  ```

**Command: `RESET`**

- Type: `RESET` and send
- Expected response:
  ```
  >> Command received: RESET
  ✅ STEPS RESET to 0
  ACK:STEPS_RESET
  ```

## 🌐 Testing with Web Application

### Connection Detection

The web app should now detect:

- **Device Name**: "HI TECH"
- **Connection Status**: Shows as connected
- **Live Data**: Updates every second with heartbeat

### Data Format Sent to Web App:

```
STEPS:5,POWER:42.34,BUZZER:1,DEVICE:HI_TECH,STATUS:CONNECTED
HEARTBEAT:HI_TECH_CONNECTED
```

## 🐛 Troubleshooting

### If Commands Don't Work:

1. **Check Serial Monitor** - You should see:

   ```
   📨 Received command: 'ON' (length: 2)
   ✅ BUZZER ON - Command executed!
   ```

2. **Try Different Commands** - Start with `TEST` command

3. **Check Connection** - Look for heartbeat messages every 3 seconds:
   ```
   💓 Heartbeat sent - Device: HI TECH
   ```

### If Multiple Devices Connect:

- HC-05 can only have ONE active connection at a time
- If web app connects, mobile terminal will disconnect
- If mobile terminal connects, web app connection drops
- This is normal Bluetooth Classic behavior

### Arduino Serial Monitor Output:

You should see continuous output like:

```
📊 StrideSync Data:
   Device: HI TECH   Steps: 3
   Power: 28.45mV
   Distance: No object detected
   Buzzer: OFF
📡 Sent to Bluetooth: STEPS:3,POWER:28.45,BUZZER:0,DEVICE:HI_TECH,STATUS:CONNECTED
💓 Heartbeat sent - Device: HI TECH
```

## 🚀 Upload Instructions

1. **Disconnect HI TECH TX/RX wires** (pins 2 & 3)
2. **Upload the updated arduino-example.ino**
3. **Reconnect HI TECH TX/RX wires**
4. **Open Serial Monitor** (9600 baud)
5. **Test with Bluetooth Terminal** using commands above
6. **Test with StrideSync web app**

Your HI TECH device should now work perfectly! 🎉
