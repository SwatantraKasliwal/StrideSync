# 📱 HI TECH in Bluetooth LE - Connection Guide

## 🚨 **Your HC-05 Shows in Bluetooth LE Tab**

This is actually common with some HC-05 modules that have **dual-mode firmware** or newer versions that support both Classic and LE modes.

## 📱 **How to Connect via Bluetooth LE**

### **Method 1: Use Bluetooth LE Tab**

Since HI TECH appears in **Bluetooth LE**:

1. **Open Serial Bluetooth Terminal app**
2. **Go to "Bluetooth LE" tab** (where you see HI TECH)
3. **Tap "HI TECH"** to connect
4. **Look for "Nordic UART Service" or similar**
5. **Connect to the UART characteristic**

### **Method 2: Try Different Apps**

**App 1: "nRF Connect for Mobile"** ⭐⭐⭐⭐⭐

- Best for Bluetooth LE devices
- Shows all services and characteristics
- Download from Play Store: "nRF Connect"

**App 2: "BLE Scanner"**

- Specifically for Bluetooth LE
- Good for testing connections

**App 3: "LightBlue Explorer"**

- Professional BLE testing app

## 🔧 **Using nRF Connect (Recommended)**

### **Step 1: Download and Connect**

1. Install **"nRF Connect for Mobile"**
2. Open app → **"Scanner"**
3. Find **"HI TECH"** device
4. Tap **"CONNECT"**

### **Step 2: Find UART Service**

1. Look for **"Nordic UART Service"** or **"Unknown Service"**
2. Tap to expand the service
3. Look for **"TX Characteristic"** and **"RX Characteristic"**

### **Step 3: Send Commands**

1. Tap **"RX Characteristic"** (the one you write to)
2. Select **"Text (UTF-8)"** format
3. **Type your command**: `ON`, `OFF`, `STATUS`, `TEST`
4. Tap **"SEND"**

### **Step 4: Read Responses**

1. Tap **"TX Characteristic"** (the one you read from)
2. Enable **"Notify"** or **"Indicate"**
3. You'll see responses from Arduino in real-time

## 📝 **Command Examples in nRF Connect**

### **Send TEST Command:**

```
RX Characteristic → Write → Text → "TEST" → SEND
```

**Expected Response in TX Characteristic:**

```
>> Command received: TEST
✅ TEST SUCCESS
HI TECH is connected and responding!
```

### **Send ON Command:**

```
RX Characteristic → Write → Text → "ON" → SEND
```

**Expected Response:**

```
>> Command received: ON
✅ BUZZER ON
ACK:BUZZER_ON
```

## 🔄 **Alternative: Force Classic Mode**

If you want to force Bluetooth Classic mode:

### **Method 1: Check Android Settings**

1. **Android Settings** → **Bluetooth**
2. **Scan for devices**
3. Look for **"HI TECH"** there
4. **Pair** directly from settings

### **Method 2: Try Different Terminal Apps**

- **"Bluetooth Terminal"** (different from Serial Bluetooth Terminal)
- **"Arduino Bluetooth Control"**
- **"Bluetooth SPP Pro"**

## 🎯 **Quick Test Steps**

### **Using nRF Connect:**

1. **Connect** to HI TECH
2. **Find UART service** (usually first one listed)
3. **Send** `TEST` command via RX characteristic
4. **Enable notifications** on TX characteristic
5. **Watch for response** and buzzer beep

### **Using Serial Bluetooth Terminal:**

1. **Go to Bluetooth LE tab**
2. **Connect** to HI TECH
3. **Send** `TEST` command
4. **Watch for response**

## ⚡ **Why This Happens**

Your HC-05 module might be:

- **Newer version** with dual-mode support
- **Different firmware** that advertises as LE
- **Clone module** with modified behavior
- **HC-08 or similar** that looks like HC-05

This is **perfectly normal** - many modern "HC-05" modules support both modes.

## ✅ **Expected Behavior**

After connecting via Bluetooth LE:

```
=== StrideSync Connected! ===
Device: HI TECH
Type: HC05_DUAL_MODE
Commands: ON, OFF, STATUS, RESET, TEST
STATUS:READY
ADVERTISEMENT:StrideSync_HiTech_Ready
```

Plus live data every few seconds:

```
📊 Live Data:
Steps: 3
Power: 28.45mV
Distance: No object
Buzzer: OFF
Device: HI TECH - Connected
```

## 🚀 **What to Try First**

1. **Download nRF Connect app** (best for BLE)
2. **Connect to HI TECH** in the app
3. **Send TEST command** via UART service
4. **Check if buzzer beeps** and responses appear

Let me know what you see in nRF Connect! 📱⚡
