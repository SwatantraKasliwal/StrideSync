# StrideSync Smart Shoe

A real-time smart shoe monitoring system that connects Arduino-based sensors with a web application via HC-05 Bluetooth module.

## Features

✅ **Real-time Data Monitoring**
- Step counting
- Power generation tracking  
- Live data visualization
- Session history

✅ **Bluetooth HC-05 Integration**  
- Seamless connection to HI TECH HC-05 modules
- Real-time command/response communication
- Multiple service UUID support

✅ **Smart Buzzer Control**
- Remote buzzer activation/deactivation
- Real-time status feedback
- Test mode functionality

✅ **Modern Web Dashboard**
- Responsive design with Tailwind CSS
- Interactive charts and statistics
- Device connection management

## Hardware Requirements

### Arduino Setup
- **Arduino Uno** (or compatible)
- **HC-05 Bluetooth Module** (appears as "HI TECH")
- **Buzzer** for alerts
- **Jumper wires** and breadboard

### Wiring Diagram
```
HC-05 Module:
  VCC -> Arduino 5V
  GND -> Arduino GND  
  TXD -> Arduino Pin 2 (RX)
  RXD -> Arduino Pin 3 (TX)

Buzzer:
  + -> Arduino Pin 4
  - -> Arduino GND
```

## Arduino Code Setup

1. **IMPORTANT**: Disconnect HC-05 TX/RX wires (pins 2&3) before uploading
2. Upload `StrideSync_HC05_Final.ino` to your Arduino
3. Reconnect HC-05 TX/RX wires
4. Open Serial Monitor (9600 baud) to verify operation
5. Look for "✅ System ready" message

### Arduino Commands
- `TEST` - Buzzer beep test
- `BUZZER_ON` / `ON` - Turn buzzer on
- `BUZZER_OFF` / `OFF` - Turn buzzer off  
- `STATUS` - Get device status
- `RESET` - Reset step counter

## Web Application Setup

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd StrideSync

# Install dependencies
npm install

# Start development server  
npm run dev
```

### Environment Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Enable Bluetooth in your browser
3. Click "Scan for Devices"  
4. Select your "HI TECH" device
5. Click "Connect"

## Usage Guide

### Connecting to HC-05

1. **Power on** your Arduino with HC-05 module
2. **Verify** HC-05 LED is blinking (ready to pair)
3. **Open** StrideSync web app
4. **Click** "Scan for Devices" button
5. **Select** "HI TECH" from device list
6. **Wait** for connection (LED should become solid)
7. **Verify** data starts appearing on dashboard

### Dashboard Features

- **📊 Real-time Stats**: Steps, power, session time
- **📈 Power Chart**: Live power generation graph  
- **🔊 Buzzer Control**: Toggle buzzer on/off
- **📱 Device Info**: Connection status and device details
- **📋 Session Log**: Historical activity data

### Troubleshooting

**Connection Issues:**
- Ensure HC-05 is powered and blinking
- Check wiring connections
- Verify Arduino code is uploaded correctly
- Try refreshing the web page

**No Data Received:**
- Check Serial Monitor for Arduino output
- Verify HC-05 TX/RX wires are connected after upload
- Look for "📤 Data sent" messages in Serial Monitor

**Buzzer Not Working:**
- Check buzzer wiring (Pin 4, GND)
- Test with "TEST" command in Serial Monitor
- Verify buzzer polarity

## Development

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Bluetooth**: Web Bluetooth API
- **Charts**: Recharts
- **Hardware**: Arduino, HC-05 Bluetooth

### Project Structure
```
src/
├── app/          # Next.js app router
├── components/   # React components
│   ├── ui/       # shadcn/ui components  
│   └── dashboard.tsx
├── lib/          # Utility functions
│   └── bluetooth-service.ts
└── types/        # TypeScript definitions
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes  
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Arduino Serial Monitor output
3. Check browser console for errors
4. Open an issue on GitHub