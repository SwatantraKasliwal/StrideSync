# 🎯 nRF Connect - Exact Steps to Send Commands to HI TECH

## 📱 You're Connected! Now Here's What to Do:

Looking at your screenshot, you have the **Unknown Service (UUID: 0xFFE0)** which is perfect for sending commands.

### **Step 1: Find the RIGHT Characteristic to Send Commands**

From your screenshot, I can see:

- **Unknown Characteristic UUID: 0xFFE1** - Properties: NOTIFY, WRITE
- **Unknown Characteristic UUID: 0xFFE2** - Properties: WRITE

**Use 0xFFE2 (the one with WRITE property) to send commands!**

### **Step 2: Send Your First Command**

1. **Tap on "Unknown Characteristic UUID: 0xFFE2"** (the one with "WRITE" property)
2. **You'll see a dialog box to write data**
3. **Select "Text (UTF-8)" format**
4. **Type: `TEST`** (all caps)
5. **Tap "SEND"**

### **Step 3: Enable Notifications to See Responses**

1. **Tap on "Unknown Characteristic UUID: 0xFFE1"** (the one with "NOTIFY, WRITE")
2. **Look for notification icon** (usually looks like 📳 or ↗️)
3. **Tap to enable notifications** - this will show responses from Arduino

### **Step 4: Test All Commands**

Once notifications are enabled, send these commands via **0xFFE2**:

#### **Command 1: TEST**

- **Send**: `TEST`
- **Expected Response in 0xFFE1**:

```
>> Command received: TEST
✅ TEST SUCCESS
HI TECH is connected and responding!
```

- **Arduino should**: Beep buzzer for 0.5 seconds

#### **Command 2: ON**

- **Send**: `ON`
- **Expected Response**:

```
>> Command received: ON
✅ BUZZER ON
ACK:BUZZER_ON
```

- **Arduino should**: Turn buzzer ON continuously

#### **Command 3: OFF**

- **Send**: `OFF`
- **Expected Response**:

```
>> Command received: OFF
✅ BUZZER OFF
ACK:BUZZER_OFF
```

- **Arduino should**: Turn buzzer OFF

#### **Command 4: STATUS**

- **Send**: `STATUS`
- **Expected Response**:

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

## 🔧 **Exact UI Navigation:**

### **To Send Commands:**

```
Unknown Service (0xFFE0)
  ↓ Expand
Unknown Characteristic (0xFFE2) - WRITE
  ↓ Tap this one
[Write Dialog Opens]
  ↓ Select "Text (UTF-8)"
  ↓ Type your command: TEST, ON, OFF, STATUS
  ↓ Tap "SEND"
```

### **To See Responses:**

```
Unknown Service (0xFFE0)
  ↓ Already expanded
Unknown Characteristic (0xFFE1) - NOTIFY, WRITE
  ↓ Tap this one
  ↓ Enable notifications (tap the notify icon)
  ↓ Responses will appear here automatically
```

## 📊 **You Should Also See Live Data:**

Every few seconds in the **0xFFE1** characteristic, you'll see:

```
📊 Live Data:
Steps: 3
Power: 28.45mV
Distance: No object
Buzzer: OFF
Device: HI TECH - Connected

HEARTBEAT:HI_TECH_CONNECTED
ADVERTISE:StrideSync_Device_Active
```

## ⚡ **Quick Test Sequence:**

1. **Enable notifications** on 0xFFE1 first
2. **Send `TEST`** via 0xFFE2
3. **Watch for response** in 0xFFE1
4. **Listen for buzzer beep** (0.5 seconds)
5. **Send `ON`** to turn buzzer on continuously
6. **Send `OFF`** to turn buzzer off
7. **Send `STATUS`** to get device info

## 🚨 **Troubleshooting:**

### **If No Response:**

- Make sure **notifications are enabled** on 0xFFE1
- Try sending **`TEST`** command first
- Check **Arduino Serial Monitor** - should show received commands

### **If Buzzer Doesn't Work:**

- Check your **wiring**: Buzzer positive → Pin 4, negative → GND
- **Upload the updated Arduino code** if you haven't already

### **Command Format:**

- **Use ALL CAPS**: `TEST`, `ON`, `OFF`, `STATUS`, `RESET`
- **No extra spaces** or characters
- **Select "Text (UTF-8)"** format in nRF Connect

## 🎉 **Success Indicators:**

✅ **Command sent successfully** - You see response in 0xFFE1  
✅ **Buzzer responds** - Makes sound when commanded  
✅ **Live data appears** - Regular updates every few seconds  
✅ **Arduino Serial Monitor** - Shows "Received command: TEST"

Try the **TEST** command first and let me know what response you get! 🚀
