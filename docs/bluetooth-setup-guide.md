# StrideSync - Real Bluetooth Setup Guide

## Overview

StrideSync has been updated to connect to real Bluetooth devices instead of using dummy data. The application now uses the Web Bluetooth API to communicate with:

1. **HC-05 Bluetooth modules** attached to Arduino-based smart shoes (production use)
2. **Mobile devices** for testing and demonstration (phones, tablets, laptops)

## What's Changed

### 🔄 **Replaced Mock Data with Real Bluetooth**

- ✅ **Bluetooth Service**: Created comprehensive Bluetooth service for device communication
- ✅ **Device Scanner**: Added UI for scanning and selecting nearby devices
- ✅ **Real-time Data**: Live data streaming from connected devices
- ✅ **Command Sending**: Ability to send commands (buzzer control) to device
- ✅ **Error Handling**: Proper error handling and user feedback
- ✅ **Session Tracking**: Real-time session timer and statistics
- ✅ **Mobile Testing**: Simulated data for mobile device connections

### 🛠 **New Features**

- **Universal Device Support**: Works with HC-05 modules AND mobile devices
- **Smart Detection**: Automatically detects device type and adapts functionality
- **Mobile Simulation**: Generates realistic sensor data when connected to phones/tablets
- **Connection Management**: Connect/disconnect with proper status indicators
- **Live Data Streaming**: Real-time steps, power, and buzzer status
- **Session Timer**: Track how long you've been connected and active
- **Buzzer Control**: Send commands to enable/disable the buzzer remotely
- **Enhanced UI**: Better connection states and error handling

## Testing Options

### 🚀 **Option 1: Mobile Device Testing (Recommended for Testing)**

**Perfect if you don't have HC-05 hardware yet!**

1. **Open the app** in Chrome, Edge, or Opera
2. **Click "Scan Devices"**
3. **Select any Bluetooth device** (your phone, tablet, Bluetooth headphones, etc.)
4. **Connect** - the app will simulate realistic fitness data
5. **Watch live data** - steps, power generation, and object detection

**What you'll see:**

- Simulated step counting (1-4 steps every 2 seconds)
- Realistic power generation (0.2-1.0 watts)
- Occasional object detection alerts
- All UI features working as intended

### 🛠 **Option 2: HC-05 Hardware (Production Use)**

For actual smart shoe implementation with real sensors.

## Hardware Requirements

### Arduino Setup

- **Microcontroller**: Arduino Uno, Nano, or ESP32
- **Bluetooth Module**: HC-05 or HC-06
- **Sensors**:
  - Step detection (accelerometer, gyroscope, or piezoelectric)
  - Power measurement (voltage/current sensors)
  - Object detection (ultrasonic, IR, or piezoelectric)
- **Buzzer**: For object detection alerts
- **Power Supply**: Battery pack for portability

### Wiring Diagram

```
HC-05 Module:
├── VCC → 3.3V (Arduino)
├── GND → GND (Arduino)
├── TXD → Digital Pin 2 (Arduino RX)
└── RXD → Digital Pin 3 (Arduino TX)

Sensors:
├── Step Sensor → Analog Pin A0
├── Power Sensor → Analog Pin A1
├── Object Sensor → Digital Pin 7
└── Buzzer → Digital Pin 8
```

## Software Setup

### 1. Arduino Code

Upload the provided Arduino sketch (`docs/arduino-example.ino`) to your Arduino:

```cpp
// Key features of the Arduino code:
// - Reads step count from sensors
// - Measures power generation
// - Detects objects for buzzer alerts
// - Sends data via Bluetooth in format: "STEPS:1234,POWER:0.52,BUZZER:1"
// - Receives commands like "BUZZER_ON", "BUZZER_OFF"
```

### 2. HC-05 Configuration

Configure your HC-05 module with these AT commands:

```
AT+NAME=StrideSync
AT+PSWD=1234
AT+UART=9600,0,0
AT+ROLE=0
```

### 3. Web Application

The web app now includes:

