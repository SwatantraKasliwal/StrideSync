# StrideSync - Smart Shoe Fitness Tracker

**Real-time step tracking and power generation monitoring with Bluetooth connectivity**

StrideSync is a Next.js web application that connects to smart shoes equipped with piezoelectric sensors to track steps, monitor power generation, and provide object detection alerts. The app now features **real Bluetooth connectivity** using the Web Bluetooth API instead of dummy data.

## 🚀 Features

### Real-time Tracking

- **Step Counter**: Live step count from connected smart shoe
- **Power Generation**: Monitor real-time and average power output
- **Session Timer**: Track active session duration
- **Power Visualization**: Interactive charts showing power generation over time

### Bluetooth Connectivity

- **Device Scanning**: Scan for nearby StrideSync devices
- **Live Connection**: Real-time data streaming from HC-05 Bluetooth modules
- **Remote Control**: Send commands to control buzzer and other features
- **Connection Management**: Robust error handling and reconnection

### Smart Features

- **Object Detection**: Buzzer alerts for obstacle detection
- **Activity History**: Track daily activity and power generation
- **Session Management**: Automatic session tracking with statistics

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Charts**: Recharts for data visualization
- **Bluetooth**: Web Bluetooth API for device communication
- **Hardware**: Arduino + HC-05 Bluetooth + Sensors

## 📱 Browser Support

- ✅ Chrome 56+ (recommended)
- ✅ Edge 79+
- ✅ Opera 43+
- ❌ Firefox (Web Bluetooth not supported)
- ❌ Safari (Web Bluetooth not supported)

**Note**: Requires HTTPS for Bluetooth functionality.

## 🔧 Hardware Requirements

To use with real hardware, you'll need:

- Arduino Uno/Nano/ESP32
- HC-05 Bluetooth module
- Step detection sensors (accelerometer/piezoelectric)
- Power measurement sensors
- Buzzer for alerts
- Optional: Object detection sensors

See [`docs/bluetooth-setup-guide.md`](docs/bluetooth-setup-guide.md) for detailed hardware setup.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- HTTPS environment (for Bluetooth)

### Installation

```bash
git clone https://github.com/your-username/stridesync.git
cd StrideSync
npm install
```

### Development

```bash
npm run dev
```

Open [https://localhost:9002](https://localhost:9002) in a supported browser.

### Building for Production

```bash
npm run build
npm start
```

## 📡 Connecting Your Device

1. **Prepare Hardware**: Upload the Arduino sketch from `docs/arduino-example.ino`
2. **Power On**: Ensure your StrideSync device is powered and in pairing mode
3. **Scan**: Click "Scan Devices" in the web app
4. **Connect**: Select your device from the list
5. **Start Tracking**: Begin walking to see real-time data

## 🔄 Data Format

The app expects data from Arduino in this format:

```
STEPS:1234,POWER:0.52,BUZZER:1
```

Commands sent to device:

- `BUZZER_ON` / `BUZZER_OFF`: Control buzzer
- `RESET_STEPS`: Reset step counter
- `STATUS`: Request immediate status

## 📊 Features Overview

### Dashboard

- Live step count display
- Real-time power generation monitoring
- Interactive power generation charts
- Connection status indicator
- Session statistics

### Device Management

- Bluetooth device scanner
- Connection status monitoring
- Error handling and reconnection
- Remote device control

### Activity Tracking

- Session timer
- Step count accumulation
- Power generation averaging
- Activity history (coming soon)

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## 📁 Project Structure

```
StrideSync/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── device-scanner.tsx # Bluetooth scanner
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── bluetooth-service.ts # Bluetooth connectivity
│   │   └── utils.ts        # Utilities
│   └── hooks/              # Custom React hooks
├── docs/
│   ├── bluetooth-setup-guide.md # Setup instructions
│   └── arduino-example.ino # Arduino code example
└── README.md
```

## 🎯 What's New (v2.0)

### ✅ Real Bluetooth Connectivity

- Replaced mock data with actual Bluetooth communication
- Added device scanning and pairing
- Real-time data streaming from hardware

### ✅ Enhanced UI

- Device scanner with connection management
- Better error handling and status indicators
- Session tracking with live timer

### ✅ Hardware Integration

- HC-05 Bluetooth module support
- Arduino code examples
- Sensor data parsing and processing

## 🔮 Roadmap

- [ ] Multi-device support
- [ ] Data export functionality
- [ ] Advanced analytics and insights
- [ ] Mobile app companion
- [ ] Cloud data synchronization
- [ ] Health platform integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with real hardware if possible
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For help with:

- **Hardware Setup**: See `docs/bluetooth-setup-guide.md`
- **Bluetooth Issues**: Check browser compatibility and HTTPS requirements
- **Development**: Create an issue on GitHub

---

**Ready to track your stride and power generation in real-time!** 👟⚡