- **Bluetooth Service** (`src/lib/bluetooth-service.ts`)
- **Device Scanner** (`src/components/device-scanner.tsx`)
- **Updated Dashboard** (`src/components/dashboard.tsx`)

## How to Use

### 1. Prepare Your Device

1. Power on your StrideSync smart shoe
2. Ensure the HC-05 module is in pairing mode (LED blinking)
3. Make sure your Arduino is running the provided sketch

### 2. Connect via Web App

1. Open the StrideSync web application
2. Click "Scan Devices" button
3. Select your StrideSync device from the list
4. Wait for connection confirmation

### 3. Start Tracking

Once connected, the app will:

- Display real-time step count from your device
- Show live power generation data
- Update the power generation chart in real-time
- Allow you to control the buzzer remotely

### 4. Session Management

- **Session Timer**: Tracks your active session duration
- **Real-time Stats**: Shows current and average power generation
- **Data History**: Maintains last 30 data points for the chart

## Data Format

The Arduino sends data to the web app in this format:

```
STEPS:1234,POWER:0.52,BUZZER:1
```

Where:

- `STEPS`: Total step count since session start
- `POWER`: Current power generation in watts
- `BUZZER`: 1 if buzzer is active (object detected), 0 if inactive

## Commands

The web app can send these commands to the Arduino:

- `BUZZER_ON`: Enable buzzer for object detection
- `BUZZER_OFF`: Disable buzzer
- `RESET_STEPS`: Reset step counter to zero
- `STATUS`: Request immediate status update

## Browser Compatibility

### ✅ Supported Browsers

- Chrome 56+ (recommended)
- Edge 79+
- Opera 43+

### ❌ Not Supported

- Firefox (Web Bluetooth not implemented)
- Safari (Web Bluetooth not supported)
- Internet Explorer

### 🔒 Security Requirements

- **HTTPS Required**: Web Bluetooth only works on secure origins
- **User Gesture**: Bluetooth scanning requires user interaction
- **Permissions**: Browser will prompt for Bluetooth access

## Troubleshooting

### Connection Issues

1. **"Bluetooth not supported"**

   - Use Chrome, Edge, or Opera browser
   - Ensure you're on HTTPS (not HTTP)

2. **"No devices found"**

   - Check if HC-05 is powered and in pairing mode
   - Ensure device name is set to "StrideSync" or starts with "HC-05"
   - Move closer to the device (within 10 meters)

3. **"Connection failed"**
   - Reset the HC-05 module
   - Check Arduino code is running correctly
   - Verify wiring connections

### Data Issues

1. **No data received**

   - Check Arduino Serial monitor for data output
   - Verify Bluetooth baud rate (9600)
   - Ensure data format matches expected format

2. **Incorrect readings**
   - Calibrate sensors if needed
   - Check sensor connections
   - Adjust thresholds in Arduino code

### Performance Tips

1. **Optimize Data Rate**: Send data every 1-2 seconds (not faster)
2. **Battery Life**: Implement sleep modes when inactive
3. **Sensor Calibration**: Calibrate step detection for your walking pattern

## Development and Testing

### Testing Without Hardware

If you don't have the hardware yet, you can:

1. Use a smartphone with Bluetooth Serial apps
2. Create a simple ESP32 sketch to simulate data
3. Use Arduino IDE Serial Monitor to test data formats

### Adding New Features

The modular design makes it easy to add:

- Additional sensors (heart rate, temperature)
- Data logging and export
- Multiple device connections
- Advanced analytics

## Next Steps

1. **Test with Real Hardware**: Upload the Arduino code and test connectivity
2. **Calibrate Sensors**: Adjust thresholds for your specific sensors
3. **Customize Data**: Modify data format for additional sensor readings
4. **Enhance UI**: Add more visualizations or features as needed

## Support

For issues or questions:

1. Check the browser console for error messages
2. Monitor Arduino Serial output for debugging
3. Verify Bluetooth module configuration
4. Test individual components separately

The application is now ready for real-world use with actual Bluetooth devices! 🎉
